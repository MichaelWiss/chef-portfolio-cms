#!/usr/bin/env node

/**
 * Resolve the most reliable Postgres connection settings for Supabase by
 * probing multiple candidate endpoints (direct host, pooled host, raw URL, etc.)
 * until one succeeds. Emits a JSON payload describing the winning candidate.
 *
 * This script is intentionally dependency-light so it can execute during the
 * Strapi boot sequence via `execFileSync`.
 */

const { Client } = require('pg');
const dns = require('dns');

const env = process.env;

const forceIpv4 = (env.DATABASE_FORCE_IPV4 || 'true').toLowerCase() !== 'false';
const probeTimeout =
  Number.parseInt(env.SUPABASE_PROBE_TIMEOUT || '', 10) || 7000;
const connectionMode = (env.SUPABASE_CONNECTION_MODE || 'auto').toLowerCase();

const preferIpv4Lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    return dns.lookup(
      hostname,
      { family: 4, all: false },
      /** @type {Function} */ (options)
    );
  }
  const normalized =
    options && typeof options === 'object'
      ? { ...options, family: 4, all: false }
      : { family: 4, all: false };
  return dns.lookup(
    hostname,
    /** @type {dns.LookupOptions} */ (normalized),
    callback
  );
};

const toBool = (value, fallback) => {
  if (value === undefined) return fallback;
  const normalized = value.toString().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const parseUrl = (value) => {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const trimLeadingSlash = (value) =>
  value ? value.replace(/^\//, '') : value;

const extractProjectRefFromOptions = (options) => {
  if (!options) return null;
  const match = options.match(/project\s*=\s*([a-z0-9-]+)/i);
  return match ? match[1] : null;
};

const extractProjectRefFromHost = (host) => {
  if (!host) return null;
  const legacy = host.match(/^db\.([^.]+)\.supabase\.(co|com|net)$/);
  if (legacy) return legacy[1];
  const generic = host.match(/^([a-z0-9]{20,})\.(?:[a-z0-9-]+\.)*supabase\.(co|com|net)$/);
  if (generic) return generic[1];
  return null;
};

const baseUrl = parseUrl(env.DATABASE_URL);
const baseSearchParams = baseUrl
  ? Object.fromEntries(baseUrl.searchParams.entries())
  : {};

const inferProjectRef =
  env.SUPABASE_PROJECT_REF ||
  env.DATABASE_PROJECT ||
  extractProjectRefFromOptions(baseSearchParams.options) ||
  extractProjectRefFromHost(baseUrl && baseUrl.hostname);

const baseCredentials = {
  user:
    env.DATABASE_USERNAME ||
    (baseUrl ? decodeURIComponent(baseUrl.username || '') : '') ||
    'postgres',
  password:
    env.DATABASE_PASSWORD !== undefined
      ? env.DATABASE_PASSWORD
      : baseUrl
      ? decodeURIComponent(baseUrl.password || '')
      : '',
  database:
    env.DATABASE_NAME ||
    (baseUrl ? trimLeadingSlash(baseUrl.pathname) : '') ||
    'postgres',
};

const sslConfig = (() => {
  if (toBool(env.DATABASE_SSL, true)) {
    const rejectUnauthorized = toBool(
      env.DATABASE_SSL_REJECT_UNAUTHORIZED,
      false
    );
    const config = { rejectUnauthorized };
    if (env.DATABASE_SSL_CA) config.ca = env.DATABASE_SSL_CA;
    if (env.DATABASE_SSL_CERT) config.cert = env.DATABASE_SSL_CERT;
    if (env.DATABASE_SSL_KEY) config.key = env.DATABASE_SSL_KEY;
    return config;
  }
  return false;
})();

const orderMap = {
  direct: ['direct'],
  pooler: ['pooler'],
  url: ['url'],
  both: ['direct', 'pooler', 'url'],
  any: ['direct', 'pooler', 'url'],
  auto: ['direct', 'pooler', 'url'],
};
const attemptOrder = orderMap[connectionMode] || orderMap.auto;

const seenCandidates = new Set();
const candidates = [];

const addCandidate = (builder) => {
  const candidate = builder();
  if (!candidate) return;
  const key = `${candidate.mode}:${candidate.url.hostname}:${candidate.url.port || ''}`;
  if (seenCandidates.has(key)) return;
  seenCandidates.add(key);
  candidates.push(candidate);
};

const buildUrl = ({ host, port, searchParams = {}, omitParams = [] }) => {
  const url = new URL('postgresql://placeholder/placeholder');
  url.username = encodeURIComponent(baseCredentials.user);
  if (baseCredentials.password) {
    url.password = encodeURIComponent(baseCredentials.password);
  }
  url.hostname = host;
  if (port) url.port = String(port);
  url.pathname = `/${baseCredentials.database}`;

  const merged = { ...baseSearchParams, ...searchParams };
  for (const key of omitParams) {
    delete merged[key];
  }
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, value);
  }
  return url;
};

const DIRECT_PORT = env.SUPABASE_DIRECT_PORT || '5432';
const directHost =
  env.SUPABASE_DIRECT_HOST ||
  (inferProjectRef ? `db.${inferProjectRef}.supabase.co` : null);

const poolerHost =
  env.SUPABASE_POOLER_HOST ||
  (baseUrl ? baseUrl.hostname : null);
const poolerPort =
  env.SUPABASE_POOLER_PORT ||
  (baseUrl && baseUrl.port ? baseUrl.port : null);

const buildDirectCandidate = () => {
  if (!directHost) return null;
  const url = buildUrl({
    host: directHost,
    port: DIRECT_PORT,
    searchParams: {
      sslmode: baseSearchParams.sslmode || 'require',
    },
    omitParams: ['options', 'pgbouncer', 'connection_limit'],
  });
  return {
    mode: 'direct',
    url,
    description: 'Supabase direct database host',
  };
};

const buildPoolerCandidate = () => {
  if (!poolerHost) return null;
  const url = buildUrl({
    host: poolerHost,
    port: poolerPort || baseUrl?.port || '6543',
    searchParams: {
      sslmode: baseSearchParams.sslmode || 'require',
    },
  });
  if (!url.searchParams.get('options') && inferProjectRef) {
    url.searchParams.set('options', `project=${inferProjectRef}`);
  }
  return {
    mode: 'pooler',
    url,
    description: 'Supabase pooled host derived from DATABASE_URL',
  };
};

const buildRawUrlCandidate = () => {
  if (!baseUrl) return null;
  // Ensure sslmode present for consistency
  if (!baseUrl.searchParams.get('sslmode')) {
    baseUrl.searchParams.set('sslmode', 'require');
  }
  return {
    mode: 'url',
    url: new URL(baseUrl.toString()),
    description: 'Original DATABASE_URL',
  };
};

const buildIpv4HostCandidate = () => {
  if (!env.SUPABASE_IPV4_HOST) return null;
  const url = buildUrl({
    host: env.SUPABASE_IPV4_HOST,
    port: env.SUPABASE_IPV4_PORT || '5432',
    searchParams: {
      sslmode: baseSearchParams.sslmode || 'require',
    },
    omitParams: ['options'],
  });
  return {
    mode: 'direct-ipv4',
    url,
    description: 'Custom IPv4 host provided via SUPABASE_IPV4_HOST',
  };
};

const builders = {
  direct: buildDirectCandidate,
  pooler: buildPoolerCandidate,
  url: buildRawUrlCandidate,
  'direct-ipv4': buildIpv4HostCandidate,
};

for (const entry of attemptOrder) {
  const builder = builders[entry];
  if (builder) addCandidate(builder);
}
// Always allow explicit IPv4 host at the end if provided.
if (env.SUPABASE_IPV4_HOST) addCandidate(buildIpv4HostCandidate);

if (candidates.length === 0) {
  console.error(
    JSON.stringify({
      success: false,
      message:
        'No Supabase connection candidates could be derived from the environment.',
      suggestions: [
        'Set DATABASE_URL or DATABASE_HOST/DATABASE_PORT.',
        'Provide SUPABASE_PROJECT_REF for direct host detection.',
        'Override SUPABASE_CONNECTION_MODE=manual to skip probing.',
      ],
    })
  );
  process.exit(1);
}

const attempts = [];

const makeClientConfig = (url) => {
  const config = {
    connectionString: url.toString(),
    ssl: sslConfig,
    connectionTimeoutMillis: probeTimeout,
  };
  if (forceIpv4) {
    config.lookup = preferIpv4Lookup;
  }
  return config;
};

const tryCandidate = async (candidate) => {
  const attempt = {
    mode: candidate.mode,
    host: candidate.url.hostname,
    port: candidate.url.port ? Number(candidate.url.port) : undefined,
    description: candidate.description,
  };
  const clientConfig = makeClientConfig(candidate.url);
  const client = new Client(clientConfig);
  const startedAt = Date.now();
  try {
    await client.connect();
    attempt.success = true;
    attempt.durationMs = Date.now() - startedAt;
    return { attempt, success: true };
  } catch (error) {
    attempt.success = false;
    attempt.error = {
      message: error.message,
      code: error.code,
      errno: error.errno,
      detail: error.detail,
      name: error.name,
    };
    attempt.durationMs = Date.now() - startedAt;
    return { attempt, success: false };
  } finally {
    try {
      await client.end();
    } catch {
      // Ignore closing errors
    }
  }
};

const run = async () => {
  for (const candidate of candidates) {
    const { attempt, success } = await tryCandidate(candidate);
    attempts.push(attempt);
    if (success) {
      const result = {
        success: true,
        mode: candidate.mode,
        host: candidate.url.hostname,
        port: candidate.url.port ? Number(candidate.url.port) : 5432,
        database: baseCredentials.database,
        user: baseCredentials.user,
        connectionString: candidate.url.toString(),
        options: candidate.url.searchParams.get('options') || null,
        sslmode: candidate.url.searchParams.get('sslmode') || null,
        lookup: forceIpv4 ? 'ipv4' : 'default',
        attempts,
      };
      console.log(JSON.stringify(result));
      return;
    }
  }
  console.error(
    JSON.stringify({
      success: false,
      message:
        'All Supabase connection probes failed. Review the attempt list for details.',
      attempts,
      suggestions: [
        'Verify SUPABASE_PROJECT_REF and DATABASE_URL values.',
        'Ensure the database allows IPv4 connections from this environment.',
        'Temporarily set SUPABASE_CONNECTION_MODE=manual to use the legacy configuration.',
      ],
    })
  );
  process.exit(1);
};

run().catch((error) => {
  console.error(
    JSON.stringify({
      success: false,
      message: error.message,
      stack: error.stack,
    })
  );
  process.exit(1);
});

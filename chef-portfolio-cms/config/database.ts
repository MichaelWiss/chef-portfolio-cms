import path from 'path';
import { Buffer } from 'buffer';
import dns from 'dns';
import { execFileSync } from 'child_process';

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Ignore environments where DNS preference cannot be set (older Node versions)
}

const normalizeLookupOptions = (
  options?: dns.LookupOneOptions | dns.LookupAllOptions | number
) => {
  if (typeof options === 'number') {
    return { family: 4, all: false };
  }
  if (options && typeof options === 'object') {
    return { ...options, family: 4, all: false };
  }
  return { family: 4, all: false };
};

function preferIpv4LookupImpl(
  hostname: string,
  options:
    | dns.LookupOneOptions
    | dns.LookupAllOptions
    | number
    | ((err: NodeJS.ErrnoException | null, address: string, family: number) => void)
    | undefined,
  callback?: (err: NodeJS.ErrnoException | null, address: string, family: number) => void
) {
  if (typeof options === 'function') {
    return dns.lookup(hostname, normalizeLookupOptions(undefined), options);
  }

  return dns.lookup(
    hostname,
    normalizeLookupOptions(
      options as dns.LookupOneOptions | dns.LookupAllOptions | number | undefined
    ),
    callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void
  );
}

const preferIpv4Lookup: typeof dns.lookup = Object.assign(
  preferIpv4LookupImpl as typeof dns.lookup,
  {
    __promisify__(hostname: string, options?: dns.LookupOneOptions | dns.LookupAllOptions | number) {
      return dns.promises.lookup(
        hostname,
        normalizeLookupOptions(
          options as dns.LookupOneOptions | dns.LookupAllOptions | number | undefined
        )
      ) as Promise<any>;
    },
  }
);

const SUPABASE_PROBE_SCRIPT = String.raw`const { Client } = require('pg');
const dns = require('dns');

function toBool(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).toLowerCase();
  if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') return true;
  if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') return false;
  return fallback;
}

function parseUrl(value) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch (err) {
    return null;
  }
}

function trimLeadingSlash(value) {
  return value ? value.replace(/^\\//, '') : value;
}

function extractProjectRefFromOptions(options) {
  if (!options) return null;
  const match = options.match(/project\\s*=\\s*([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

function extractProjectRefFromHost(host) {
  if (!host) return null;
  let legacy = host.match(/^db\\.([^.]+)\\.supabase\\.(co|com|net)$/);
  if (legacy) return legacy[1];
  const generic = host.match(/^([a-z0-9]{20,})\\.(?:[a-z0-9-]+\\.)*supabase\\.(co|com|net)$/);
  return generic ? generic[1] : null;
}

const env = process.env;
const forceIpv4 = toBool(env.DATABASE_FORCE_IPV4, true);
const connectionMode = (env.SUPABASE_CONNECTION_MODE || 'auto').toLowerCase();
const probeTimeout = parseInt(env.SUPABASE_PROBE_TIMEOUT || '', 10) || 7000;

const baseUrl = parseUrl(env.DATABASE_URL);
const baseParams = baseUrl ? Object.fromEntries(baseUrl.searchParams.entries()) : {};

const inferProjectRef =
  env.SUPABASE_PROJECT_REF ||
  env.DATABASE_PROJECT ||
  extractProjectRefFromOptions(baseParams.options) ||
  (baseUrl ? extractProjectRefFromHost(baseUrl.hostname) : null);

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

function buildConnectionUrl(host, port, overrides, omitKeys) {
  const userPart = encodeURIComponent(baseCredentials.user || '');
  const passwordPart = baseCredentials.password
    ? ':' + encodeURIComponent(baseCredentials.password)
    : '';
  const authority = userPart + passwordPart + '@' + host + (port ? ':' + port : '');
  const databasePart = baseCredentials.database || 'postgres';
  const url = new URL('postgresql://' + authority + '/' + databasePart);
  const merged = Object.assign({}, baseParams, overrides || {});
  if (omitKeys) {
    for (const key of omitKeys) {
      delete merged[key];
    }
  }
  for (const key of Object.keys(merged)) {
    const value = merged[key];
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, value);
  }
  return url;
}

const ssl = (function () {
  if (toBool(env.DATABASE_SSL, true)) {
    const rejectUnauthorized = toBool(env.DATABASE_SSL_REJECT_UNAUTHORIZED, false);
    const config = { rejectUnauthorized };
    if (env.DATABASE_SSL_CA) config.ca = env.DATABASE_SSL_CA;
    if (env.DATABASE_SSL_CERT) config.cert = env.DATABASE_SSL_CERT;
    if (env.DATABASE_SSL_KEY) config.key = env.DATABASE_SSL_KEY;
    return config;
  }
  return false;
})();

const attemptPatterns = {
  auto: ['direct', 'pooler', 'url'],
  any: ['direct', 'pooler', 'url'],
  both: ['direct', 'pooler', 'url'],
  direct: ['direct'],
  pooler: ['pooler'],
  url: ['url'],
};

const order = attemptPatterns[connectionMode] || attemptPatterns.auto;

const candidates = [];
const seen = new Set();

function addCandidate(builder) {
  const candidate = builder();
  if (!candidate) return;
  const key = candidate.mode + ':' + candidate.url.hostname + ':' + (candidate.url.port || '');
  if (seen.has(key)) return;
  seen.add(key);
  candidates.push(candidate);
}

function buildDirectCandidate() {
  const project = inferProjectRef;
  if (!project) return null;
  const host = env.SUPABASE_DIRECT_HOST || ('db.' + project + '.supabase.co');
  const port = env.SUPABASE_DIRECT_PORT || '5432';
  const url = buildConnectionUrl(
    host,
    port,
    { sslmode: baseParams.sslmode || 'require' },
    ['options', 'pgbouncer', 'connection_limit']
  );
  return { mode: 'direct', url, description: 'Supabase direct host' };
}

function buildPoolerCandidate() {
  const host = env.SUPABASE_POOLER_HOST || (baseUrl ? baseUrl.hostname : null);
  if (!host) return null;
  const port = env.SUPABASE_POOLER_PORT || (baseUrl && baseUrl.port ? baseUrl.port : '6543');
  const url = buildConnectionUrl(
    host,
    port,
    { sslmode: baseParams.sslmode || 'require' }
  );
  if (!url.searchParams.get('options') && inferProjectRef) {
    url.searchParams.set('options', 'project=' + inferProjectRef);
  }
  return { mode: 'pooler', url, description: 'Supabase pooled host' };
}

function buildRawUrlCandidate() {
  if (!baseUrl) return null;
  const url = new URL(baseUrl.toString());
  if (!url.searchParams.get('sslmode')) {
    url.searchParams.set('sslmode', 'require');
  }
  return { mode: 'url', url, description: 'Original DATABASE_URL' };
}

function buildCustomIpv4Candidate() {
  if (!env.SUPABASE_IPV4_HOST) return null;
  const port = env.SUPABASE_IPV4_PORT || '5432';
  const url = buildConnectionUrl(
    env.SUPABASE_IPV4_HOST,
    port,
    { sslmode: baseParams.sslmode || 'require' },
    ['options']
  );
  return { mode: 'direct-ipv4', url, description: 'Custom IPv4 host' };
}

const builders = {
  direct: buildDirectCandidate,
  pooler: buildPoolerCandidate,
  url: buildRawUrlCandidate,
};

for (const entry of order) {
  const builder = builders[entry];
  if (builder) addCandidate(builder);
}

if (env.SUPABASE_IPV4_HOST) {
  addCandidate(buildCustomIpv4Candidate);
}

if (candidates.length === 0) {
  console.error(
    JSON.stringify({
      success: false,
      message: 'No Supabase connection candidates could be derived from the environment.',
      suggestions: [
        'Set DATABASE_URL or DATABASE_HOST/DATABASE_PORT.',
        'Provide SUPABASE_PROJECT_REF for direct host detection.',
        'Override SUPABASE_CONNECTION_MODE=manual to skip probing.'
      ],
    })
  );
  process.exit(1);
}

function preferLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    return dns.lookup(hostname, { family: 4, all: false }, options);
  }
  const normalized =
    options && typeof options === 'object'
      ? Object.assign({}, options, { family: 4, all: false })
      : { family: 4, all: false };
  return dns.lookup(hostname, normalized, callback);
}

preferLookup.__promisify__ = function (hostname, options) {
  const normalized =
    options && typeof options === 'object'
      ? Object.assign({}, options, { family: 4, all: false })
      : { family: 4, all: false };
  return dns.promises.lookup(hostname, normalized);
};

const attempts = [];

async function tryCandidate(candidate) {
  const attempt = {
    mode: candidate.mode,
    host: candidate.url.hostname,
    port: candidate.url.port ? Number(candidate.url.port) : undefined,
    description: candidate.description,
  };
  const clientConfig = {
    connectionString: candidate.url.toString(),
    ssl,
    connectionTimeoutMillis: probeTimeout,
  };
  if (forceIpv4) {
    clientConfig.lookup = preferLookup;
  }
  const client = new Client(clientConfig);
  const started = Date.now();
  try {
    await client.connect();
    attempt.success = true;
    attempt.durationMs = Date.now() - started;
    return { success: true, attempt };
  } catch (error) {
    attempt.success = false;
    attempt.error = {
      message: error && error.message,
      code: error && error.code,
    };
    attempt.durationMs = Date.now() - started;
    return { success: false, attempt };
  } finally {
    try {
      await client.end();
    } catch (err) {
      // ignore
    }
  }
}

(async function run() {
  for (const candidate of candidates) {
    const result = await tryCandidate(candidate);
    attempts.push(result.attempt);
    if (result.success) {
      const url = candidate.url;
      console.log(
        JSON.stringify({
          success: true,
          mode: candidate.mode,
          host: url.hostname,
          port: url.port ? Number(url.port) : 5432,
          database: baseCredentials.database,
          user: baseCredentials.user,
          connectionString: url.toString(),
          options: url.searchParams.get('options') || null,
          sslmode: url.searchParams.get('sslmode') || null,
          lookup: forceIpv4 ? 'ipv4' : 'default',
          attempts,
        })
      );
      return;
    }
  }

  console.error(
    JSON.stringify({
      success: false,
      message: 'All Supabase connection probes failed. Review attempts for details.',
      attempts,
      suggestions: [
        'Verify SUPABASE_PROJECT_REF and DATABASE_URL values.',
        'Ensure the database allows IPv4 connections.',
        'Set SUPABASE_CONNECTION_MODE=manual to bypass probing.',
      ],
    })
  );
  process.exit(1);
})().catch(function (error) {
  console.error(
    JSON.stringify({
      success: false,
      message: error && error.message,
      stack: error && error.stack,
    })
  );
  process.exit(1);
});
`;
export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const rawCa = env('DATABASE_SSL_CA');
  const base64Ca = env('DATABASE_SSL_CA_BASE64');
  // Normalize and decode base64 CA (strip quotes/whitespace if pasted with quotes)
  const normalizedBase64 = base64Ca ? base64Ca.trim().replace(/^"|"$/g, '').replace(/\s+/g, '') : null;
  const sslCa = normalizedBase64 ? Buffer.from(normalizedBase64, 'base64').toString('utf8') : rawCa;

  let forceIpv4Lookup = env.bool('DATABASE_FORCE_IPV4', true);
  const databaseProjectEnv = env('DATABASE_PROJECT', undefined) as string | undefined;
  const supabaseProjectRefEnv = env('SUPABASE_PROJECT_REF', databaseProjectEnv) as string | undefined;
  const supabaseProjectRef = supabaseProjectRefEnv ? supabaseProjectRefEnv.trim() : undefined;

  type SupabaseOption = { value: string; source: 'env' | 'hostname' };
  const getSupabaseProjectOption = (host?: string | null): SupabaseOption | null => {
    if (supabaseProjectRef) {
      return { value: `project=${supabaseProjectRef}`, source: 'env' };
    }
    if (!host) return null;
    const legacyMatch = host.match(/^db\.([^.]+)\.supabase\.(co|com|net)$/);
    if (legacyMatch) {
      return { value: `project=${legacyMatch[1]}`, source: 'hostname' };
    }
    const bareMatch = host.match(/^([^.]+)\.supabase\.(co|com|net)$/);
    if (bareMatch && /^[a-z0-9]{20}$/i.test(bareMatch[1])) {
      return { value: `project=${bareMatch[1]}`, source: 'hostname' };
    }
    return null;
  };

  let databaseUrl = env('DATABASE_URL', undefined) as string | undefined;
  const databaseOptionsEnv = env('DATABASE_OPTIONS', undefined) as string | undefined;
  const databaseSslModeEnv = env('DATABASE_SSLMODE', undefined) as string | undefined;
  const supabaseConnectionMode = env('SUPABASE_CONNECTION_MODE', 'auto').toLowerCase();
  const enableProbe =
    client === 'postgres' &&
    supabaseConnectionMode !== 'manual' &&
    env.bool('SUPABASE_ENABLE_PROBE', true);

  let normalizedPgConnectionString = databaseUrl;
  let finalPgOptions = databaseOptionsEnv || undefined;
  let finalPgOptionsSource: 'env' | 'hostname' | 'url' | 'probe' | undefined = databaseOptionsEnv ? 'env' : undefined;
  let finalPgSslMode = databaseSslModeEnv || undefined;
  let connectionMode: 'standard' | 'pooler' | 'direct' = 'standard';
  let probeAttemptsSummary: Array<{ mode: string; host: string; port?: number; success: boolean }> = [];

  if (enableProbe) {
    try {
      const execOutput = execFileSync(process.execPath, ['-e', SUPABASE_PROBE_SCRIPT], {
        env: {
          ...process.env,
          SUPABASE_CONNECTION_MODE: supabaseConnectionMode,
          DATABASE_FORCE_IPV4: forceIpv4Lookup ? 'true' : 'false',
        },
        encoding: 'utf8',
      });
      const lines = execOutput.trim().split(/\r?\n/);
      const jsonLine = lines.pop();
      if (jsonLine) {
        const parsed = JSON.parse(jsonLine);
        if (parsed && parsed.success && parsed.connectionString) {
          databaseUrl = parsed.connectionString as string;
          normalizedPgConnectionString = parsed.connectionString as string;
          if (parsed.options) {
            finalPgOptions = parsed.options as string;
            finalPgOptionsSource = 'probe';
          } else if (!finalPgOptions) {
            finalPgOptions = undefined;
            finalPgOptionsSource = finalPgOptionsSource ?? 'probe';
          }
          if (parsed.sslmode) {
            finalPgSslMode = parsed.sslmode as string;
          }
          if (parsed.lookup === 'ipv4') {
            forceIpv4Lookup = true;
          }
          if (parsed.mode === 'pooler' || parsed.mode === 'direct') {
            connectionMode = parsed.mode;
          }
          probeAttemptsSummary = Array.isArray(parsed.attempts)
            ? parsed.attempts.map((attempt: any) => ({
                mode: attempt.mode,
                host: attempt.host,
                port: attempt.port,
                success: attempt.success === true,
              }))
            : [];
        } else {
          console.warn(
            '[database] Supabase connection probe did not return a successful candidate; falling back to manual configuration.'
          );
        }
      }
    } catch (error: any) {
      const parseJson = (value?: string) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return null;
        }
      };
      const stderr = error?.stderr ? error.stderr.toString() : '';
      const stdout = error?.stdout ? error.stdout.toString() : '';
      const parsedError = parseJson(stderr) || parseJson(stdout);
      if (parsedError?.attempts && Array.isArray(parsedError.attempts)) {
        probeAttemptsSummary = parsedError.attempts.map((attempt: any) => ({
          mode: attempt.mode,
          host: attempt.host,
          port: attempt.port,
          success: attempt.success === true,
        }));
      }
      const message =
        (parsedError && parsedError.message) ||
        error?.message ||
        'Unknown probe failure';
      console.warn(
        `[database] Supabase connection probe failed (${message}). Falling back to manual configuration.`
      );
    }
  }

  let parsedPg: {
    host: string;
    port: number;
    database?: string;
    user: string;
    password: string;
  } | null = null;

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      const existingOptions = url.searchParams.get('options') || undefined;
      const existingSslMode = url.searchParams.get('sslmode') || undefined;
      const supabaseOptionFromUrl = getSupabaseProjectOption(url.hostname);
      const hostname = url.hostname.toLowerCase();
      if (hostname.includes('.pooler.supabase.')) {
        connectionMode = 'pooler';
      } else if (hostname.includes('.supabase.')) {
        connectionMode = 'direct';
      }

      if (!finalPgOptions) {
        if (existingOptions) {
          finalPgOptions = existingOptions;
          finalPgOptionsSource = 'url';
        } else if (supabaseOptionFromUrl) {
          finalPgOptions = supabaseOptionFromUrl.value;
          finalPgOptionsSource = supabaseOptionFromUrl.source;
        }
      }

      if (finalPgOptions) {
        url.searchParams.set('options', finalPgOptions);
      } else if (existingOptions) {
        url.searchParams.delete('options');
      }

      if (finalPgSslMode) {
        url.searchParams.set('sslmode', finalPgSslMode);
      } else if (existingSslMode) {
        url.searchParams.delete('sslmode');
      }

      normalizedPgConnectionString = url.toString();
      parsedPg = {
        host: url.hostname,
        port: url.port ? parseInt(url.port, 10) : 5432,
        database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
        user: decodeURIComponent(url.username || ''),
        password: decodeURIComponent(url.password || ''),
      };
    } catch {
      parsedPg = null;
    }
  }

  let resolvedHost = parsedPg?.host || env('DATABASE_HOST', 'localhost');
  let resolvedPort = parsedPg?.port || env.int('DATABASE_PORT', 5432);
  const resolvedDatabase = parsedPg?.database || env('DATABASE_NAME', 'strapi');
  const resolvedUser = parsedPg?.user || env('DATABASE_USERNAME', 'strapi');
  const resolvedPassword = parsedPg?.password || env('DATABASE_PASSWORD', 'strapi');

  if (!finalPgOptions) {
    const derived = getSupabaseProjectOption(resolvedHost);
    if (derived) {
      finalPgOptions = derived.value;
      finalPgOptionsSource = derived.source;
    }
  }

  const hostLower = typeof resolvedHost === 'string' ? resolvedHost.toLowerCase() : '';
  let isSupabaseHost = hostLower.includes('.supabase.');
  let isSupabasePoolerHost = hostLower.includes('.pooler.supabase.');

  const useSupabasePooler = env.bool(
    'SUPABASE_USE_POOLER',
    isSupabasePoolerHost || connectionMode === 'pooler'
  );

  if (
    client === 'postgres' &&
    isSupabasePoolerHost &&
    !useSupabasePooler &&
    supabaseProjectRef
  ) {
    const directHost = `db.${supabaseProjectRef}.supabase.co`;
    let directUrl: URL | null = null;
    if (databaseUrl) {
      try {
        directUrl = new URL(databaseUrl);
        directUrl.hostname = directHost;
        directUrl.port = '5432';
        directUrl.searchParams.delete('options');
        if (finalPgSslMode) {
          directUrl.searchParams.set('sslmode', finalPgSslMode);
        }
      } catch {
        directUrl = null;
      }
    }
    normalizedPgConnectionString =
      directUrl?.toString() ||
      `postgresql://${encodeURIComponent(resolvedUser)}:${encodeURIComponent(
        resolvedPassword
      )}@${directHost}:5432/${resolvedDatabase}`;
    resolvedHost = directHost;
    resolvedPort = 5432;
    finalPgOptions = undefined;
    finalPgOptionsSource = undefined;
    isSupabaseHost = true;
    isSupabasePoolerHost = false;
    connectionMode = 'direct';
  }

  if (client === 'postgres' && isSupabaseHost && !finalPgOptions && useSupabasePooler) {
    console.warn(
      '[database] Supabase host detected but no project option provided. Set SUPABASE_PROJECT_REF or DATABASE_OPTIONS to avoid pooled connection errors.'
    );
  }

  const logDbConnectionDetails = env.bool('LOG_DB_CONNECTION_DETAILS', false);
  if (client === 'postgres' && logDbConnectionDetails) {
    const connectionSummary = {
      host: resolvedHost,
      port: resolvedPort,
      schema: env('DATABASE_SCHEMA', 'public'),
      options: finalPgOptions || 'none',
      optionsSource: finalPgOptionsSource || 'unset',
      connectionStringIncludesOptions:
        typeof normalizedPgConnectionString === 'string'
          ? normalizedPgConnectionString.includes('options=')
          : false,
      connectionMode,
      forceIpv4Lookup,
      probeAttempts: probeAttemptsSummary,
    };
    console.info('[database] Resolved Postgres connection', connectionSummary);
  }

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: sslCa,
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        // Preserve the normalized connection string so pooled providers (e.g. Supabase) keep query params
        ...(normalizedPgConnectionString ? { connectionString: normalizedPgConnectionString } : {}),
        host: resolvedHost,
        port: resolvedPort,
        database: resolvedDatabase,
        user: resolvedUser,
        password: resolvedPassword,
        ssl: env.bool('DATABASE_SSL', true) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: sslCa,
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
        ...(finalPgOptions ? { options: finalPgOptions } : {}),
        ...(forceIpv4Lookup ? { lookup: preferIpv4Lookup } : {}),
      },
      pool: { 
        min: env.int('DATABASE_POOL_MIN', 2), 
        max: env.int('DATABASE_POOL_MAX', 10),
        acquireTimeoutMillis: env.int('DATABASE_ACQUIRE_TIMEOUT', 60000),
        createTimeoutMillis: env.int('DATABASE_CREATE_TIMEOUT', 30000),
        destroyTimeoutMillis: env.int('DATABASE_DESTROY_TIMEOUT', 5000),
        idleTimeoutMillis: env.int('DATABASE_IDLE_TIMEOUT', 30000),
        reapIntervalMillis: env.int('DATABASE_REAP_INTERVAL', 1000),
        createRetryIntervalMillis: env.int('DATABASE_CREATE_RETRY_INTERVAL', 100),
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

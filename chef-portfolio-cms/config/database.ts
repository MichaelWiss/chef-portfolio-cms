import path from 'path';
import { Buffer } from 'buffer';
import dns from 'dns';
import { execFileSync } from 'child_process';

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {
  // Ignore environments where the API is unavailable.
}

const toBool = (value: any, fallback: boolean) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const toInt = (value: any, fallback: number) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseUrl = (value?: string | null) => {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const trimLeadingSlash = (value?: string | null) => {
  if (!value) return value;
  return value.replace(/^\/+/, '');
};

const extractProjectRefFromHost = (host?: string | null) => {
  if (!host) return null;
  const legacy = host.match(/^db\.([^.]+)\.supabase\.(co|com|net)$/);
  if (legacy) return legacy[1];
  const generic = host.match(/^([a-z0-9]{20,})\.(?:[a-z0-9-]+\.)*supabase\.(co|com|net)$/);
  return generic ? generic[1] : null;
};

const extractProjectRefFromOptions = (options?: string | null) => {
  if (!options) return null;
  const match = options.match(/project\s*=\s*([a-z0-9-]+)/i);
  return match ? match[1] : null;
};

const resolveIpv4Address = (host: string): string | null => {
  if (!host || /^[0-9.]+$/.test(host)) {
    return host;
  }
  try {
    const script = `
const dns = require('dns');
const host = process.argv[2];
dns.lookup(host, { family: 4, all: false }, (err, address) => {
  if (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  } else {
    console.log(address);
    process.exit(0);
  }
});
`;
    const output = execFileSync(process.execPath, ['-e', script, host], {
      encoding: 'utf8',
    })
      .trim()
      .split(/\r?\n/)
      .pop();
    if (output && /^[0-9.]+$/.test(output)) {
      return output;
    }
  } catch (error) {
    console.warn(
      `[database] IPv4 resolution failed for host ${host}: ${(error as Error).message || 'unknown error'}`
    );
  }
  return null;
};

const preferIpv4Lookup = (hostname: string, options?: any, callback?: any) => {
  if (typeof options === 'function') {
    return dns.lookup(hostname, { family: 4, all: false }, options);
  }
  const normalized =
    options && typeof options === 'object'
      ? { ...options, family: 4, all: false }
      : { family: 4, all: false };
  return dns.lookup(hostname, normalized as dns.LookupOptions, callback as any);
};

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const rawCa = env('DATABASE_SSL_CA');
  const base64Ca = env('DATABASE_SSL_CA_BASE64');
  const normalizedBase64 = base64Ca ? base64Ca.trim().replace(/^"|"$/g, '').replace(/\s+/g, '') : null;
  const sslCa = normalizedBase64 ? Buffer.from(normalizedBase64, 'base64').toString('utf8') : rawCa;

  const databaseUrl = parseUrl(env('DATABASE_URL'));
  const directProjectRef = env('SUPABASE_PROJECT_REF') || env('DATABASE_PROJECT');
  const databaseOptionsEnv = env('DATABASE_OPTIONS');
  const poolerHostEnv = env('SUPABASE_POOLER_HOST');
  const poolerPortEnv = env('SUPABASE_POOLER_PORT');
  const forceIpv4Lookup = toBool(env('DATABASE_FORCE_IPV4'), true);

  const postgresDefaults = {
    host: env('DATABASE_HOST', databaseUrl?.hostname || 'localhost'),
    port: toInt(env('DATABASE_PORT', databaseUrl?.port), 5432),
    database: env('DATABASE_NAME', trimLeadingSlash(databaseUrl?.pathname) || 'strapi'),
    user: env('DATABASE_USERNAME', decodeURIComponent(databaseUrl?.username || '') || 'strapi'),
    password: env('DATABASE_PASSWORD', decodeURIComponent(databaseUrl?.password || '') || 'strapi'),
  };

  let resolvedHost = postgresDefaults.host;
  let resolvedPort = postgresDefaults.port;
  let resolvedDatabase = postgresDefaults.database;
  let resolvedUser = postgresDefaults.user;
  let resolvedPassword = postgresDefaults.password;

  let finalOptions = databaseOptionsEnv || databaseUrl?.searchParams.get('options') || undefined;
  const usePooler = toBool(env('SUPABASE_USE_POOLER'), false);

  if (!finalOptions) {
    const inferredRef =
      directProjectRef ||
      extractProjectRefFromOptions(databaseUrl?.searchParams.get('options') || undefined) ||
      extractProjectRefFromHost(resolvedHost);
    if (inferredRef) {
      finalOptions = `project=${inferredRef}`;
    }
  }

  if (usePooler) {
    if (poolerHostEnv) {
      resolvedHost = poolerHostEnv;
    } else if (databaseUrl && databaseUrl.hostname && !databaseUrl.hostname.startsWith('db.')) {
      resolvedHost = databaseUrl.hostname;
    } else {
      console.warn(
        '[database] SUPABASE_USE_POOLER is true but SUPABASE_POOLER_HOST is not set and DATABASE_URL points to the direct host. Provide SUPABASE_POOLER_HOST (e.g. aws-xyz.pooler.supabase.com) and SUPABASE_POOLER_PORT as needed.'
      );
    }
    resolvedPort = poolerPortEnv ? toInt(poolerPortEnv, 6543) : toInt(databaseUrl?.port, 6543);
  } else if (directProjectRef) {
    resolvedHost = `db.${directProjectRef}.supabase.co`;
    resolvedPort = 5432;
    finalOptions = undefined;
  }

  let ipv4ResolutionFailed = false;
  if (forceIpv4Lookup && resolvedHost) {
    const ipv4 = resolveIpv4Address(resolvedHost);
    if (ipv4) {
      resolvedHost = ipv4;
    } else if (!/^[0-9.]+$/.test(resolvedHost)) {
      ipv4ResolutionFailed = true;
    }
  }

  const logDbConnectionDetails = toBool(env('LOG_DB_CONNECTION_DETAILS'), false);

  if (client === 'postgres' && logDbConnectionDetails) {
    console.info('[database] Resolved Postgres connection', {
      host: resolvedHost,
      port: resolvedPort,
      database: resolvedDatabase,
      user: resolvedUser,
      options: finalOptions || 'none',
      forceIpv4Lookup,
      ipv4ResolutionFailed,
    });
    if (ipv4ResolutionFailed && !usePooler) {
      console.warn(
        '[database] No IPv4 address found for Supabase host. Consider enabling SUPABASE_USE_POOLER=true and setting SUPABASE_POOLER_HOST/SUPABASE_POOLER_PORT to Supabase\'s pooled endpoint.'
      );
    }
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
        host: resolvedHost,
        port: resolvedPort,
        database: resolvedDatabase,
        user: resolvedUser,
        password: resolvedPassword,
        schema: env('DATABASE_SCHEMA', 'public'),
        ssl: env.bool('DATABASE_SSL', true) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: sslCa,
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        ...(finalOptions ? { options: finalOptions } : {}),
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

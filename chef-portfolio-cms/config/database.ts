import path from 'path';
import { Buffer } from 'buffer';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const rawCa = env('DATABASE_SSL_CA');
  const base64Ca = env('DATABASE_SSL_CA_BASE64');
  // Normalize and decode base64 CA (strip quotes/whitespace if pasted with quotes)
  const normalizedBase64 = base64Ca ? base64Ca.trim().replace(/^"|"$/g, '').replace(/\s+/g, '') : null;
  const sslCa = normalizedBase64 ? Buffer.from(normalizedBase64, 'base64').toString('utf8') : rawCa;

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

  const databaseUrl = env('DATABASE_URL', undefined) as string | undefined;
  const databaseOptionsEnv = env('DATABASE_OPTIONS', undefined) as string | undefined;
  const databaseSslModeEnv = env('DATABASE_SSLMODE', undefined) as string | undefined;

  let parsedPg: {
    host: string;
    port: number;
    database?: string;
    user: string;
    password: string;
  } | null = null;
  let normalizedPgConnectionString = databaseUrl;
  let finalPgOptions = databaseOptionsEnv || undefined;
  let finalPgOptionsSource: 'env' | 'hostname' | 'url' | undefined = databaseOptionsEnv ? 'env' : undefined;
  let finalPgSslMode = databaseSslModeEnv || undefined;
  let connectionMode: 'standard' | 'pooler' | 'direct' = 'standard';

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

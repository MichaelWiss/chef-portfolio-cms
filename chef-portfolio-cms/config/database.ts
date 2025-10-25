import path from 'path';
import { Buffer } from 'buffer';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const rawCa = env('DATABASE_SSL_CA');
  const base64Ca = env('DATABASE_SSL_CA_BASE64');
  // Normalize and decode base64 CA (strip quotes/whitespace if pasted with quotes)
  const normalizedBase64 = base64Ca ? base64Ca.trim().replace(/^"|"$/g, '').replace(/\s+/g, '') : null;
  const sslCa = normalizedBase64 ? Buffer.from(normalizedBase64, 'base64').toString('utf8') : rawCa;

  // Helper to derive Supabase project ref from pooled hostnames
  const supabaseProjectOption = (host?: string | null) => {
    if (!host) return null;
    const match = host.match(/^db\.([^.]+)\.supabase\.co$/);
    return match ? `project=${match[1]}` : null;
  };

  const databaseUrl = env('DATABASE_URL', undefined) as string | undefined;
  const databaseOptionsEnv = env('DATABASE_OPTIONS', undefined) as string | undefined;

  let parsedPg: {
    host: string;
    port: number;
    database?: string;
    user: string;
    password: string;
  } | null = null;
  let normalizedPgConnectionString = databaseUrl;
  let finalPgOptions = databaseOptionsEnv || undefined;

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      const existingOptions = url.searchParams.get('options') || undefined;
      const supabaseOptionFromUrl = supabaseProjectOption(url.hostname) || undefined;

      if (!finalPgOptions) {
        finalPgOptions = existingOptions || supabaseOptionFromUrl;
      }

      if (finalPgOptions) {
        url.searchParams.set('options', finalPgOptions);
      } else if (existingOptions) {
        url.searchParams.delete('options');
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

  const resolvedHost = parsedPg?.host || env('DATABASE_HOST', 'localhost');
  const resolvedPort = parsedPg?.port || env.int('DATABASE_PORT', 5432);
  const resolvedDatabase = parsedPg?.database || env('DATABASE_NAME', 'strapi');
  const resolvedUser = parsedPg?.user || env('DATABASE_USERNAME', 'strapi');
  const resolvedPassword = parsedPg?.password || env('DATABASE_PASSWORD', 'strapi');

  if (!finalPgOptions) {
    finalPgOptions = supabaseProjectOption(resolvedHost) || undefined;
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

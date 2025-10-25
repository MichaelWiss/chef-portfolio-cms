import path from 'path';
import { Buffer } from 'buffer';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');
  const rawCa = env('DATABASE_SSL_CA');
  const base64Ca = env('DATABASE_SSL_CA_BASE64');
  // Normalize and decode base64 CA (strip quotes/whitespace if pasted with quotes)
  const normalizedBase64 = base64Ca ? base64Ca.trim().replace(/^"|"$/g, '').replace(/\s+/g, '') : null;
  const sslCa = normalizedBase64 ? Buffer.from(normalizedBase64, 'base64').toString('utf8') : rawCa;

  // If DATABASE_URL is provided, parse it to avoid sslmode=require overriding our SSL options
  const parsePgUrl = (urlStr?: string) => {
    if (!urlStr) return null as any;
    try {
      const u = new URL(urlStr);
      const searchParams = Object.fromEntries(u.searchParams.entries());
      return {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 5432,
        database: u.pathname ? u.pathname.replace(/^\//, '') : undefined,
        user: decodeURIComponent(u.username || ''),
        password: decodeURIComponent(u.password || ''),
        options: searchParams.options,
      };
    } catch {
      return null as any;
    }
  };
  const parsedPg = parsePgUrl(env('DATABASE_URL'));
  const supabaseOptions = () => {
    const host = parsedPg?.host || env('DATABASE_HOST');
    if (!host) return null;
    const match = host.match(/^db\.([^.]+)\.supabase\.co$/);
    return match ? `project=${match[1]}` : null;
  };
  const pgOptions = parsedPg?.options || env('DATABASE_OPTIONS') || supabaseOptions();

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
        // Use parsed URL pieces when available to ensure our SSL object is respected
        host: parsedPg?.host || env('DATABASE_HOST', 'localhost'),
        port: parsedPg?.port || env.int('DATABASE_PORT', 5432),
        database: parsedPg?.database || env('DATABASE_NAME', 'strapi'),
        user: parsedPg?.user || env('DATABASE_USERNAME', 'strapi'),
        password: parsedPg?.password || env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', true) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: sslCa,
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
        ...(pgOptions ? { options: pgOptions } : {}),
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

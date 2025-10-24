import path from 'path';
import { Buffer } from 'buffer';

/**
 * Database configuration for Strapi
 *
 * Supports multiple database types:
 * - SQLite (default for local development)
 * - PostgreSQL (recommended for production)
 * - MySQL (alternative production option)
 *
 * Set DATABASE_CLIENT environment variable to switch between databases
 */
export default ({ env }) => {
  // Determine which database client to use (defaults to SQLite for local dev)
  const client = env('DATABASE_CLIENT', 'sqlite');

  // Support PEM CA provided directly or as base64-encoded string (e.g., on Render)
  const rawCa = env('DATABASE_SSL_CA');
  const base64Ca = env('DATABASE_SSL_CA_BASE64');
  const sslCa = base64Ca ? Buffer.from(base64Ca, 'base64').toString('utf8') : rawCa;

  // Configuration objects for each supported database type
  const connections = {
    // MySQL configuration
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        // SSL configuration for secure connections (typically used in production)
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: sslCa,
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      // Connection pool settings to manage concurrent database connections
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },

    // PostgreSQL configuration (recommended for production deployments)
    postgres: {
      connection: {
        // Support for full connection string (e.g., from Railway, Supabase, Neon)
        connectionString: env('DATABASE_URL'),
        // Individual connection parameters (alternative to connection string)
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        // SSL configuration for secure connections
        // Default to SSL enabled and no verification to avoid self-signed chain failures.
        ssl: env.bool('DATABASE_SSL', true) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: sslCa,
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        // PostgreSQL schema (defaults to 'public')
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      // Connection pool settings
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

    // SQLite configuration (file-based database for local development)
    sqlite: {
      connection: {
        // Database file location (defaults to .tmp/data.db in project root)
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      // Required for SQLite to handle NULL values correctly
      useNullAsDefault: true,
    },
  };

  // Return the configuration for the selected database client
  return {
    connection: {
      client,
      // Spread the configuration for the selected database type
      ...connections[client],
      // Timeout for acquiring a connection from the pool (60 seconds default)
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};

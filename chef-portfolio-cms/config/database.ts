import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite');

  if (client === 'postgres') {
    const connectionString = env('DATABASE_URL');

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is required when DATABASE_CLIENT=postgres. Please set it in your environment (use the Supabase pooled connection string).'
      );
    }

    return {
      connection: {
        client: 'postgres',
        connection: {
          connectionString,
          ssl: env.bool('DATABASE_SSL', true)
            ? {
                rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
              }
            : false,
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
    };
  }

  if (client === 'mysql') {
    return {
      connection: {
        client: 'mysql',
        connection: {
          host: env('DATABASE_HOST', 'localhost'),
          port: env.int('DATABASE_PORT', 3306),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', false)
            ? {
                rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
              }
            : false,
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', 2),
          max: env.int('DATABASE_POOL_MAX', 10),
        },
      },
    };
  }

  return {
    connection: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };
};

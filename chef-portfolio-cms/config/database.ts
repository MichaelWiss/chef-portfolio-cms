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
    const resolverScript = path.join(__dirname, '..', 'scripts', 'resolve-supabase-connection.js');
    try {
      const execOutput = execFileSync(process.execPath, [resolverScript], {
        cwd: path.join(__dirname, '..'),
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

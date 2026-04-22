import dns from 'node:dns/promises';
import { Pool, PoolConfig } from 'pg';

// Create singleton pool instances
let pool: Pool | null = null;
let ipv6FallbackPool: Pool | null = null;
let attemptedIpv6Fallback = false;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Add it to your environment before starting the app.');
  }
  return connectionString;
}

function getPoolConfig(connectionString: string): PoolConfig {
  const sanitizedConnectionString = stripSslUrlParams(connectionString);
  const hostname = getSafeHostnameFromConnectionString(connectionString);
  const requiresSsl =
    /sslmode=require/i.test(connectionString) ||
    hostname.endsWith('.supabase.co') ||
    hostname.endsWith('.supabase.com');

  return {
    connectionString: sanitizedConnectionString,
    ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  };
}

function stripSslUrlParams(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('ssl');
    url.searchParams.delete('sslcert');
    url.searchParams.delete('sslkey');
    url.searchParams.delete('sslrootcert');
    return url.toString();
  } catch {
    return connectionString;
  }
}

function isDnsNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOTFOUND'
  );
}

function isSupabaseDirectHost(hostname: string): boolean {
  return /^db\.[a-z0-9]+\.supabase\.co$/i.test(hostname);
}

function getSafeHostnameFromConnectionString(connectionString: string): string {
  try {
    return new URL(connectionString).hostname;
  } catch {
    return 'unknown-host';
  }
}

async function getIpv6FallbackPool(connectionString: string): Promise<Pool | null> {
  if (attemptedIpv6Fallback) {
    return ipv6FallbackPool;
  }

  attemptedIpv6Fallback = true;

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return null;
  }

  if (!isSupabaseDirectHost(url.hostname)) {
    return null;
  }

  let ipv6Addresses: string[];
  try {
    ipv6Addresses = await dns.resolve6(url.hostname);
  } catch {
    return null;
  }

  if (ipv6Addresses.length === 0) {
    return null;
  }

  const dbName = url.pathname.replace(/^\//, '') || undefined;
  const port = Number(url.port || 5432);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);

  ipv6FallbackPool = new Pool({
    host: ipv6Addresses[0],
    port,
    database: dbName,
    user,
    password,
    ssl: { rejectUnauthorized: false },
  });

  return ipv6FallbackPool;
}

function buildDnsResolutionError(connectionString: string, originalError: unknown): Error {
  const hostname = getSafeHostnameFromConnectionString(connectionString);
  const error = new Error(
    `Unable to resolve database host "${hostname}" from Node.js (ENOTFOUND). ` +
      `If this is a Supabase direct host, switch DATABASE_URL to the Supabase pooler URL ` +
      `or enable IPv6 networking on this machine.`
  );

  if (originalError instanceof Error) {
    error.cause = originalError;
  }

  return error;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig(getConnectionString()));
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const primaryPool = getPool();

  try {
    const result = await primaryPool.query(text, params);
    return result.rows;
  } catch (error) {
    if (!isDnsNotFoundError(error)) {
      throw error;
    }

    const connectionString = getConnectionString();
    const fallbackPool = await getIpv6FallbackPool(connectionString);

    if (fallbackPool) {
      pool = fallbackPool;
      const fallbackResult = await fallbackPool.query(text, params);
      return fallbackResult.rows;
    }

    throw buildDnsResolutionError(connectionString, error);
  }
}

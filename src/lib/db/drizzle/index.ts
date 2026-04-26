import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { getDatabaseUrl } from '../database-url';

// Create Neon client
const sql = neon(getDatabaseUrl());

// Create Drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Re-export schema for convenience
export * from './schema';

// Export useful operators from drizzle-orm
export { eq, and, or, desc, asc, sql as sqlOp, isNull, isNotNull } from 'drizzle-orm';

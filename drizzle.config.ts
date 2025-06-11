import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.qvwrvuncwqmjshladinw',
    password: 'ziOCCyGKuNNV7ToX',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
} satisfies Config; 
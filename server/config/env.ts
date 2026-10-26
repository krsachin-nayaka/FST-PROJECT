import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().optional().default('mongodb://127.0.0.1:27017/phishguard'),
  CLIENT_ORIGIN: z.string().optional().default('http://localhost:3000'),
  GOOGLE_SAFE_BROWSING_API_KEY: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Environment variable configuration error');
}

export const env = parsedEnv.data;

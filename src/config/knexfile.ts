import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredDbVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const dbHost = requiredDbVar('DB_HOST');
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = requiredDbVar('DB_USER');
const dbPassword = requiredDbVar('DB_PASSWORD');
const dbName = requiredDbVar('DB_NAME');

const migrationsDir = path.resolve(__dirname, '../migrations');
const seedsDir = path.resolve(__dirname, '../seeds');

const config: Record<string, Knex.Config> = {
  development: {
    client: 'mysql2',
    connection: {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
    },
    migrations: {
      directory: migrationsDir,
      extension: 'ts',
    },
    seeds: {
      directory: seedsDir,
      extension: 'ts',
    },
  },
  test: {
    client: 'mysql2',
    connection: {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: `${dbName}_test`,
    },
    migrations: { directory: migrationsDir, extension: 'ts' },
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL,
    migrations: { directory: migrationsDir, extension: 'ts' },
    pool: { min: 2, max: 10 },
  },
};

export default config;
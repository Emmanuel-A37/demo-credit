import type { Knex } from 'knex';
import path from 'path';
import { env } from './env';

const migrationsDir = path.resolve(__dirname, '../migrations');
const seedsDir = path.resolve(__dirname, '../seeds');

const config: Record<string, Knex.Config> = {
  development: {
    client: 'mysql2',
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
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
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: `${env.db.name}_test`,
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
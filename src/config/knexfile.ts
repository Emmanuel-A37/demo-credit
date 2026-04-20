import type { Knex } from 'knex';
import { env } from './src/config/env';

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
      directory: './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
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
    migrations: { directory: './migrations', extension: 'ts' },
  },
  production: {
    client: 'mysql2',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './migrations', extension: 'ts' },
    pool: { min: 2, max: 10 },
  },
};

export default config;
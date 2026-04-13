import knex from 'knex';
import config from '../../knexfile';
import { env } from './env';

const db = knex(config[env.nodeEnv]);

export default db;
import db from '../config/db';
import { User } from '../models';

export class UserRepository {
  async findById(id: string): Promise<User | undefined> {
    return db('users').where({ id }).first();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return db('users').where({ email }).first();
  }

  async create(data: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    await db('users').insert(data);
    return this.findById(data.id) as Promise<User>;
  }
}
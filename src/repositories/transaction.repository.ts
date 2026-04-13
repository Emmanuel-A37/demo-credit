import { Knex } from 'knex';
import db from '../config/db';
import { Transaction } from '../models';

export class TransactionRepository {
  async create(data: Transaction, trx: Knex.Transaction): Promise<Transaction> {
    await trx('transactions').insert(data);
    return data;
  }

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    return db('transactions').where({ wallet_id: walletId }).orderBy('created_at', 'desc');
  }

  async findByReference(reference: string): Promise<Transaction | undefined> {
    return db('transactions').where({ reference }).first();
  }
}
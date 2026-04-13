import { Knex } from 'knex';
import db from '../config/db';
import { Wallet } from '../models';

export class WalletRepository {
  async findByUserId(userId: string, trx?: Knex.Transaction): Promise<Wallet | undefined> {
    const query = (trx || db)('wallets').where({ user_id: userId });
    return query.first();
  }

  async findByUserIdForUpdate(userId: string, trx: Knex.Transaction): Promise<Wallet | undefined> {
    return trx('wallets').where({ user_id: userId }).forUpdate().first();
  }

  async create(data: Omit<Wallet, 'created_at' | 'updated_at'>, trx?: Knex.Transaction): Promise<Wallet> {
    await (trx || db)('wallets').insert(data);
    return this.findByUserId(data.user_id, trx) as Promise<Wallet>;
  }

  async updateBalance(walletId: string, newBalance: number, trx: Knex.Transaction): Promise<void> {
    await trx('wallets').where({ id: walletId }).update({
      balance: newBalance,
      updated_at: new Date(),
    });
  }
}
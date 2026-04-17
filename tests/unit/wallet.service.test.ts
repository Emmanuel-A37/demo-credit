import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import db from '../../src/config/db';
import { walletService } from '../../src/services/wallet.service';

jest.mock('../../src/config/db', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(async (cb: (trx: unknown) => unknown) => cb({})),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

const mockWalletRepo = {
  findByUserId: jest.fn() as jest.Mock,
  findByUserIdForUpdate: jest.fn() as jest.Mock,
  updateBalance: jest.fn() as jest.Mock,
  create: jest.fn() as jest.Mock,
};

const mockTxRepo = {
  create: jest.fn() as jest.Mock,
  findByWalletId: jest.fn() as jest.Mock,
};

const mockUserRepo = {
  findByEmail: jest.fn() as jest.Mock,
};

describe('walletService', () => {
  let service: walletService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new walletService(
      mockWalletRepo as any,
      mockTxRepo as any,
      mockUserRepo as any
    );
  });

  describe('getBalance', () => {
    it('returns wallet balance for a valid user', async () => {
      (mockWalletRepo.findByUserId as any).mockResolvedValue({ id: 'w1', balance: 1200 });

      const result = await service.getBalance('u1');

      expect(mockWalletRepo.findByUserId).toHaveBeenCalledWith('u1');
      expect(result).toBe(1200);
    });

    it('throws when wallet does not exist', async () => {
      (mockWalletRepo.findByUserId as any).mockResolvedValue(undefined);

      await expect(service.getBalance('u1')).rejects.toThrow('No wallet found for this user');
    });
  });

  describe('fundWallet', () => {
    it('updates balance and creates a credit transaction', async () => {
      (mockWalletRepo.findByUserIdForUpdate as any).mockResolvedValue({
        id: 'w1',
        user_id: 'u1',
        balance: 1000,
      });
      (mockTxRepo.create as any).mockResolvedValue({});

      const result = await service.fundWallet('u1', { amount: 500 });

      expect(db.transaction).toHaveBeenCalled();
      expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('w1', 1500, expect.anything());
      expect(mockTxRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_id: 'w1',
          type: 'fund',
          direction: 'credit',
          amount: 500,
        }),
        expect.anything()
      );
      expect(result).toEqual({ balance: 1500, transaction: {} });
    });

    it('throws for zero or negative amount', async () => {
      await expect(service.fundWallet('u1', { amount: 0 })).rejects.toThrow(
        'Funding amount should be more than zero'
      );
      await expect(service.fundWallet('u1', { amount: -5 })).rejects.toThrow(
        'Funding amount should be more than zero'
      );
    });
  });

  describe('transfer', () => {
    it('debits sender, credits recipient, and writes transfer transactions', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue({ id: 'u2', email: 'bob@test.com' });
      (mockWalletRepo.findByUserIdForUpdate as any)
        .mockResolvedValueOnce({ id: 'w-sender', user_id: 'u1', balance: 1000 })
        .mockResolvedValueOnce({ id: 'w-recipient', user_id: 'u2', balance: 200 });
      (mockTxRepo.create as any).mockResolvedValue({});

      const result = await service.transfer('u1', { recipient_email: 'bob@test.com', amount: 300 });

      expect(db.transaction).toHaveBeenCalled();
      expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('w-sender', 700, expect.anything());
      expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('w-recipient', 500, expect.anything());
      expect(mockTxRepo.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ newBalance: 700 });
    });

    it('throws when recipient does not exist', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue(undefined);

      await expect(
        service.transfer('u1', { recipient_email: 'ghost@test.com', amount: 100 })
      ).rejects.toThrow('Recipient does not exist');
    });

    it('throws on self transfer', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue({ id: 'u1' });

      await expect(
        service.transfer('u1', { recipient_email: 'self@test.com', amount: 100 })
      ).rejects.toThrow('You can not transfer to yourself');
    });

    it('throws on insufficient funds', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue({ id: 'u2' });
      (mockWalletRepo.findByUserIdForUpdate as any)
        .mockResolvedValueOnce({ id: 'w-sender', user_id: 'u1', balance: 100 })
        .mockResolvedValueOnce({ id: 'w-recipient', user_id: 'u2', balance: 0 });

      await expect(
        service.transfer('u1', { recipient_email: 'bob@test.com', amount: 500 })
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('withdraw', () => {
    it('debits wallet and creates a debit transaction', async () => {
      (mockWalletRepo.findByUserIdForUpdate as any).mockResolvedValue({
        id: 'w1',
        user_id: 'u1',
        balance: 1000,
      });
      (mockTxRepo.create as any).mockResolvedValue({});

      const result = await service.withdraw('u1', { amount: 300 });

      expect(db.transaction).toHaveBeenCalled();
      expect(mockWalletRepo.updateBalance).toHaveBeenCalledWith('w1', 700, expect.anything());
      expect(mockTxRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          wallet_id: 'w1',
          type: 'withdraw',
          direction: 'debit',
          amount: 300,
        }),
        expect.anything()
      );
      expect(result).toEqual({ balance: 700, transaction: {} });
    });

    it('throws on insufficient funds', async () => {
      (mockWalletRepo.findByUserIdForUpdate as any).mockResolvedValue({
        id: 'w1',
        user_id: 'u1',
        balance: 100,
      });

      await expect(service.withdraw('u1', { amount: 500 })).rejects.toThrow('Insufficient funds.');
    });
  });

  describe('getTransactions', () => {
    it('returns wallet transactions', async () => {
      const txs = [{ id: 't1' }, { id: 't2' }];
      (mockWalletRepo.findByUserId as any).mockResolvedValue({ id: 'w1', user_id: 'u1' });
      (mockTxRepo.findByWalletId as any).mockResolvedValue(txs);

      const result = await service.getTransactions('u1');

      expect(mockTxRepo.findByWalletId).toHaveBeenCalledWith('w1');
      expect(result).toEqual(txs);
    });

    it('throws when wallet does not exist', async () => {
      (mockWalletRepo.findByUserId as any).mockResolvedValue(undefined);

      await expect(service.getTransactions('u1')).rejects.toThrow('Wallet not found');
    });
  });
});

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../src/config/db';
import { UserService } from '../../src/services/user.service';

jest.mock('../../src/config/db', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(async (cb: (trx: unknown) => unknown) => cb({})),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUserRepo = {
  findByEmail: jest.fn() as jest.Mock,
  findById: jest.fn() as jest.Mock,
  create: jest.fn() as jest.Mock,
};

const mockWalletRepo = {
  create: jest.fn() as jest.Mock,
};

const mockKarmaService = {
  isBlacklisted: jest.fn() as jest.Mock,
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(
      mockUserRepo as any,
      mockWalletRepo as any,
      mockKarmaService as any
    );
  });

  describe('register', () => {
    const registerDto = {
      name: 'Alice',
      email: 'alice@test.com',
      phone: '08012345678',
      bvn: '12345678901',
      password: 'Pass@123',
    };

    it('registers a clean user and returns safe user', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue(undefined);
      (mockKarmaService.isBlacklisted as any).mockResolvedValue(false);
      (bcrypt.hash as any).mockResolvedValue('hashed-password');
      (mockUserRepo.create as any).mockResolvedValue(undefined);
      (mockWalletRepo.create as any).mockResolvedValue(undefined);
      (mockUserRepo.findById as any).mockResolvedValue({
        id: 'u1',
        ...registerDto,
        password: 'hashed-password',
      });

      const result = await service.register(registerDto);

      expect(db.transaction).toHaveBeenCalled();
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          email: registerDto.email,
          password: 'hashed-password',
        })
      );
      expect(mockWalletRepo.create).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: 'u1',
          email: registerDto.email,
        })
      );
      expect(result).not.toHaveProperty('password');
    });

    it('rejects duplicate email', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow('User already exists');
      expect(mockKarmaService.isBlacklisted).not.toHaveBeenCalled();
    });

    it('rejects blacklisted users', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue(undefined);
      (mockKarmaService.isBlacklisted as any).mockResolvedValue(true);

      await expect(service.register(registerDto)).rejects.toThrow(
        "Can't create wallet, email blacklisted on adjutor, go pay"
      );
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'alice@test.com',
      password: 'Pass@123',
    };

    it('returns token and safeUser for valid LoginDTO credentials', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue({
        id: 'u1',
        email: loginDto.email,
        name: 'Alice',
        phone: '08012345678',
        bvn: '12345678901',
        password: 'hashed-password',
      });
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, 'hashed-password');
      expect(result).toEqual(
        expect.objectContaining({
          token: 'jwt-token',
          safeUser: expect.objectContaining({
            id: 'u1',
            email: loginDto.email,
          }),
        })
      );
      expect(result.safeUser).not.toHaveProperty('password');
    });

    it('throws for unknown user', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow('No such user exists');
    });

    it('throws for invalid password', async () => {
      (mockUserRepo.findByEmail as any).mockResolvedValue({
        id: 'u1',
        email: loginDto.email,
        password: 'hashed-password',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid password');
    });
  });
});

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bvn: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
}

export type TransactionType = 'fund' | 'transfer' | 'withdraw';
export type TransactionDirection = 'credit' | 'debit';
export type TransactionStatus = 'success' | 'failed';

export interface Transaction {
  id: string;
  reference: string;
  wallet_id: string;
  counterparty_wallet_id?: string | null;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  status: TransactionStatus;
  created_at?: Date;
}


export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  bvn: string;
  password: string;
}

export interface LoginDTO {
    email: string,
    password: string
}

export interface FundWalletDTO {
  amount: number;
}

export interface TransferDTO {
  recipient_email: string;
  amount: number;
}

export interface WithdrawDTO {
  amount: number;
}

//updating the Request type to include user information for authenticated routes
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}
import { Request, Response, NextFunction } from "express";
import { walletService } from "../services/wallet.service";
import { sendSuccess } from "../utils/response";

export class WalletController {
    constructor(
        private walletService : walletService
    ){}

    getBalance = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error('Unauthorized');

            const balance = await this.walletService.getBalance(userId);
            return sendSuccess(res, { balance }, 'Balance retrieved successfully.');
        } catch (err) {
            next(err);
        }
    }

    fundWallet = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error('Unauthorized');

            const result = await this.walletService.fundWallet(userId, req.body);
            return sendSuccess(res, result, 'Wallet funded successfully.');
        } catch (err) {
            next(err);
        }
    }

    transfer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error('Unauthorized');

            const result = await this.walletService.transfer(userId, req.body);
            return sendSuccess(res, result, 'Transfer successful.');
        } catch (err) {
            next(err);
        }
    }

    withdraw = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error('Unauthorized');

            const result = await this.walletService.withdraw(userId, req.body);
            return sendSuccess(res, result, 'Withdrawal successful.');
        } catch (err) {
            next(err);
        }
    }

    getTransactions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id;
            if (!userId) throw new Error('Unauthorized');

            const transactions = await this.walletService.getTransactions(userId);
            return sendSuccess(res, transactions, 'Transactions retrieved successfully.');
        } catch (err) {
            next(err);
        }
    }
}
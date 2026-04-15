import { v4 as uuidv4} from 'uuid'
import db from '../config/db'
import { WalletRepository } from '../repositories/wallet.repository'
import { TransactionRepository } from '../repositories/transaction.repository'
import { UserRepository } from '../repositories/user.repository'
import { TransferDTO, WithdrawDTO, FundWalletDTO } from '../models'


export class walletService {
    constructor(
        private walletRepo : WalletRepository,
        private transactionRepo : TransactionRepository,
        private userRepo : UserRepository
    ){}

    async getBalance (userId: string){
        const wallet = await this.walletRepo.findByUserId(userId);
        if (!wallet) throw new Error("No wallet found for this user");

        return wallet.balance;
    }

    async fundWallet(userId: string, dto: FundWalletDTO){
        if (dto.amount <= 0 ){
            throw new Error("Funding amount should be more than zero");
        };

        db.transaction(async(trx) => {
            const wallet = await this.walletRepo.findByUserIdForUpdate(userId,trx);
            if (!wallet) throw new Error ("Wallet not found.");

            const newBalance = Number(wallet.balance) + dto.amount;
            await this.walletRepo.updateBalance(wallet.id, newBalance, trx);

            const transaction = await this.transactionRepo.create({
                id: uuidv4(),
                reference: uuidv4(),
                wallet_id: wallet.id,
                type: 'fund',
                direction: 'credit',
                amount: dto.amount,
                status: 'success'
            }, trx);

            return { balance: newBalance, transaction };
        })
    }

    async transfer(senderId: string, dto: TransferDTO){
        if (dto.amount <= 0 ){
            throw new Error("Funding amount should be more than zero");
        };

        const recipient = await this.userRepo.findByEmail(dto.recipient_email);
        if (!recipient) throw new Error ("Recipient does not exist");

        if (recipient.id === senderId) throw new Error ("You can not transfer to yourself");

        db.transaction(async(trx) => {
            const [senderWallet, recipientWallet] = await Promise.all([
                this.walletRepo.findByUserIdForUpdate(senderId,trx),
                this.walletRepo.findByUserIdForUpdate(recipient.id,trx)
            ]);

            if (!senderWallet || !recipientWallet) throw new Error ("Wallet not found.");

            if (Number(senderWallet.balance) < Number(dto.amount)) throw new Error ("Insufficient funds");

            const senderBalance = Number(senderWallet.balance) - dto.amount;
            const recipientBalance = Number(recipientWallet.balance) + dto.amount;

            await Promise.all([
                this.walletRepo.updateBalance(senderWallet.id, senderBalance, trx),
                this.walletRepo.updateBalance(recipientWallet.id, recipientBalance, trx)
            ]);

            const reference = uuidv4();

            await Promise.all([
                this.transactionRepo.create({
                    id: uuidv4(),
                    reference,
                    wallet_id: senderWallet.id,
                    counterparty_wallet_id: recipientWallet.id,
                    type: 'transfer',
                    direction: 'debit',
                    amount: dto.amount,
                    status: 'success'
                },trx),
                this.transactionRepo.create({
                    id: uuidv4(),
                    reference,
                    wallet_id: recipientWallet.id,
                    counterparty_wallet_id: senderWallet.id,
                    type: 'transfer',
                    direction: 'credit',
                    amount: dto.amount,
                    status: 'success'
                },trx)
            ]);

            return {newBalance : senderBalance};
        })
    }

    async withdraw(userId: string, dto: WithdrawDTO){
        if (dto.amount <= 0 ){
            throw new Error("Funding amount should be more than zero");
        };

        db.transaction( async(trx) => {
            const wallet = await this.walletRepo.findByUserIdForUpdate(userId, trx);

            if(!wallet) throw new Error("Wallet not found");
            if (Number(wallet.balance) < dto.amount) throw new Error('Insufficient funds.');

            const newBalance = Number(wallet.balance) - dto.amount;
            await this.walletRepo.updateBalance(wallet.id, newBalance, trx);

            const transaction = await this.transactionRepo.create(
                {
                id: uuidv4(),
                reference: uuidv4(),
                wallet_id: wallet.id,
                type: 'withdraw',
                direction: 'debit',
                amount: dto.amount,
                status: 'success',
                },
                trx
            );
            
            return {balance: newBalance, transaction};
        });        
    }

    async getTransactions(userId: string){
        const wallet = await this.walletRepo.findByUserId(userId);
        if (!wallet) throw new Error("Wallet not found");
        return this.transactionRepo.findByWalletId(wallet.id);
    }
}
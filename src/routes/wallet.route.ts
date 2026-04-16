import { Router } from "express";
import { WalletController } from '../controllers/wallet.controller';
import { walletService } from '../services/wallet.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { UserRepository } from '../repositories/user.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { fundSchema, transferSchema, withdrawSchema } from '../utils/validators';

const router = Router();

const controller = new WalletController(
  new walletService(new WalletRepository(), new TransactionRepository(), new UserRepository())
);

router.use(authMiddleware);

router.get('/balance', controller.getBalance);
router.post('/fund', validate(fundSchema), controller.fundWallet);
router.post('/transfer', validate(transferSchema), controller.transfer);
router.post('/withdraw', validate(withdrawSchema), controller.withdraw);
router.get('/transactions', controller.getTransactions);

export default router;
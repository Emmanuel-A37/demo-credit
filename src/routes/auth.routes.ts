import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { WalletRepository } from '../repositories/wallet.repository';
import { KarmaService } from '../services/karma.service';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../utils/validators';

const router = Router();

const controller = new AuthController(
    new UserService(
        new UserRepository(),
        new WalletRepository(),
        new KarmaService()
    )
);

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

export default router;
import { Router } from "express";
import authRoutes from "./auth.routes";
import walletRoutes from "./wallet.route";

const router = Router();

router.use('/auth', authRoutes);  
router.use('/wallet', walletRoutes);

export default router;
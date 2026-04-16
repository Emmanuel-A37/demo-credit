import {v4 as uuidv4} from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/db'
import { env } from '../config/env'
import { RegisterDTO, LoginDTO } from '../models'
import { KarmaService } from './karma.service'
import { UserRepository } from '../repositories/user.repository'
import { WalletRepository } from '../repositories/wallet.repository'

export class UserService {
    constructor(
        private userRepo : UserRepository,
        private walletRepo : WalletRepository,
        private karmaService : KarmaService
    ){}

    async register(dto : RegisterDTO){
        const existing = await this.userRepo.findByEmail(dto.email);

        if (existing){
            throw new Error("User already exists");
        }

        const blacklisted = await this.karmaService.isBlacklisted(dto.email);

        if (blacklisted){
            throw new Error("Can't create wallet, email blacklisted on adjutor, go pay");
        }

        const userId = uuidv4();
        const walletId = uuidv4();

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        db.transaction(async trx => {
            await this.userRepo.create({id : userId, ...dto, password: hashedPassword})
            await this.walletRepo.create({id : walletId, user_id : userId, balance : 0}, trx)
        });

        const user = await this.userRepo.findById(userId);
        if (!user) throw new Error("No such user found");

        const { password, ...safeUser } = user;
        return safeUser;
    }

    async login (dto: LoginDTO){
        const user = await this.userRepo.findByEmail(dto.email);

        if (!user){
            throw new Error("No such user exists");
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.password);

        if (!passwordMatch){
            throw new Error("Invalid password");
        }

        const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: '24h' });
        const { password, ...safeUser } = user;
        return { token, safeUser };
    }
}
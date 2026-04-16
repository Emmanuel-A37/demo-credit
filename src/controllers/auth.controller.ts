import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  constructor(private userService: UserService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.register(req.body);
      return sendSuccess(res, user, 'Account created successfully.', 201);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.login(req.body);
      return sendSuccess(res, result, 'Login successful.');
    } catch (err) {
      next(err);
    }
  };
}
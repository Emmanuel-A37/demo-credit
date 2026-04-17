import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { sendError } from "../utils/response";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const rawAuthHeader = req.headers.authorization || req.headers.Authorization;
    const authHeader = Array.isArray(rawAuthHeader) ? rawAuthHeader[0] : rawAuthHeader;

    if(!authHeader?.startsWith("Bearer ")){
        return sendError(res, "Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, env.jwtSecret) as { id: string, email: string };
        req.user = payload;
        next();
    } catch {
        return sendError(res, "Invalid token", 401);
    }
}
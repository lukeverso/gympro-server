import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
     const token = req.header('Authorization')?.split(' ')[1];

     if (!token) {
          return res.status(401).json({
               message: 'Token não fornecido'
          });
     };

     try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

          (req as any).user = decoded;

          next();
     } catch (error) {
          return res.status(403).json({
               message: 'Token inválido'
          });
     };
};
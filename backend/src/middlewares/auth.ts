import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthError } from '../errors';
import { ITokenPayload } from '../types';

const auth = (req: Request, res: Response, next: NextFunction) => {
  const startPart = 'Bearer ';
  const token = req.header('Authorization');
  if (!token || !token.startsWith(startPart)) {
    next(new AuthError('Не авторизован'));
  } else {
    try {
      const data = jwt.verify(
        token.substring(startPart.length),
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as ITokenPayload;
      res.locals = {
        ...res.locals,
        auth: data.id,
      };
      next();
    } catch (error) {
      next(new AuthError('Не авторизован'));
    }
  }
};

export default auth;

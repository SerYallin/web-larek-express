import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import ms from 'ms';
import * as process from 'node:process';
import { Document, Error, Model } from 'mongoose';
import {
  AuthError,
  DuplicateDataError, InputDataError, NotFoundError, ServerError,
} from '../errors';
import User from '../models/user';
import { ITokenPayload, IUser } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then(async (data) => {
      if (!data) {
        throw new AuthError('Email или пароль введены неверно');
      } else {
        const match = await bcrypt.compare(password, data.password);
        if (!match) {
          throw new AuthError('Email или пароль введены неверно');
        }
      }
      return data;
    })
    .then(async (data) => {
      try {
        // eslint-disable-next-line no-use-before-define
        generateTokens(data, User)
          .then((tokens) => {
            res.cookie('refreshToken', tokens.refeshToken, {
              httpOnly: true,
              secure: false,
              sameSite: 'lax',
              maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY as StringValue || '7d'),
              path: '/',
            });
            res.send({
              user: {
                email: data.email,
                name: data.name,
              },
              success: true,
              accessToken: tokens.accessToken,
            });
          });
      } catch (err) {
        if (err instanceof Error.ValidationError) {
          throw new AuthError(err.message);
        } else {
          throw err;
        }
      }
    })
    .catch((err) => {
      next(err);
    });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const tokenData: string = req.cookies?.refreshToken || '';
  if (!tokenData) {
    next(new AuthError('Не авторизован'));
  }
  try {
    const playload = jwt.verify(tokenData, process.env.ACCESS_TOKEN_SECRET as string) as
      ITokenPayload;
    User.updateOne({ 'tokens.token': tokenData, _id: playload.id }, { $pull: { tokens: { token: tokenData } } })
      .then((result) => {
        if (!result || !result.modifiedCount) {
          throw new NotFoundError('Пользователь не найден');
        } else {
          res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
          });
          res.send({
            success: true,
          });
        }
      })
      .catch((err) => {
        if (err instanceof Error.ValidationError) {
          next(new InputDataError(err.message));
        } else {
          next(err);
        }
      });
  } catch (err) {
    next(new InputDataError('Не верный или просроченный токен'));
  }
};

export const getCurrentUser = async (_req: Request, res: Response, next: NextFunction) => {
  const { auth } = res.locals;
  if (!auth) {
    next(new AuthError('Не авторизован'));
  } else {
    User.findOne({ _id: auth })
      .then((data) => {
        if (!data) {
          throw new NotFoundError('Пользователь не найден');
        } else {
          res.send({
            user: {
              email: data.email,
              name: data.name,
            },
            success: true,
          });
        }
      })
      .catch((err) => {
        if (err instanceof Error.ValidationError) {
          next(new InputDataError(err.message));
        } else {
          next(err);
        }
      });
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = await User.create({
    name,
    email,
    password: hashedPassword,
  })
    .catch((err) => {
      if (err instanceof Error.ValidationError) {
        next(new InputDataError(err.message));
      } else if (err.code && err.code === 11000) {
        next(new DuplicateDataError(`Пользователь с таким '${Object.keys(err.keyPattern).join("', '")}' уже существует`));
      } else {
        next(err);
      }
    });

  if (userData instanceof Document) {
    try {
      // eslint-disable-next-line no-use-before-define
      generateTokens(userData, User)
        .then((tokens) => {
          res.cookie('refreshToken', tokens.refeshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY as StringValue || '7d'),
            path: '/',
          });
          res.send({
            user: {
              email: userData.email,
              name: userData.name,
            },
            success: true,
            accessToken: tokens.accessToken,
          });
        });
    } catch (err) {
      if (err instanceof Error.ValidationError) {
        next(new InputDataError(err.message));
      } else {
        next(err);
      }
    }
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const tokenData: string = req.cookies?.refreshToken || '';
  if (!tokenData) {
    next(new AuthError('Не авторизован'));
  } else {
    User.findOne({ 'tokens.token': tokenData })
      .then((data) => {
        if (!data) {
          throw new AuthError('Не верный или просроченный токен');
        } else {
          try {
            const playload = jwt.verify(tokenData, process.env.ACCESS_TOKEN_SECRET as string) as
              ITokenPayload;
            const accessToken = jwt.sign(
              {
                id: playload.id,
              },
              (process.env.ACCESS_TOKEN_SECRET as string),
              {
                expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY as StringValue || '10m',
              },
            );
            res.send({
              user: {
                email: data.email,
                name: data.name,
              },
              success: true,
              accessToken,
            });
          } catch (err) {
            throw new AuthError('Не верный или просроченный токен');
          }
        }
      })
      .catch((err) => {
        next(err);
      });
  }
};

const generateTokens = (data: Document & IUser, model: Model<IUser>) => {
  const refeshToken = jwt.sign(
    {
      id: data._id,
    },
    (process.env.ACCESS_TOKEN_SECRET as string),
    {
      expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY as StringValue || '7d',
    },
  );
  return model.updateOne({ _id: data._id }, { $push: { tokens: { token: refeshToken } } })
    .then((result) => {
      if (!result || !result.modifiedCount) {
        throw new ServerError('Ошибка обновления токена');
      }
      const accessToken = jwt.sign(
        {
          id: data._id,
        },
        (process.env.ACCESS_TOKEN_SECRET as string),
        {
          expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY as StringValue || '10m',
        },
      );
      return {
        accessToken,
        refeshToken,
      };
    });
};

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import { DuplicateDataError, InputDataError } from '../errors';

export const getProducts = (_req: Request, res: Response, next: NextFunction) => Product.find({})
  .then((products) => res.status(200).send({ items: products, total: products.length }))
  .catch((err) => {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new InputDataError(err.message));
    } else {
      next(err);
    }
  });

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  Product.create(req.body)
    .then((product) => res.status(201).send({ items: product }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new InputDataError(err.message));
      } else if (err.code && err.code === 11000) {
        next(new DuplicateDataError(`Товар с таким '${Object.keys(err.keyPattern).join("', '")}' уже существует`));
      } else {
        next(err);
      }
    });
};

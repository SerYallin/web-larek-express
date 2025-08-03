import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as path from 'node:path';
import * as fs from 'node:fs';
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
  const data = req.body;
  const source = path.join(__dirname, '..', 'public', data.image.fileName);
  const target = path.join(__dirname, '..', 'public', 'images', data.image.originalName);
  try {
    const stats = fs.statSync(source);
    if (stats.isFile()) {
      fs.renameSync(source, target);
      data.image = {
        ...data.image,
        fileName: path.join('/images', data.image.originalName),
      };
    }
    Product.create(data)
      .then((product) => res.status(201).send(product))
      .catch((err) => {
        if (err instanceof mongoose.Error.ValidationError) {
          next(new InputDataError(err.message));
        } else if (err.code && err.code === 11000) {
          next(new DuplicateDataError(`Товар с таким '${Object.keys(err.keyPattern).join("', '")}' уже существует`));
        } else {
          next(err);
        }
      });
  } catch (err) {
    next(new InputDataError('Ошибка при загрузке изображения'));
  }
};

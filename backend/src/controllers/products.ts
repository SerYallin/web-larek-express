import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as path from 'node:path';
import * as fs from 'node:fs';
import Product from '../models/product';
import { DuplicateDataError, InputDataError, NotFoundError } from '../errors';

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
  } catch (err) {
    next(new InputDataError('Ошибка при загрузке изображения'));
    return;
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
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const data = req.body;
  if (data.image) {
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
    } catch (err) {
      next(new InputDataError('Ошибка при загрузке изображения'));
      return;
    }
  }
  Product.findByIdAndUpdate(productId, {
    ...data,
  })
    .then((result) => {
      if (!result) {
        throw new NotFoundError('Товар не найден');
      } else {
        res.status(200).send(result);
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new InputDataError(err.message));
      } else {
        next(err);
      }
    });
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  Product.findByIdAndDelete(productId).then((result) => {
    if (!result) {
      throw new NotFoundError('Товар не найден');
    } else {
      if (result.image) {
        const image = path.join(__dirname, '..', 'public', result.image.fileName);
        fs.unlinkSync(image);
      }
      res.status(200).send(result);
    }
  })
    .catch((err) => {
      next(err);
    });
};

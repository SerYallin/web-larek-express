import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Product from '../models/product';
import { InputDataError } from '../errors';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const order = req.body;

  const ids = order.items
    .filter((id:string) => mongoose.Types.ObjectId.isValid(id))
    .map((id:string) => new mongoose.Types.ObjectId(id));

  await Product.aggregate([
    { $match: { _id: { $in: ids }, price: { $ne: null } } },
    { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
  ])
    .then((result) => {
      if (!result.length || result[0].count !== order.items.length) {
        throw new InputDataError('Один или несколько товаров не найдены');
      } else if (result[0].total !== order.total) {
        throw new InputDataError('Неверная сумма заказа');
      }
      return result[0];
    })
    .then((result) => {
      res.send({
        id: faker.database.mongodbObjectId(),
        total: result.total,
      });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new InputDataError(err.message));
      } else {
        next(err);
      }
    });
};

export default createOrder;

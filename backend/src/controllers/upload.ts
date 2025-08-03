import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  const { file } = req;
  if (!file) {
    next(new NotFoundError('Файл не найден'));
  } else {
    const fileName = file.path.split('/public/').pop();
    res.status(200).send({
      fileName: `/${fileName}`,
      originalName: file.originalname,
    });
  }
};
export default uploadFile;

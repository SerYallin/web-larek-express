import multer from 'multer';
import * as path from 'node:path';
import { InputDataError } from '../errors';

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.resolve(__dirname, '..', 'public', 'temp'));
  },
  filename(_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },

});

const upload = multer({
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    const isValid = allowedMimes.includes(file.mimetype);
    const error = isValid ? null : new InputDataError('Не поддерживаемый формат файла');
    if (error) {
      cb(error);
    } else {
      cb(null, isValid);
    }
  },
  limits: {
    fileSize: 2097152,
  },
  storage,
});

export default upload;

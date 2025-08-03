import { isCelebrateError } from 'celebrate';
import { MulterError } from 'multer';

const errorsHandler = (err: any, _req: any, res: any, _next: any) => {
  if (err instanceof MulterError) {
    res.status(400).send({ message: err.message });
  } else if (isCelebrateError(err)) {
    const messages = Array.from(err.details.entries()).map(([_, joiError]) => joiError.message);
    res.status(400).send({ message: messages.join('; ') });
  } else {
    res.status(err.statusCode || 500).send({ message: err.message });
  }
};

export default errorsHandler;

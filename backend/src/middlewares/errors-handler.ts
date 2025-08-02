import { isCelebrateError } from 'celebrate';
export const errorsHandler = (err: any, req: any, res: any, next: any) => {
  if (isCelebrateError(err)) {
    const messages = [];
    for (const [segment, joiError] of err.details.entries()) {
      messages.push(joiError.message);
    }
    res.status(400).send({ message: messages.join('; ') });
  }
  else {
    res.status(err.statusCode || 500).send({ message: err.message });
  }

}
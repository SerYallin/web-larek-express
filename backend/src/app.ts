import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as path from 'node:path';
import cookieParser from 'cookie-parser';
import product from './routes/products';
import order from './routes/orders';
import user from './routes/user';
import errorsHandler from './middlewares/errors-handler';
import { requestLogger, errorLogger } from './middlewares/loggers';
import upload from './routes/upload';

const cors = require('cors');

dotenv.config();

mongoose.connect(`${process.env.DB_ADDRESS}`);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', product);
app.use('/order', order);
app.use('/auth', user);
app.use('/upload', upload);
app.use(errorLogger);
app.use(errorsHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(
    'Server is running on http://localhost:3000',
  );
});

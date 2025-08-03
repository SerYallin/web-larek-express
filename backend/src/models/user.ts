import mongoose from 'mongoose';
import { IUser } from '../types';

const user = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина имени 2 символа.'],
    maxlength: [30, 'Максимальная длина имени 30 символов.'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email - обязательное поле.'],
  },
  password: {
    type: String,
    minlength: [6, 'Минимальная длина пароля 6 символов.'],
    required: [true, 'Пароль - обязательное поле.'],
    select: false,
  },
  tokens: {
    type: [{
      token: {
        type: String,
        required: [true, 'Токе не может быть пустым.'],
      },
    }],
    select: false,
  },
});

export default mongoose.model<IUser>('User', user);

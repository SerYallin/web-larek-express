import mongoose from 'mongoose';
import { IProduct } from '../types';

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    minlength: [2, 'Минимальная длина поля "Title" 2 символа.'],
    maxlength: [30, 'Максимальная длина поля "Title" 30 символов.'],
    required: [true, 'Поле "Title" должно быть заполнено.'],
  },
  image: {
    type: {
      fileName: String,
      originalName: String,
    },
    required: [true, 'Поле "Image" должно быть заполнено.'],
  },
  category: {
    type: String,
    required: [true, 'Поле "Category" должно быть заполнено.'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
});
export default mongoose.model<IProduct>('product', productSchema);

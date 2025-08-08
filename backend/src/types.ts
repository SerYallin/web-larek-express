import { JwtPayload } from 'jsonwebtoken';

export type TImage = {
  fileName: string,
  originalName: string;
}

export interface ITokenPayload extends JwtPayload{
  id: string,
}

export type TToken = {
  token: string
}
export interface IProduct {
  title: string,
    image: TImage,
    category: string,
    description: string,
    price: number
}

export interface IUser {
  name: string,
  email: string,
  password: string,
  tokens: TToken[];
}

export interface IError extends Error {
  statusCode: number;
}

export type TImage = {
  fileName: string,
  originalName: string;
}
export interface IProduct {
  title: string,
    image: TImage,
    category: string,
    description: string,
    price: number
}

export interface IError extends Error {
  statusCode: number;
}
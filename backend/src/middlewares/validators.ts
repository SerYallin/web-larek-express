import { celebrate, Joi, Segments } from 'celebrate';

export const validateProduct = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required()
      .messages({
        'string.base': 'Название товара должно быть строкой',
        'any.required': 'Не указано название товара',
        'string.min': 'Название должно содержать минимум 2 символа',
        'string.max': 'Название должно содержать максимум 30 символов',
      }),
    image: Joi.object({
      fileName: Joi.string(),
      originalName: Joi.string(),
    }).required().messages({
      object: 'Не указан файл',
    }),
    category: Joi.string().required().messages({
      'string.base': 'Категория должна быть строкой',
      'any.required': 'Не указана категория товара',
    }),
    description: Joi.string().messages({
      'string.base': 'Описание должно быть строкой',
    }),
    price: Joi.number().messages({
      'number.base': 'Цена должна быть числом',
    }),
  }),
});

export const validateOrder = celebrate({
  [Segments.BODY]: Joi.object().keys({
    items: Joi.array().items(Joi.string()).required().messages({
      'array.base': 'Товары должны передаваться в виде массива строк',
      'any.required': 'Не указаны товары в заказе',
    }),
    total: Joi.number().required().messages({
      'number.base': 'Сумма заказа должна быть числом',
      'any.required': 'Не указана сумма заказа',
    }),
    payment: Joi.string().valid('card', 'online').required().messages({
      'string.base': 'Способ оплаты должен быть строкой',
      'any.only': 'Неподдерживаемый способ оплаты',
      'any.required': 'Не указан способ оплаты',
    }),
    email: Joi.string().email().required().messages({
      'string.base': 'Email должен быть строкой',
      'string.email': 'Неправильный формат email',
      'any.required': 'Не указан email',
    }),
    phone: Joi.string().required().messages({
      'string.base': 'Телефон должен быть строкой',
      'any.required': 'Не указан телефон',
    }),
    address: Joi.string().required().messages({
      'string.base': 'Адрес должен быть строкой',
      'any.required': 'Не указан адрес доставки',
    }),
  }),
});

// export const validateId = celebrate({
//   [Segments.PARAMS]: Joi.object().keys({
//     id: Joi.string().required()
//   })
// })

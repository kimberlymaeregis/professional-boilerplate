
import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name must not exceed 100 characters',
            'any.required': 'Name is required',
        }),
    
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
    
    password: Joi.string()
        .min(8)
        .max(50)
        .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain at least one letter and one number',
            'any.required': 'Password is required',
        }),
    
    age: Joi.number()
        .integer()
        .min(13)
        .max(120)
        .optional(),
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email({ tlds: { allow: false } }),
    age: Joi.number().integer().min(13).max(120),
    isActive: Joi.boolean(),
}).min(1);

export const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const paginationQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
    order: Joi.string().valid('ASC', 'DESC').default('DESC'),
});

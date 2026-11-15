import Joi from 'joi';


export const loginSchema = Joi.object({
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
       .required()
       .messages({
           'string.min': 'Password must be at least 8 characters',
           'any.required': 'Password is required',
       }),
});


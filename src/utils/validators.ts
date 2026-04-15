import Joi from 'joi';


export const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  bvn: Joi.string().length(11).required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const fundSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

export const transferSchema = Joi.object({
  recipient_email: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
});

export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().required(),
});
import { z } from 'zod';
import { Role } from '../../models/user.js';

export const registerUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(16, { message: 'Password must be less than 16 characters' }),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});



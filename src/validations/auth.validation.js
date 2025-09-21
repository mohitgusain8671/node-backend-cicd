import { z } from 'zod';

export const signUpSchema = z.object({
    name: z.string( { required_error: 'Name is required' } )
            .min(2, 'Name must be at least 2 characters long')
            .max(100, 'Name must be at most 100 characters long')
            .trim(),
    email: z.email('Invalid email address')
            .max(250, 'Email must be at most 250 characters long')
            .trim()
            .toLowerCase(),
    password: z.string( { required_error: 'Password is required' } )
            .min(6, 'Password must be at least 6 characters long')
            .max(100, 'Password must be at most 100 characters long'),
    role: z.enum(['user', 'admin']).default('user'),
});

export const signInSchema = z.object({
    email: z.email('Invalid email address')
            .max(250, 'Email must be at most 250 characters long')
            .trim()
            .toLowerCase(),
    password: z.string( { required_error: 'Password is required' } )
            .min(1),
});
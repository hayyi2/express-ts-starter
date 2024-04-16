import { prisma } from 'utils/prisma'
import { z } from 'zod'

export const LoginSchema = z.object({
    email: z
        .string({
            invalid_type_error: 'Email invalid value',
            required_error: 'Email required',
        })
        .trim(),
    password: z.string({
        invalid_type_error: 'Password invalid value',
        required_error: 'Password required',
    }),
})

export const AuthenticateSchema = z.object({
    authorization: z
        .string()
        .trim()
        .refine((data) => data.split(' ').length === 2, {
            message: 'Invalid token',
        })
        .transform((data) => data.split(' ')[1]),
})

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().trim(),
})

export const RegisterSchema = z
    .object({
        name: z
            .string({
                invalid_type_error: 'Name invalid value',
                required_error: 'Name required',
            })
            .trim(),
        email: z
            .string({
                invalid_type_error: 'Email invalid value',
                required_error: 'Email required',
            })
            .trim()
            .email('Email invalid')
            .refine(async (e: string) => (await prisma.user.count({ where: { email: e } })) === 0, 'Email has been registered'),
        password: z
            .string({
                invalid_type_error: 'Password invalid value',
                required_error: 'Password required',
            })
            .min(6, 'Password must be at least 6 characters'),
        confirm: z
            .string({
                invalid_type_error: 'Confirm Password invalid value',
                required_error: 'Confirm Password required',
            })
            .min(6, 'Password must be at least 6 characters'),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords don't match",
        path: ['confirm'],
    })

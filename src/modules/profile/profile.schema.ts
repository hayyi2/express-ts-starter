import { z } from 'zod'

export const ChangeProfileSchema = z.object({
    name: z
        .string({
            invalid_type_error: 'Email invalid value',
            required_error: 'Email required',
        })
        .trim(),
})

export const ChangePasswordSchema = z
    .object({
        old: z.string(),
        password: z
            .string({
                invalid_type_error: 'Password invalid value',
                required_error: 'Password required',
            })
            .trim()
            .min(6, 'Password must be at least 6 characters'),
        confirm: z
            .string({
                invalid_type_error: 'Confirm Password invalid value',
                required_error: 'Confirm Password required',
            })
            .trim()
            .min(6, 'Password must be at least 6 characters'),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Passwords don't match",
        path: ['confirm'],
    })

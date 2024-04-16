import { prisma } from 'utils/prisma'
import { z } from 'zod'
import { USER_ROLE } from './user.config'

const fieldObjects = {
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
        .email('Email invalid'),
    password: z
        .string({
            invalid_type_error: 'Password invalid value',
            required_error: 'Password required',
        })
        .trim()
        .min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(USER_ROLE, {
        errorMap: () => {
            return { message: 'Role invalid value' }
        },
    }),
}

export const UserCreateSchema = z.object({
    name: fieldObjects.name,
    email: fieldObjects.email.refine(async (e: string) => (await prisma.user.count({ where: { email: e } })) === 0, 'Email has been registered'),
    role: fieldObjects.role,
    password: fieldObjects.password,
})

export const UserUpdateSchema = (email: string) => {
    return z.object({
        name: fieldObjects.name,
        email: fieldObjects.email.refine(
            async (e: string) => email === e || (await prisma.user.count({ where: { email: e } })) === 0,
            'Email already taken',
        ),
        role: fieldObjects.role,
        password: fieldObjects.password.optional(),
    })
}

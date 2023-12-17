import { NextFunction, Request, Response, Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '../libs/prisma'
import { NotFoundError, ValidationError } from '../errors'
import { authMiddleware, hasRoleMiddleware } from './auth'
import { User } from '@prisma/client'

export const userRoutes = Router()

export enum UserRole {
    ADMIN = 'admin',
    MEMBER = 'member',
}

export const defautlRole = UserRole.MEMBER

export const userCollection = ({ id, name, email, phone, photo, verified, role, createdAt, updatedAt }: User) => ({
    id,
    name,
    email,
    phone,
    photo,
    verified,
    role,
    createdAt,
    updatedAt,
})

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
    role: z.nativeEnum(UserRole, {
        errorMap: () => {
            return { message: 'Role invalid value' }
        },
    }),
}

const UserCreateSchema = z.object({
    name: fieldObjects.name,
    email: fieldObjects.email.refine(async (e: string) => (await prisma.user.count({ where: { email: e } })) === 0, 'Email has been registered'),
    role: fieldObjects.role,
    password: fieldObjects.password,
})

const UserUpdateSchema = (email: string) => {
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

userRoutes.use(authMiddleware, hasRoleMiddleware(UserRole.ADMIN))

userRoutes
    .route('/')
    .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
            return res.json((await prisma.user.findMany()).map(userCollection))
        } catch (error) {
            next(error)
        }
    })
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCreateValidate = await UserCreateSchema.safeParseAsync(req.body)
            if (!userCreateValidate.success) {
                throw new ValidationError(userCreateValidate.error)
            }
            const userCreateData = {
                name: userCreateValidate.data.name,
                email: userCreateValidate.data.email,
                password: bcrypt.hashSync(userCreateValidate.data.password, bcrypt.genSaltSync()),
                role: userCreateValidate.data.role,
            }

            const user = await prisma.user.create({
                data: userCreateData,
            })
            return res.status(201).json(userCollection(user))
        } catch (error) {
            next(error)
        }
    })

export interface UserRequest extends Request {
    user?: User | null
}

export const userMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: parseInt(req.params.id) },
        })
        if (user === null) {
            throw new NotFoundError('User not found')
        }
        req.user = user
    } catch (error) {
        next(error)
    }

    return next()
}

userRoutes
    .route('/:id')
    .get(userMiddleware, async (req: UserRequest, res: Response, next: NextFunction) => {
        try {
            return res.json(userCollection(req.user as User))
        } catch (error) {
            next(error)
        }
    })
    .put(userMiddleware, async (req: UserRequest, res: Response, next: NextFunction) => {
        try {
            const userUpdateValidate = await UserUpdateSchema(req.user?.email ?? '').safeParseAsync(req.body)
            if (!userUpdateValidate.success) {
                throw new ValidationError(userUpdateValidate.error)
            }
            const password = bcrypt.hashSync(userUpdateValidate.data.password ?? '', bcrypt.genSaltSync())
            const userUpdateData = {
                name: userUpdateValidate.data.name,
                email: userUpdateValidate.data.email,
                role: userUpdateValidate.data.role,
                ...(userUpdateValidate.data.password ? { password } : {}),
            }

            const user = await prisma.user.update({
                where: { id: req.user?.id },
                data: userUpdateData,
            })
            return res.json(userCollection(user))
        } catch (error) {
            next(error)
        }
    })
    .delete(userMiddleware, async (req: UserRequest, res: Response, next: NextFunction) => {
        try {
            await prisma.user.delete({
                where: { id: req.user?.id },
            })
            return res.status(204).json({})
        } catch (error) {
            next(error)
        }
    })

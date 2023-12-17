import { NextFunction, Request, Response, Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '../libs/prisma'
import { User } from '@prisma/client'
import { AppRequest } from '../types'
import { BaseError, ValidationError } from '../errors'
import { getAccessToken, refreshAccessToken, validAccessToken, validRefreshToken } from '../libs/jwt'
import { imageMimes, storage } from '../libs/multer'
import multer from 'multer'
import fs from 'fs'
import { defautlRole } from './user'

export const authRoutes = Router()

const LoginSchema = z.object({
    email: z
        .string({
            invalid_type_error: 'Email invalid value',
            required_error: 'Email required',
        })
        .trim(),
    password: z
        .string({
            invalid_type_error: 'Password invalid value',
            required_error: 'Password required',
        })
        .trim(),
})

const AuthenticateSchema = z.object({
    authorization: z.string().trim(),
})

const RefreshTokenSchema = z.object({
    refreshToken: z.string().trim(),
})

const ChangeProfileSchema = z.object({
    name: z
        .string({
            invalid_type_error: 'Email invalid value',
            required_error: 'Email required',
        })
        .trim(),
    phone: z
        .string({
            invalid_type_error: 'Phone invalid value',
            required_error: 'Phone required',
        })
        .trim(),
})

const ChangePasswordSchema = z
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

const RegisterSchema = z
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

authRoutes.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loginValidate = LoginSchema.safeParse(req.body)
        if (!loginValidate.success) {
            throw new ValidationError(loginValidate.error)
        }
        const loginData = loginValidate.data

        const user = await prisma.user.findFirst({
            where: { email: loginData.email },
        })
        if (user === null || !bcrypt.compareSync(loginData.password, user.password)) {
            throw new BaseError('Invalid email or password', 401)
        }

        const { id, name, email, phone, photo, verified, role } = user
        const { accessToken, refreshToken } = await getAccessToken({ id })

        return res.json({
            name,
            email,
            phone,
            photo,
            verified,
            role,
            accessToken,
            refreshToken,
        })
    } catch (error) {
        return next(error)
    }
})

export const authMiddleware = async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const tokenValidate = AuthenticateSchema.safeParse(req.headers)
        if (!tokenValidate.success) {
            throw new BaseError('Unauthorized', 401)
        }
        const token = tokenValidate.data.authorization.split(' ')[1]

        req.userAuth = await validAccessToken(token)
        if (!req.userAuth) {
            throw new BaseError('Unauthorized', 401)
        }
    } catch (error) {
        next(error)
    }

    return next()
}

export const hasRole = (user: User | undefined | null, ...roles: string[]) => {
    return roles.includes(user?.role ?? '')
}

export const hasRoleMiddleware = (...roles: string[]) => {
    return async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            if (!hasRole(req.userAuth, ...roles)) {
                throw new BaseError('Forbidden', 403)
            }
        } catch (error) {
            next(error)
        }

        return next()
    }
}

authRoutes.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tokenValidate = AuthenticateSchema.safeParse(req.headers)
        if (!tokenValidate.success) {
            throw new BaseError('Unauthorized', 401)
        }

        const token = tokenValidate.data.authorization.split(' ')[1]
        const tokenData = await prisma.userToken.findFirst({ where: { accessToken: token } })
        await prisma.userToken.delete({ where: { id: tokenData?.id } })

        return res.status(202).json({})
    } catch (error) {
        next(error)
    }
})

authRoutes.post('/refresh_token', async (req: Request, res: Response) => {
    const tokenValidate = RefreshTokenSchema.safeParse(req.body)
    if (!tokenValidate.success) {
        throw new BaseError('Unauthorized', 401)
    }
    const token = tokenValidate.data.refreshToken
    const tokenData = await validRefreshToken(token)
    if (!tokenData) {
        throw new BaseError('Unauthorized', 401)
    }
    const { accessToken } = await refreshAccessToken(tokenData)

    return res.json({ accessToken })
})

authRoutes
    .route('/me')
    .get(authMiddleware, (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const { name, email, phone, photo, verified, role } = req.userAuth as User
            return res.json({ name, email, phone, photo, verified, role })
        } catch (error) {
            next(error)
        }
    })
    .put(authMiddleware, async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const changeProfileValidate = ChangeProfileSchema.safeParse(req.body)
            if (!changeProfileValidate.success) {
                throw new ValidationError(changeProfileValidate.error)
            }
            const changeProfileData = changeProfileValidate.data

            const user = await prisma.user.update({
                where: { id: req.userAuth?.id },
                data: changeProfileData,
            })

            const { name, email, phone, photo, verified, role } = user
            return res.json({ name, email, phone, photo, verified, role })
        } catch (error) {
            next(error)
        }
    })

authRoutes.put('/password', authMiddleware, async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const changePasswordValidate = await ChangePasswordSchema.safeParseAsync(req.body)

        if (!changePasswordValidate.success) {
            throw new ValidationError(changePasswordValidate.error)
        }

        if (req.userAuth?.password !== '' && !bcrypt.compareSync(changePasswordValidate.data.old, req.userAuth?.password ?? '')) {
            throw new BaseError('Invalid old password', 401)
        }

        await prisma.user.update({
            where: { id: req.userAuth?.id },
            data: {
                password: bcrypt.hashSync(changePasswordValidate.data.password, bcrypt.genSaltSync()),
            },
        })

        return res.json({})
    } catch (error) {
        next(error)
    }
})

authRoutes.put(
    '/photo',
    authMiddleware,
    multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            const fileSize = parseInt(req.headers['content-length'] ?? '')
            if (!imageMimes.includes(file.mimetype)) {
                return cb(new BaseError('File is not allowed', 400))
            }
            if (fileSize > 1048576 * 5) {
                return cb(new BaseError('File is too large', 400))
            }

            cb(null, true)
        },
    }).single('photo'),
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const old_photo = req.userAuth?.photo ?? ''
            if (fs.existsSync('./public/' + old_photo)) {
                fs.unlinkSync('./public/' + old_photo)
            }
            await prisma.user.update({
                where: { id: req.userAuth?.id },
                data: {
                    photo: 'uploads/' + req.file?.filename,
                },
            })

            return res.json({})
        } catch (error) {
            next(error)
        }
    },
)

authRoutes.post('/register', async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const registerValidate = await RegisterSchema.safeParseAsync(req.body)

        if (!registerValidate.success) {
            throw new ValidationError(registerValidate.error)
        }
        const registerData = {
            name: registerValidate.data.name,
            email: registerValidate.data.email,
            password: bcrypt.hashSync(registerValidate.data.password, bcrypt.genSaltSync()),
            role: defautlRole,
        }

        const user = await prisma.user.create({
            data: registerData,
        })

        const { id, name, email, phone, photo, verified, role } = user
        const { accessToken, refreshToken } = await getAccessToken({ id })

        return res.json({
            name,
            email,
            phone,
            photo,
            verified,
            role,
            accessToken,
            refreshToken,
        })
    } catch (error) {
        next(error)
    }
})

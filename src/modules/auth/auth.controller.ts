import { Request, Response } from 'express'
import { prisma } from 'utils/prisma'
import { BaseError } from 'utils/errors'
import { AuthenticateSchema, LoginSchema, RefreshTokenSchema, RegisterSchema } from './auth.schema'
import bcrypt from 'bcrypt'
import { DEFAULT_ROLE } from 'modules/user/user.config'
import { createUserToken, refreshAccessToken } from './auth.services'
import jwt from 'jsonwebtoken'
import { refreshTokenSecret } from 'config'

export const login = async (req: Request, res: Response) => {
    const loginData = LoginSchema.parse(req.body)
    const user = await prisma.user.findFirst({
        where: { email: loginData.email },
    })
    if (user === null || !bcrypt.compareSync(loginData.password, user.password)) {
        throw new BaseError('Invalid email or password', 400)
    }

    const { name, email, photo, role } = user
    const { accessToken, refreshToken } = await createUserToken(user)

    return res.json({
        name,
        email,
        photo,
        role,
        accessToken,
        refreshToken,
    })
}

export const logout = async (req: Request, res: Response) => {
    const { authorization: accessToken } = AuthenticateSchema.parse(req.headers)
    const tokenData = await prisma.userToken.findFirst({ where: { accessToken } })
    await prisma.userToken.delete({ where: { id: tokenData?.id } })

    return res.status(202).json({})
}

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = RefreshTokenSchema.parse(req.body)
    try {
        const { id: userId } = jwt.verify(refreshToken, refreshTokenSecret) as { id: string }
        const tokenData = await prisma.userToken.findFirst({
            where: { userId, refreshToken },
        })
        if (!tokenData) {
            throw new BaseError('Invalid token', 400)
        }
        const { accessToken } = await refreshAccessToken(tokenData)
        return res.json({ accessToken })
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            if (error.message === 'jwt expired') {
                throw new BaseError('Expired token', 400)
            }
            throw new BaseError('Invalid token', 400)
        }
        throw error
    }
}

export const register = async (req: Request, res: Response) => {
    const registerData = await RegisterSchema.parseAsync(req.body)

    const user = await prisma.user.create({
        data: {
            name: registerData.name,
            email: registerData.email,
            password: bcrypt.hashSync(registerData.password, bcrypt.genSaltSync()),
            role: DEFAULT_ROLE,
        },
    })

    const { name, email, photo, role } = user
    const { accessToken, refreshToken } = await createUserToken(user)

    return res.json({
        name,
        email,
        photo,
        role,
        accessToken,
        refreshToken,
    })
}

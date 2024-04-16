import { AppRequest } from 'types'
import { AuthenticateSchema } from './auth.schema'
import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ZodError } from 'zod'
import { accessTokenSecret } from 'config'
import { prisma } from 'utils/prisma'
import { BaseError } from 'utils/errors'
import { User } from '@prisma/client'

export const hasAuthed = async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
        const { authorization: accessToken } = AuthenticateSchema.parse(req.headers)
        const { id: userId } = jwt.verify(accessToken, accessTokenSecret) as { id: string }
        const userToken = await prisma.userToken.findFirst({
            where: { accessToken, userId },
            include: { user: true },
        })
        if (!userToken) {
            throw new BaseError('Invalid token', 401)
        }
        req.userAuth = userToken.user
    } catch (error) {
        if (error instanceof ZodError) {
            return next(new BaseError('Unauthorized', 401))
        } else if (error instanceof jwt.JsonWebTokenError) {
            if (error.message === 'jwt expired') {
                return next(new BaseError('Expired token', 401))
            }
            return next(new BaseError('Invalid token', 401))
        }
        return next(error)
    }

    return next()
}

export const hasRole = (...roles: string[]) => {
    return async (req: AppRequest, res: Response, next: NextFunction) => {
        if (!roles.includes(req.userAuth?.role ?? '')) {
            return next(new BaseError('Forbidden', 403))
        }
        return next()
    }
}

export const getUserAuth = (req: AppRequest): User => {
    if (!req.userAuth) {
        throw new BaseError('Unauthorized', 401)
    }
    return req.userAuth
}

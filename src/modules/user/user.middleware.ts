import { User } from '@prisma/client'
import { NotFoundError } from 'utils/errors'
import { NextFunction, Request, Response } from 'express'
import { prisma } from 'utils/prisma'

export interface UserRequest extends Request {
    user?: User | null
}

export const userMiddleware = async (req: UserRequest, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findFirst({
            where: { id: req.params.id },
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

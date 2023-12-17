import jwt from 'jsonwebtoken'
import { accessTokenSecret, refreshTokenSecret } from '../config'
import { prisma } from './prisma'
import { User, UserToken } from '@prisma/client'

export const getAccessToken = async ({
    id,
}: {
    id: number
}): Promise<{
    accessToken: string
    refreshToken: string
}> => {
    const accessToken = jwt.sign({ id }, accessTokenSecret, {
        expiresIn: 60 * 30, // 30 minutes
    })
    const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
        expiresIn: '14d', // 14 days
    })

    const experiedAt = new Date()
    experiedAt.setDate(experiedAt.getDate() + 14)
    await prisma.userToken.create({
        data: {
            userId: id,
            accessToken,
            refreshToken,
            experiedAt,
        },
    })

    return {
        accessToken,
        refreshToken,
    }
}

export const validAccessToken = async (accessToken: string): Promise<User | null> => {
    let validToken
    try {
        validToken = jwt.verify(accessToken, accessTokenSecret) as { id: number; exp: number }
    } catch (error) {
        return null
    }
    if (!validToken || validToken.exp * 1000 < Date.now()) {
        return null
    }
    const tokenData = await prisma.userToken.findFirst({
        where: {
            accessToken,
            userId: validToken.id,
        },
        include: {
            user: true,
        },
    })
    return tokenData?.user ?? null
}

export const validRefreshToken = async (refreshToken: string): Promise<UserToken | null> => {
    let validToken
    try {
        validToken = jwt.verify(refreshToken, refreshTokenSecret) as { id: number; exp: number }
    } catch (error) {
        return null
    }
    if (!validToken || validToken.exp * 1000 < Date.now()) {
        return null
    }
    const tokenData = await prisma.userToken.findFirst({
        where: {
            refreshToken,
            userId: validToken.id,
            experiedAt: {
                gt: new Date(),
            },
        },
    })
    return tokenData
}

export const refreshAccessToken = async (
    tokenData: UserToken,
): Promise<{
    accessToken: string
}> => {
    const accessToken = jwt.sign({ id: tokenData.userId }, accessTokenSecret, {
        expiresIn: 60 * 30, // 30 minutes
    })

    const experiedAt = new Date()
    experiedAt.setDate(experiedAt.getDate() + 14)
    await prisma.userToken.update({
        where: {
            id: tokenData.id,
        },
        data: {
            accessToken,
        },
    })

    return {
        accessToken,
    }
}

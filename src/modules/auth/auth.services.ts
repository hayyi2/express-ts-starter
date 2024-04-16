import { User, UserToken } from '@prisma/client'
import { accessTokenExpiresIn, accessTokenSecret, refreshTokenExpiresIn, refreshTokenSecret } from 'config'
import { prisma } from 'utils/prisma'
import jwt from 'jsonwebtoken'

export const createUserToken = async ({ id }: User): Promise<UserToken> => {
    const accessToken = jwt.sign({ id }, accessTokenSecret, {
        expiresIn: accessTokenExpiresIn,
    })
    const refreshToken = jwt.sign({ id }, refreshTokenSecret, {
        expiresIn: refreshTokenExpiresIn,
    })
    const userToken = await prisma.userToken.create({
        data: {
            userId: id,
            accessToken,
            refreshToken,
        },
    })
    return userToken
}

export const refreshAccessToken = async (tokenData: UserToken): Promise<UserToken> => {
    const accessToken = jwt.sign({ id: tokenData.userId }, accessTokenSecret, {
        expiresIn: accessTokenExpiresIn,
    })

    const newTokenData = await prisma.userToken.update({
        where: { id: tokenData.id },
        data: { accessToken },
    })

    return newTokenData
}

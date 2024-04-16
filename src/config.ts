export const port = process.env.PORT ?? '8000'

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET ?? 'ACCESS_TOKEN_SECRET'
export const accessTokenExpiresIn = 30 * 60 // 30 minutes
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET ?? 'REFRESH_TOKEN_SECRET'
export const refreshTokenExpiresIn = 14 * 24 * 60 * 60 // 14 days

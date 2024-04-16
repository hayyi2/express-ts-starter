import { Router } from 'express'
import { catchError } from 'utils/errors'
import { login, logout, refreshToken, register } from './auth.controller'
import { hasAuthed } from './auth.middleware'

export const authRoutes = Router()

authRoutes.post('/auth/login', catchError(login))
authRoutes.post('/auth/logout', hasAuthed, catchError(logout))
authRoutes.post('/auth/refresh_token', catchError(refreshToken))

authRoutes.post('/register', catchError(register))
// forgot password

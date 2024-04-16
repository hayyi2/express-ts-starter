import { Router } from 'express'
import { catchError } from 'utils/errors'
import { createUser, deleteUser, getUser, getsUser, updateUser } from './user.controller'
import { hasAuthed, hasRole } from 'modules/auth/auth.middleware'
import { USER_ROLE } from './user.config'
import { userMiddleware } from './user.middleware'

export const userRoutes = Router()
userRoutes.use(hasAuthed, hasRole(USER_ROLE.ADMIN))

userRoutes.get('/', catchError(getsUser))
userRoutes.get('/:id', userMiddleware, catchError(getUser))
userRoutes.post('/', catchError(createUser))
userRoutes.put('/:id', userMiddleware, catchError(updateUser))
userRoutes.delete('/:id', userMiddleware, catchError(deleteUser))

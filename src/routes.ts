import { Router } from 'express'
import { helloRoutes } from './apis/hello'
import { userRoutes } from './apis/user'
import { authRoutes } from './apis/auth'
import { postRoutes } from './apis/post'

export const routes = Router()

routes.use('/', helloRoutes)
routes.use('/auth', authRoutes)
routes.use('/users', userRoutes)
routes.use('/posts', postRoutes)

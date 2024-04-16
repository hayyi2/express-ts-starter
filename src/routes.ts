import { Router } from 'express'
import { helloRoutes } from 'modules/hello/hello.routes'
import { authRoutes } from 'modules/auth/auth.routes'
import { profileRoutes } from 'modules/profile/profile.routes'
import { userRoutes } from 'modules/user/user.routes'
import { noteRoutes } from 'modules/note/note.routes'

export const routes = Router()

routes.use('/', helloRoutes)

// auth & profile module
routes.use('/', authRoutes)
routes.use('/profile', profileRoutes)

// manage data module
routes.use('/users', userRoutes)
routes.use('/notes', noteRoutes)

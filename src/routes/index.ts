import { Router } from 'express'
import { helloRoutes } from './helloRoutes'

export const routes = Router()

routes.use('/', helloRoutes)

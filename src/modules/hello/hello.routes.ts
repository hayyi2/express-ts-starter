import { Router } from 'express'
import { hello } from './hello.controller'

export const helloRoutes = Router()

helloRoutes.get('/', hello)

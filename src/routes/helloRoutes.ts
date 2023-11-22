import { Request, Response, Router } from 'express'

export const helloRoutes = Router()

helloRoutes.get('/', (req: Request, res: Response) => {
    res.send({
        message: 'Hello world!',
    })
})

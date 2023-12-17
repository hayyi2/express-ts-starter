import { Request, Response, Router } from 'express'

export const helloRoutes = Router()

helloRoutes.get('/', (req: Request, res: Response) => {
    return res.json({
        message: 'Hello world!',
    })
})

helloRoutes.get('/ping', (req: Request, res: Response) => {
    return res.send('pong')
})

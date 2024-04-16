import { Request, Response } from 'express'

export const hello = (req: Request, res: Response) => {
    return res.json({
        message: 'Hello world!',
    })
}

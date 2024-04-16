import express, { Express } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { routes } from 'routes'
import { errorHandler, notFoundHandler } from 'utils/errors'

// BigInt.prototype.toJSON = function () {
//     const int = Number.parseInt(this.toString())
//     return int ?? this.toString()
// }

dotenv.config()

export const app: Express = express()

app.use(express.json())
app.use(cors())

app.use(express.static('public'))

app.use('/api', routes)
app.use(notFoundHandler)
app.use(errorHandler)

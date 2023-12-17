import express, { Express } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { routes } from './routes'
import { errorHandler, notFoundHandler } from './errors'
import { port } from './config'

dotenv.config()

const app: Express = express()

app.use(express.json())
app.use(cors())

app.use(express.static('public'))

app.use(routes)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

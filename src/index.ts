import express, { Express } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { routes } from './routes'

dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? '8000'

app.use(express.json())
app.use(cors())

app.use(routes)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

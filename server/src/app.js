import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

import taskRoutes from './routes/taskRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use('/api/tasks', taskRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/stats', statsRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
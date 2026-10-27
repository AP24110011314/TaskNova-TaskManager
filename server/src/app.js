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

const clientOrigin = process.env.CLIENT_ORIGIN

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, curl, and mobile requests without origin
    if (!origin) return callback(null, true)

    // Allow localhost during local dev
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true)
    }

    // Allow all Vercel deployments (*.vercel.app)
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true)
    }

    // Allow explicitly configured CLIENT_ORIGIN (supports comma-separated list or wildcard)
    if (clientOrigin) {
      const allowed = clientOrigin.split(',').map(o => o.trim().replace(/\/+$/, ''))
      if (allowed.includes(origin) || allowed.includes('*')) {
        return callback(null, true)
      }
    }

    // Fallback permit
    callback(null, true)
  },
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
import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/db.js'
import app from './app.js'

const PORT = process.env.PORT || 5001

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`API: http://localhost:${PORT}/api`)
    console.log(`Health: http://localhost:${PORT}/api/health`)
  })
}

startServer()
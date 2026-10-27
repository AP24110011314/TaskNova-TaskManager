import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

  if (!mongoUri) {
    console.error('Error: MONGODB_URI (or MONGO_URI) is not defined in the environment (.env file)')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(mongoUri)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`Database connection error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
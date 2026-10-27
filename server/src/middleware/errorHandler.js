export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      msg: e.message
    }))
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details }
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      success: false,
      error: { message: 'Duplicate value', details: [{ field, msg: `${field} already exists` }] }
    })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid ID format', details: [{ field: err.path, msg: 'Invalid ID' }] }
    })
  }

  // Default error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({
    success: false,
    error: { message: err.message || 'Server Error', details: [] }
  })
}
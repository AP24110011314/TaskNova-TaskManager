export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack || err.message)
  }

  // SyntaxError from body-parser (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: [{ field: 'body', msg: 'Malformed JSON payload' }]
      }
    })
  }

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
    const field = Object.keys(err.keyValue || {})[0] || 'field'
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
  const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500)
  const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
    ? 'Internal Server Error'
    : (err.message || 'Server Error')

  res.status(statusCode).json({
    success: false,
    error: { message, details: [] }
  })
}
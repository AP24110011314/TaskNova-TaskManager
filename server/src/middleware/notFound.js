export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Not found',
      details: [{ field: 'route', msg: `Route ${req.originalUrl} not found` }]
    }
  })
}
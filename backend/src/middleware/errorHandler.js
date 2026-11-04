export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  console.error(err);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

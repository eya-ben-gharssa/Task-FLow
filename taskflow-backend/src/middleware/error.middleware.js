export function errorHandler(err, req, res, next) {// Why 4 parameters? well, Express recognizes this as an error-handling middleware because it has four parameters.
  console.error(err);

  res.status(500).json({
    message: "Internal server error"
  });
}
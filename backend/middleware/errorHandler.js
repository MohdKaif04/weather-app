// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    error: "Internal server error. Please try again later.",
  });
};

module.exports = errorHandler;
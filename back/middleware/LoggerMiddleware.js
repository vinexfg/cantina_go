class LoggerMiddleware {
  static createLogger() {
    return (req, res, next) => {
      const timestamp = new Date().toISOString();
      const method = req.method;
      const path = req.path;
      console.log(`${timestamp} - ${method} ${path}`);
      next();
    };
  }
}

export default LoggerMiddleware;

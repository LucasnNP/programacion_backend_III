import logger from "../config/logger.js";

const addLogger = (req, res, next) => {
  req.logger = logger;

  req.logger.http(`${req.method} - ${req.url}`);

  next();
};

export default addLogger;

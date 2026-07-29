import logger from "../config/logger.js";

const addLogger = (req, res, next) => {
  req.logger = logger;

  req.logger.http(`${req.method} - ${req.originalUrl}`); // originalUrl para que registre siempre la URL completa

  next();
};

export default addLogger;

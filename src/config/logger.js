import winston from "winston";
import config from "./config.js";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "magenta",
    warning: "yellow",
    info: "blue",
    http: "green",
    debug: "white",
  },
};

winston.addColors(customLevelsOptions.colors);

// Formato reutilizable
const lineFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Formato para la consola
const consoleFormat = winston.format.combine(
  winston.format.colorize({
    colors: customLevelsOptions.colors,
  }),
  winston.format.timestamp({
    format: "DD/MM/YYYY HH:mm:ss",
  }),
  lineFormat,
);

// Formato para archivo
const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: "DD/MM/YYYY HH:mm:ss",
  }),
  lineFormat,
);

const transports =
  config.mode === "production"
    ? [
        new winston.transports.Console({
          level: "info",
          format: consoleFormat,
        }),
        new winston.transports.File({
          filename: "./errors.log",
          level: "error",
          format: fileFormat,
        }),
      ]
    : [
        new winston.transports.Console({
          level: "debug",
          format: consoleFormat,
        }),
      ];

const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports,
});

export default logger;

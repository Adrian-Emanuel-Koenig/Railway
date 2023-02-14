const winston = require("winston");

const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.simple(),
      winston.format.timestamp(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    transports: [
      new winston.transports.Console({
        level: "info",
        format: winston.format.colorize({ all: true }),
      }),
      new winston.transports.File({
        level: "warn",
        filename: "./src/logs/warn.log",
      }),
      new winston.transports.File({
        level: "error",
        filename: "./src/logs/error.log",
      }),
    ],
  });

  module.exports =  logger;
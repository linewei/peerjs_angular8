const winston = require('winston');

const logDir = __dirname + '/../../log/';
const myLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: logDir + 'error.log', level: 'error' }),
    new winston.transports.File({ filename: logDir + 'combined.log' })
  ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  myLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = myLogger;
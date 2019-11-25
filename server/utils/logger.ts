const winston = require('winston');

const logDir = __dirname + '/../../log/';
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: logDir + 'error.log', level: 'error' }),
    new winston.transports.File({ filename: logDir + 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

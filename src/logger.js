import winston  from "winston"
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  level: 'trace',
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false
});
if(process.env.NODE_ENV !== "production")
  winston.level = 'debug'
else
  winston.level = 'error'
export default winston
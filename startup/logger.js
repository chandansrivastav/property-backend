const winston = require('winston');
const fs = require('fs');
require('winston-daily-rotate-file');

const logPath = './logs'
if (!fs.existsSync(logPath)) {
	fs.mkdirSync(logPath);
}
const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
}
winston.addColors(colors)
module.exports = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
		winston.format.colorize({ all: true }),
		winston.format.printf(
			(info) => `${info.timestamp} ${info.level}: ${info.message}`,
		)),
	transports: [
		new winston.transports.Console(),
		// new winston.transports.DailyRotateFile({ filename: logPath + '/error.log', level: 'error' }),
		// new winston.transports.DailyRotateFile({ filename: logPath + '/info.log', level: 'info' }),
	],
	exceptionHandlers: [
		new winston.transports.Console(),
		// new winston.transports.DailyRotateFile({ filename: logPath + '/uncaughtExceptions.log' })
	]
});
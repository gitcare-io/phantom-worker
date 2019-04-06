const bunyan = require('bunyan');
const logger = bunyan.createLogger({
  name: "phantom-workers",
  serializers: bunyan.stdSerializers,
  streams: [{
    stream: process.stderr
  }, {
    type: 'rotating-file',
    path: 'logs/phantom-workers.log',
    period: '1d',
    count: 10
  }]
});

module.exports = logger;
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const server = new http.Server();
const {pipeline} = require('stream');

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (~pathname.indexOf('/')) {
        res.statusCode = 400;
        res.end('FATAL ERROR!!!!');
        break;
      }

      if (fs.existsSync(filepath)) {
        res.statusCode = 409;
        res.end('File already exists!');
        break;
      }

      const limitedStream = new LimitSizeStream({limit: 1048576, encoding: 'utf-8'}); // 8 байт
      const writeStream = fs.createWriteStream(filepath);

      pipeline(req, limitedStream, writeStream, (err) => {
        if (err) {
          fs.rmSync(filepath);

          if (err.code === 'LIMIT_EXCEEDED') {
            res.statusCode = 413;
            // QUESTION: не понимаю, почему тут res.end не завершает обработку запроса
            res.end('Limit exceeded');
          } else {
            res.statusCode = 500;
            res.end('Unknown error');
          }
        } else {
          res.statusCode = 201;
          res.end('Success');
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

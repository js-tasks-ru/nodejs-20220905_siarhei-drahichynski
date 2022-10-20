const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const server = new http.Server();

const SIZE_LIMIT = 1048576;

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':
      if (pathname.includes('/') || pathname.includes('..')) {
        res.statusCode = 400;
        res.end('FATAL ERROR!!!!');
        break;
      }

      if (req.headers['content-length'] > SIZE_LIMIT) {
        res.statusCode = 413;
        res.end('Limit exceeded');
      }

      const limitedStream = new LimitSizeStream({limit: SIZE_LIMIT});
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      req.pipe(limitedStream).pipe(writeStream);

      limitedStream.on('error', (error) => {
        if (error.code === 'LIMIT_EXCEEDED') {
          res.statusCode = 413;
          res.end('Limit exceeded');
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
        }

        fs.unlink(filepath, () => {});
      });

      writeStream.on('error', (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('file exist');
        } else {
          res.statusCode = 500;
          res.end('Internal server error');
        }
      });

      req.on('aborted', () => {
        fs.unlink(filepath, () => {});
      });

      writeStream.on('finish', () => {
        res.statusCode = 201;
        res.end('succeeded');
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname.slice(1);

  switch (req.method) {
    case 'GET':
      if (~pathname.indexOf('/')) {
        res.statusCode = 400;
        res.end('FATAL ERROR!!!!');
        break;
      }

      const filepath = path.join(__dirname, 'files', pathname);

      const readStream = fs.createReadStream(filepath);
      readStream.pipe(res);

      readStream.on('error', ({ code }) => {
        if (code === 'ENOENT') {
          res.statusCode = 404;
          res.end(`Not Found - ${filepath} - ${pathname}`);
        } else {
          res.statusCode = 500;
          res.end('Something went wrong');
        }
      });

      readStream.on('end', () => {
        res.end();
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;

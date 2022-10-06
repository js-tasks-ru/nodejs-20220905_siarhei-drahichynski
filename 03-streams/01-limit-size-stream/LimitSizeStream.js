const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({limit, ...rest}) {
    super(rest);
    this.limit = limit;
    this.used = 0;
  }

  _transform(chunk, encoding, callback) {
    this.used += Buffer.byteLength(chunk);
    const error = this.used > this.limit ? new LimitExceededError() : null;
    callback(error, chunk);
  }
}

module.exports = LimitSizeStream;

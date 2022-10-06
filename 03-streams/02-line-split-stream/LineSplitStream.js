const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.reminder = '';
  }

  _transform(chunk, encoding, callback) {
    const lines = (this.reminder + chunk.toString()).split(os.EOL);
    this.reminder = lines.at(-1);

    lines.slice(0, -1).forEach((line) => {
      this.push(line);
    });

    callback();
  }

  _flush(callback) {
    callback(null, this.reminder);
  }
}

module.exports = LineSplitStream;

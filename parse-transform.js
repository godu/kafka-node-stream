var util = require('util');
var Transform = require('stream').Transform;

util.inherits(Parse, Transform);

function Parse(options) {
  options = options || {};
  options.objectMode = true;

  if (!(this instanceof Parse))
    return new Parse(options);

  Transform.call(this, options);
}

Parse.prototype._transform = function(chunk, encoding, done) {
  this.push(JSON.parse(chunk));
  done();
};

module.exports = Parse;

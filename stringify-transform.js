var util = require('util');
var Transform = require('stream').Transform;

util.inherits(Stringify, Transform);

function Stringify(options) {
  options = options || {};
  options.objectMode = true;

  if (!(this instanceof Stringify))
    return new Stringify(options);

  Transform.call(this, options);
}

Stringify.prototype._transform = function(chunk, encoding, done) {
  this.push(JSON.stringify(chunk));
  done();
};

module.exports = Stringify;

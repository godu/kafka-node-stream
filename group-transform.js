var util = require('util');
var Transform = require('stream').Transform;

util.inherits(Group, Transform);

function Group(options) {
  options = options || {};
  options.objectMode = true;

  if (!(this instanceof Group))
    return new Group(options);

  Transform.call(this, options);

  this.limit = options.limit || 100;
  this._buffer = [];
}

Group.prototype._transform = function(chunk, encoding, done) {
  this._buffer.push(chunk);

  if(this._buffer.length >= this.limit) {
    this.push(this._buffer);
    this._buffer = [];
  }

  done();
};

Group.prototype._flush = function(done) {
  this.push(this._buffer);
  this._buffer = [];

  done();
};

module.exports = Group;

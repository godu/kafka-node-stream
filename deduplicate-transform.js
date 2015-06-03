var util = require('util');
var Transform = require('stream').Transform;
var awscp = require('awscp');

util.inherits(Deduplicate, Transform);

function Deduplicate(options) {
  options = options || {};
  options.objectMode = true;

  this.cache = awscp.cache(options);

  if(!options.uniqKeys) throw new Error('uniqKeys missing');
  this.uniqKeys = options.uniqKeys;
  this.timeout = options.timeout || 10;


  if (!(this instanceof Deduplicate))
    return new Deduplicate(options);

  Transform.call(this, options);
}

Deduplicate.prototype._genKey = function(object) {
  return this.uniqKeys.map(function(key) {
    return object[key];
  }).join(':');
};

Deduplicate.prototype._transform = function(object, encoding, done) {
  var key = this._genKey(object);

  this.cache.add(key, true, this.timeout, function(err, res) {
    if(res === true)
      this.push(err, object);

    if(err && err.notStored === true) {
      console.log(err, res);
      err = null;
    }

    done(err);
  }.bind(this));
};

module.exports = Deduplicate;

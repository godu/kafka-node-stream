'use strict';

var Readable = require('stream').Readable;
var util = require('util');
util.inherits(Consumer, Readable);

function Consumer(options) {
  options = options || {};

  options.objectMode = true;

  Readable.call(this, options);

  this.consumer = options.consumer;

  this.paused = false;
  this.ended = false;
  this.destroyed = false;
  this.readable = true;

  this.autoDestroy = !(options.autoDestroy === false);

  this.consumer.on('message', function (message) {
    this.push(message.value);
  }.bind(this));
  this.consumer.on('error', function (err) {
    this.emit('error', err);
    this.end();
  }.bind(this));
}

Consumer.prototype._read = function() {
  this.resume();
}

Consumer.prototype.pause = function() {
    if(this.paused) return;
    this.consumer.pause();
    this.paused = true;
    return this;
}

Consumer.prototype.resume = function() {
    if(this.paused) {
      this.consumer.resume();
      this.paused = false;
      this.emit('resume');
    }
    if(!this.paused)
      this.emit('drain');
    return this;
}

Consumer.prototype._end = function() {
  this.writable = false;
  this.consumer.close(function() {
    if(!this.readable && this.autoDestroy)
      this.destroy();
  }.bind(this));
}

Consumer.prototype.end = function () {
  if(this.ended) return;
  this.ended = true;
  this._end();
  return this;
}

Consumer.prototype.destroy = function () {
  if(this.destroyed) return;
  this.destroyed = true;
  this.ended = true;
  this.readable = false;
  this.emit('close');
  return this;
}

module.exports = Consumer;

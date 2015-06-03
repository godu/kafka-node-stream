'use strict';

var Writable = require('stream').Writable;
var util = require('util');
util.inherits(Producer, Writable);

function Producer(options) {
  options = options || {};

  options.objectMode = true;

  Writable.call(this, options);

  this.producer = options.producer;

  this.paused = false;
  this.ended = false;
  this.destroyed = false;
  this.writable = true;

  this.ready = false;

  this.autoDestroy = !(options.autoDestroy === false);
}

Producer.prototype._write = function (object, enc, next) {
  if(Array.isArray(object))
    object = object.map(this.stringify);
  else
    object = this.stringify(object);

  this.producer.send([{
    topic: 'history',
    messages: object
  }], next);
};

Producer.prototype.stringify = function(object) {
  return JSON.stringify(object);
};

Producer.prototype._end = function() {
  this.writable = false;
  this.producer.close(function() {
    if(!this.readable && this.autoDestroy)
      this.destroy();
  }.bind(this));
}

Producer.prototype.end = function () {
  if(this.ended) return;
  this.ended = true;
  this._end();
  return this;
}

Producer.prototype.destroy = function () {
  if(this.destroyed) return;
  this.destroyed = true;
  this.ended = true;
  this.writable = false;
  this.emit('close');
  return this;
}

module.exports = Producer;

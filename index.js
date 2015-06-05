'use strict';

var kafka = require('kafka-node');
var HighLevelConsumer = kafka.HighLevelConsumer;
var HighLevelProducer = kafka.HighLevelProducer;
var client = new kafka.Client('localhost:2181');
var consumer = new HighLevelConsumer(client, [{ topic: 'history' }], {
  groupId: 'arthur-test'
});

var productClient = new kafka.Client('localhost:2181');
var producer = new HighLevelProducer(productClient);


var ConsumerStream = require('./consumer-stream');
var ProducerStream = require('./producer-stream');

var reader = new ConsumerStream({
  consumer: consumer
});

var writer = new ProducerStream({
  producer: producer,
  topic: 'history'
});

var Parse = require('./parse-transform');
var Stringify = require('./stringify-transform');
var Group = require('./group-transform');
var Deduplicate = require('./deduplicate-transform');

reader
  .pipe(new Parse())

  .pipe(new Deduplicate({
    uniqKeys: ['user', 'url'],
    // discovery: {
    //   endpoints: ['staging-deduplicate.29te5m.cfg.euw1.cache.amazonaws.com:11211']
    // }
    hostnames: ['localhost:11211']
  }))

  .pipe(new Stringify())
  .pipe(process.stdout);

  /*
  //.pipe(writer);
  .pipe(new Group({
    limit: 100
  }))*/

process.on('SIGINT', function() {
  reader.end();
});





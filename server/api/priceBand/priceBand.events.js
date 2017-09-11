/**
 * PriceBand model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var PriceBand = require('./priceBand.model');
var PriceBandEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PriceBandEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  PriceBand.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PriceBandEvents.emit(event + ':' + doc._id, doc);
    PriceBandEvents.emit(event, doc);
  }
}

module.exports = PriceBandEvents;

/**
 * PricingPlan model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var PricingPlan = require('./pricingPlan.model');
var PricingPlanEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PricingPlanEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  PricingPlan.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PricingPlanEvents.emit(event + ':' + doc._id, doc);
    PricingPlanEvents.emit(event, doc);
  }
}

module.exports = PricingPlanEvents;

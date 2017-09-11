/**
 * Team model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var Team = require('./team.model');
var TeamEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
TeamEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Team.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    TeamEvents.emit(event + ':' + doc._id, doc);
    TeamEvents.emit(event, doc);
  }
}

module.exports = TeamEvents;

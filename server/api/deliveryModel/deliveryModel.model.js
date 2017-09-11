'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var DeliveryModelSchema = new Schema({
  //Type like onDemand,slotted or hyperlocal
  name: {
    type: String,
    required: true
  }
},
  //automatically adds createdAt and updatedAt fields to the document
  {
    timestamps: true
  });


module.exports = mongoose.model('DeliveryModel', DeliveryModelSchema);

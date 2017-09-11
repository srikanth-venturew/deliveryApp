'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var PricingPlanSchema = new Schema({
  //gold,silver,platinum ultimate .,etc
  //This includes all base plans.
  name: {
    type: String,
    required: true
  },
  //The number of items that can be delivered 
  quantity: {
    type: Number,
    required: true
  },
  //price of the plan
  price: {
    type: Number,
    required: true
  },
  //The time in minutes by which the item can be delivered.
  time:{
    type:Number,
    required:true
  }
},
  //automatically adds createdAt and updatedAt fields to the document
  {
    timestamps: true
  });


module.exports = mongoose.model('PricingPlan', PricingPlanSchema);
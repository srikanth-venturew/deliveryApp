'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var PriceBandSchema = new Schema({
  //minimum quantity of deliveries 
  minQuantity: {
    type:Number,
    required:true
  },
  //maximum quantity of deliveries 
  maxQuantity: {
    type:Number,
    required:true
  },
  //price set at user registration
  price:{
    type:Number,
    required:true
  },
  //The plan that is customized
  plan:{
    type:Schema.Types.ObjectId,
    ref:'PricingPlan',
    required:true
  },
  //whether the band is active 
  active: {
    type: Boolean,
    default:true
  }
});

module.exports = mongoose.model('PriceBand', PriceBandSchema);

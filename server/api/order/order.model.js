'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
  //name of the order
  name:{
    type: String,
    required: true
  },
  //Delivery model can be ondemand or scheduled
  deliveryModel: {
    type: String,
    required: true
  },
  //The delivery Type can be a cargo/paper/document .,etc.
  deliveryType: {
    type: String,
    required: true
  },
  //The address from where to pickup 
  pickupAddress: {
    type: String,
    required: true
  },
  //The address to where to deliver
  deliveryAddress: {
    type: String,
    required: true
  },
  //pickup and delivery coordinates , coordinates in the order
  //longitude and latitude.
  pickupCoords: {
    type: [Number],
    index: '2dsphere'
  },
  deliveryCoords: {
    type: [Number],
    index: '2dsphere'
  },
  //The requested time to deliver by the customer
  requestedTime: {
    type: Date,
    required: true
  },
  //The actual delivered time 
  deliveryTime: {
    type: Date
  },
  //status of the order whether it is assigned,unassigned or completed
  status: {
    type: String,
    default: 'unassigned'
  },
  //The id of the vendor who created the order
  vendor_id: {
    type: String
  },
  description:{
    type: String,
    required: true
  },
  //The runner that will be assigned to undertake this order
  runnerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
},
  //automatically adds createdAt and updatedAt fields to the document
  {
    timestamps: true
  });

module.exports = mongoose.model('Order', OrderSchema);

'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var constants = require('../../config/constants');


//Collection for storing records of rejected records.
var runnerRejectionSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTime: {
    type: Date
  },
  runnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},
//automatically adds createdAt and updatedAt fields to the document
{
  timestamps: true
});

mongoose.model('RunnerRejection', runnerRejectionSchema);

var addressSchema = new Schema({
  name: {
    type: String,
    validate: {
      validator: function (v) {
        return /^.{4,}$/.test(v);
      },
      message: '{VALUE} is not valid'
    },
    required: true
  },
  //Contact phone at the location
  phoneNumber: {
    type: Number,
    validate: {
      validator: function (v) {
        return /^(\+?91|0)?[789]\d{9}$/.test(v);
      },
      message: '{VALUE} is not valid'
    },
    required: true
  },
  //The address 
  address: {
    type: String,
    required: true
  },
  subArea: {
    type: String,
    required: true
  },
  mainArea: {
    type: String,
    required: true
  },
  landmark: {
    type: String
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  pinCode: {
    type: Number,
    validate: {
      validator: function (v) {
        return /^[0-9]{6,6}$/.test(v);
      },
      message: '{VALUE} is not valid'
    },
    required: true
  },
  //longitude and latitude.
  coords: {
    type: [Number],
    index: '2dsphere'
  }
});

var OrderSchema = new Schema({
  //name of the customer
  name: {
    type: String,
    required: true
  },
  //Delivery model can be ondemand or scheduled
  deliveryModel: {
    type: String,
    required: true
  },
  //The name of the item being delivered
  deliveryItem: {
    type: String,
    required: true
  },
  //Name of the plan chosen 
  deliveryPlan: {
    type: String,
    required: true
  },
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  //The requested time to deliver by the customer
  requestedTime: {
    type: Date,
    required: true
  },
  //Time at which the runner delivered item
  completedTime: {
    type: Date
  },
  //Time at which the runner started the trip
  startTripTime: {
    type: Date
  },
  //Time at which the runner ended the trip
  endTripTime: {
    type: Date
  },
  //status of the order whether it is assigned,unassigned or completed
  status: {
    type: Number,
    default: constants.ORDER_UNASSIGNED
  },
  //The id of the vendor who created the order
  vendor_id: {
    type: String
  },
  //The description of the task
  description: {
    type: String,
    required: true
  },
  //The url used for tracking details of the delivery
  trackingUrl: {
    type: String,
  },
  //name of the vendor/Manager who created the task/order.
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  //Time when the manager tries to assign the task to the runner
  assignedTime: {
    type: Date
  },
  //Whether the runner has accepted or rejected the task
  acceptanceStatus: {
    type: Number
  },
  //Time at which the runner has accepted the task
  acceptanceTime: {
    type: Date
  },
  //List of runners who have rejected the Task
  declinedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  //The runner that is assigned to undertake this order
  runnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  //Amount charged for the order
  amount: {
    type: Number
  }
},
  //automatically adds createdAt and updatedAt fields to the document
  {
    timestamps: true
  });

module.exports = mongoose.model('Order', OrderSchema);

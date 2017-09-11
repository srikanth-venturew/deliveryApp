'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var TeamSchema = new Schema({
  name: {
    type : String,
    required:true
  },
  //Manager who have created the teams
  vendorId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:true
  }
});

module.exports = mongoose.model('Team', TeamSchema);

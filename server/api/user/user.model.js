'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var constants = require('../../config/constants');

//Runner Schema , 
var RunnerSchema = new Schema({
  //The work type for the runner : part or full time
  workType: {
      type: Number,
      default: constants.RUNNER_WORK_FULL_TIME
  },
  //The name of the team to which the runner belongs to .
  team:{
    type:String
  },
  //The status of the app , default is on
  appStatus: {
      type: Number,
      default: constants.APP_STATUS_ON
  },
  //Current coordinates of the runner 
  coords: {
      type: [Number],
      index: '2dsphere'
  },
  homeBranch:{
    type: String
  },
  //free or busy
  free: {
      type: Number,
      default: constants.RUNNER_FREE
  },
  //percentage of the battery level
  battery:{
    type: Number,
  },
  //car/bike .,etc
  vehicleType:{
    type: String
  },
  //Number 
  vehicleNumber:{
    type:String
  },
  //The manager of the runner 
  manager:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  //Rating or stars for the runner
  rating :{
    type: Number
  },
  //IOS or android
  deviceName:{
    type: String
  },
  //version of the device
  deviceVersion:{
    type: String
  },
  //Last location where the runner was spotted
  lastLocation:{
    type: String
  },
  deliveryId: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
  }],
  totalDistanceTravelled:{
    type:Number
  },
  jobStatus:{
    type:Number,
    default:constants.WORKING
  }
});

//Runner Schema , 
var VendorSchema = new Schema({
  //The name of the vendor like HelloFood .,etc
  name: {
      type: String,
      validate: {
        validator: function(v) {
          return /^.{4,}$/.test(v);
        },
        message: '{VALUE} is not valid'
      },
      required:true
  },
  //The type of delivery //onDemand,Scheduled .,etc
  deliveryServiceType:{
    type: String,
    required:true
  },
  //The price band selected at the time of the registration
  planBand:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PriceBand',
    required:true
  },
  apiKey:{
    type: String
  },
  jobStatus:{
    type:Number,
    default:constants.WORKING
  }
});

var UserSchema = new Schema({
  firstName: {
    type:String,
    validate: {
      validator: function(v) {
        return /^.{3,}$/.test(v);
      },
      message: '{VALUE} is not valid'
    },
    required:true
  },
  lastName: {
    type:String
  },
  email: {
    type: String,
    lowercase: true
  },
  role: {
    type: String,
    default: 'user'
  },
  password: String,
  phoneNumber:{
    type : Number,
    validate: {
      validator: function(v) {
        return /^(\+?91|0)?[789]\d{9}$/.test(v);
      },
      message: '{VALUE} is not valid'
    },
    required:true
  },
  address:String,
  area:String,
  subArea:String,
  city:String,
  Country:String,
  zip:{
    type:Number,
    validate: {
      validator: function(v) {
        return /^[0-9]{6,6}$/.test(v);
      },
      message: '{VALUE} is not valid'
    },
    required:true
  },
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  runner:RunnerSchema,
  vendor:VendorSchema,
  active:{
    type: Number,
    default: constants.ACCOUNT_ACTIVE
  }
});

/**
 * Virtuals
 */

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }
    return password.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    return this.constructor.findOneAsync({ email: value })
      .then(function(user) {
        if (user) {
          if (self.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    // Handle new/update passwords
    if (this.isModified('password')) {
      if (!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
        next(new Error('Invalid password'));
      }

      // Make salt with a callback
      var _this = this;
      this.makeSalt(function(saltErr, salt) {
        if (saltErr) {
          next(saltErr);
        }
        _this.salt = salt;
        _this.encryptPassword(_this.password, function(encryptErr, hashedPassword) {
          if (encryptErr) {
            next(encryptErr);
          }
          _this.password = hashedPassword;
          next();
        });
      });
    } else {
      next();
    }
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate: function(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    var _this = this;
    this.encryptPassword(password, function(err, pwdGen) {
      if (err) {
        callback(err);
      }

      if (_this.password === pwdGen) {
        callback(null, true);
      }
      else {
        callback(null, false);
      }
    });
  },

  /**
   * Make salt
   *
   * @param {Number} byteSize Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt: function(byteSize, callback) {
    var defaultByteSize = 16;

    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    }
    else if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    if (!callback) {
      return crypto.randomBytes(byteSize).toString('base64');
    }

    return crypto.randomBytes(byteSize, function(err, salt) {
      if (err) {
        callback(err);
      }
      return callback(null, salt.toString('base64'));
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword: function(password, callback) {
    if (!password || !this.salt) {
      return null;
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if (!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength)
                   .toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength,'sha512', function(err, key) {
      if (err) {
        callback(err);
      }
      return callback(null, key.toString('base64'));
    });
  }
};

module.exports = mongoose.model('User', UserSchema);

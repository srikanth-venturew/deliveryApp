'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var validator = require('validator');
var _ = require('underscore');  

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json({
      "status": "failure",
      "message": err.message,
      "data": err
    });
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function () {
    res.status(statusCode).end();
  };
}

function sendJSONresponse(res, status, content) {
  res.status(status);
  res.json(content);
};


/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  console.log('req.query :', req.query);
      User.find(req.query, '-salt -password').exec()
      .then(function(users) {
        sendJSONresponse(res, 200, {
          "status": "success",
          "message": "Users found successfully",
          "data": users
        });
      })
      .catch(handleError(res));
  // User.findAsync({}, '-salt -hashedPassword')
  //   .then(function (users) {
  //     res.status(200).json(users);
  //   })
  //   .catch(handleError(res));
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  
  var errors = [];
  if(!validator.isEmail(req.body.email)){
    errors.push("Not a valid email");
  }
  if(validator.isEmpty(req.body.firstName)){
    errors.push("first name is empty");
  }
  if(req.body.role != "user" && req.body.role != "vendor" && req.body.role != "runner" && req.body.role != "admin"){
    errors.push("Please send a valid role type");
  }
  else if(req.body.role == "vendor" && _.isEmpty(req.body.vendor)){
    errors.push("Please provide vendor information for role vendor");
  }
  else if(req.body.role == "runner" && _.isEmpty(req.body.runner)){
    errors.push("Please provide runner information for role runner");
  }
  if(!validator.matches(req.body.password,/^(?=.*[0-9])(?=.*[!@#$%^&*_])[a-zA-Z0-9!@#$%^&*_]{6,}$/)){
    errors.push("password must be atleast 6 characters long and must contain atleast one digit ,  uppercase , lowercase letter and special character");
  }
  if(!validator.isMobilePhone(req.body.phoneNumber,'en-IN')){
    errors.push("Please enter a valid mobile number");
  }
  if (errors.length > 0) {
    sendJSONresponse(res, 422, {
      "status": "failure",
      "message":"Please check the input", 
      "data": {
       "errors":errors
      }
    });
  } else {
    // normal processing here
    var newUser = new User(req.body);
    newUser.provider = 'local';
    if (!newUser.role) {
      newUser.role = 'user';
    }
    if (newUser.role == 'runner') {
      if (!newUser.runner) {
        newUser.runner = {};
        console.log("req.body :", req.body);
        if (req.body.runner && req.body.runner.workType) {
          newUser.runner.workType = req.body.workType;
        }
      }
    }
    newUser.save()
      .then(function (user) {
        var token = jwt.sign({ _id: user._id }, config.secrets.session, {
          expiresIn: 60 * 60 * 5
        });
        sendJSONresponse(res, 200, {
          "status": "success",
          "message": "User successfully created",
          "data": {
            "token": token,
            "_id": user._id
          }
        });
      })
      .catch(validationError(res));
  }
};

// Updates an existing User in the DB
exports.updateUser = function (req, res) {
  if (req.params.id) {
    User.findByIdAsync(req.params.id).then(function(user) {
         if(user) {
          if(user.role == 'runner' && req.body.runner){
            var lat = req.body.runner.lat;
            var long = req.body.runner.long;
            if(lat && long){
              user.runner.coords = [parseFloat(lat), parseFloat(long)]
            }
            user.runner.workType = req.body.runner.workType || user.runner.workType;
            user.runner.appStatus = req.body.runner.appStatus || user.runner.appStatus;
            user.save(function(err){
              sendJSONresponse(res, 200, {
                "status": "success",
                "message": "User updated successfully",
              });
            })
          }
        }
        else{
          sendJSONresponse(res, 200, {
            "status": "failure",
            "message": "User not found"
          });
        }
      })
      .catch(function(err){
        sendJSONresponse(res, 200, {
          "status": "failure",
          "message": "finding user failed",
          "data":err
        });
      });
  }
  else {
    sendJSONresponse(res, 200, {
      "status": "failure",
      "message": "please send id of the user",
    });
  }
}

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findByIdAsync(userId)
    .then(function (user) {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(function (err) {
      return next(err);
    });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  User.findByIdAndRemoveAsync(req.params.id)
    .then(function () {
      res.status(204).end();
    })
    .catch(handleError(res));
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findByIdAsync(userId)
    .then(function (user) {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.saveAsync()
          .then(function () {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId = req.user._id;

  User.findOneAsync({ _id: userId }, '-salt -hashedPassword')
    .then(function (user) { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(function (err) {
      return next(err);
    });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};



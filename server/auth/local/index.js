'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

function sendJSONresponse(res, status, content) {
  res.status(status);
  res.json(content);
};

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }

    var token = auth.signToken(user._id, user.role);
    //res.json({ token: token });
    sendJSONresponse(res, 200, {
      "status": "success",
      "message": "User successfully loggedIn",
      "data": {
        "token": token,
        "_id":user._id
      }
    });

  })(req, res, next)
});

module.exports = router;

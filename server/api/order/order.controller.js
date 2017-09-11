/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/orders              ->  index
 * POST    /api/orders              ->  create
 * GET     /api/orders/:id          ->  show
 * PUT     /api/orders/:id          ->  update
 * DELETE  /api/orders/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var http_status = require('http-status-codes');
var Order = require('./order.model');
var User = require('../user/user.model');
var validator = require('validator');
var _ = require('underscore');
var Promise = require('bluebird');


function handleError(res, statusCode, message) {
  statusCode = statusCode || http_status.INTERNAL_SERVER_ERROR;
  return function (err) {
    res.status(statusCode).json({
      "status": "failure",
      "message": message,
    });
  };
}

function responseWithResult(res, statusCode, message) {
  statusCode = statusCode || http_status.OK;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json({
        "status": "success",
        "message": message,
        "data": entity
      });
    }
  };
}

function handleEntityNotFound(res, message) {
  return function (entity) {
    if (!entity) {
      res.status(http_status.NOT_FOUND).json({
        "status": "failure",
        "message": message,
      });
      return null;
    }
    return entity;
  };
}

function sendJSONresponse(res, status, content) {
  res.status(status);
  res.json(content);
};


function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function (updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function () {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Orders
exports.index = function (req, res) {
  console.log("params :", req.query);
  Order.findAsync(req.query)
    .then(responseWithResult(res, http_status.OK, "successfully obtained orders"))
    .catch(handleError(res, http_status.NOT_FOUND, "error obtaining orders"));
};

// Gets a single Order from the DB
exports.show = function (req, res) {
  if (req.params && req.params.id) {
    Order
      .findById(req.params.id, { status: 1, _id: 0 }, function (err, order) {
        if (!order) {
          sendJSONresponse(res, http_status.NOT_FOUND, {
            "status": "failure",
            "message": "no such order found"
          });
          return;
        } else if (err) {
          console.log(err);
          sendJSONresponse(res, http_status.INTERNAL_SERVER_ERROR, err);
          return;
        }
        sendJSONresponse(res, http_status.OK, {
          "status": "success",
          "message": "successfully obtained status of the order",
          "data": order
        });
      });
  } else {
    console.log('No orderid specified');
    sendJSONresponse(res, http_status.NOT_FOUND, {
      "status": "failure",
      "message": "No orderid in request"
    });
  }
};



function validateCreateOrderData(req) {
  var errors = [];
  return new Promise(function (resolve, reject) {
    if (_.isEmpty(req.body.name)) {
      errors.push("Please enter a name for the task");
    }
    if (_.isEmpty(req.body.deliveryModel)) {
      errors.push("Please enter a name for the deliveryModel");
    }
    if (_.isEmpty(req.body.deliveryItem)) {
      errors.push("Please enter a name for the deliveryType");
    }

    if (_.isEmpty(req.body.pickupAddress) || _.isEmpty(req.body.pickupAddress.name) || _.isEmpty(req.body.pickupAddress.phoneNumber) || _.isEmpty(req.body.pickupAddress.address)
      || _.isEmpty(req.body.pickupAddress.subArea) || _.isEmpty(req.body.pickupAddress.mainArea) || _.isEmpty(req.body.pickupAddress.landmark) || _.isEmpty(req.body.pickupAddress.state) || _.isEmpty(req.body.pickupAddress.city)
      || _.isEmpty(req.body.pickupAddress.country) || _.isEmpty(req.body.pickupAddress.pinCode)) {
      errors.push("Please enter the complete pickupAddress");
    }
    if (_.isEmpty(req.body.deliveryAddress) || _.isEmpty(req.body.deliveryAddress.name) || _.isEmpty(req.body.deliveryAddress.phoneNumber) || _.isEmpty(req.body.deliveryAddress.address)
      || _.isEmpty(req.body.deliveryAddress.subArea) || _.isEmpty(req.body.deliveryAddress.mainArea) || _.isEmpty(req.body.deliveryAddress.landmark) || _.isEmpty(req.body.deliveryAddress.state) || _.isEmpty(req.body.deliveryAddress.city)
      || _.isEmpty(req.body.deliveryAddress.country) || _.isEmpty(req.body.deliveryAddress.pinCode)) {
      errors.push("Please enter the complete deliveryAddress");
    }
    if (_.isEmpty(req.body.requestedTime)) {
      errors.push("Please enter a name for the deliveryType");
    }
    if (_.isEmpty(req.body.description)) {
      errors.push("Please enter a name for the deliveryType");
    }
    if (errors.length == 0) {
      resolve(req.body);
    }
    else {
      reject(errors);
    }
  });
}
// Creates a new Order in the DB
exports.create = function (req, res) {
  validateCreateOrderData(req).then(function (data) {
    console.log("succeded :", data);
    Order.createAsync(data)
      .then(function (order) {
        console.log('order successfully created :', order);
        sendJSONresponse(res, http_status.CREATED, {
          "status": "success",
          "message": "order successfully created",
          "data": {
            "deliveryId": order._id.toString()
          }
        });
        var googleMapsClient = req.app.get('googleMapsClient');
        updateGeoCoordinates(googleMapsClient,order);
      }).catch(function (e) {
        console.log('errors :', e);
        sendJSONresponse(res, http_status.BAD_REQUEST, {
          "status": "failure",
          "message": "Error creating order",
          "data": {
            errors: e.errors
          }
        });
      })
  }).catch(function (e) {
    console.log('errors :', e);
    sendJSONresponse(res, http_status.BAD_REQUEST, {
      "status": "failure",
      "message": "some parameters are missing or case is not correct in request,please check. :",
      "data": {
        errors: e
      }
    });
  });
};

function updateGeoCoordinates(googleMapsClient,order){
  var pickupCoords;
  var deliveryCoords;
  googleMapsClient.geocode({
   address: order.pickupAddress.address+" "+order.pickupAddress.subArea+" "+order.pickupAddress.landmark+" "+order.pickupAddress.mainArea+" "+order.pickupAddress.state+" "+order.pickupAddress.city+" "+order.pickupAddress.country+" "+
   order.pickupAddress.pinCode
  }, function (err, response) {
   if (!err) {
     pickupCoords = response.json.results[0].geometry.location;
     console.log(pickupCoords);
     googleMapsClient.geocode({
       address: order.deliveryAddress.address+" "+order.deliveryAddress.subArea+" "+order.deliveryAddress.landmark+" "+order.deliveryAddress.mainArea+" "+order.deliveryAddress.state+" "+order.deliveryAddress.city+" "+order.deliveryAddress.country+" "+
       order.deliveryAddress.pinCode
     }, function (err, response) {
       if (!err) {
         deliveryCoords = response.json.results[0].geometry.location;
         order.pickupAddress.coords = [parseFloat(pickupCoords.lng), parseFloat(pickupCoords.lat)];
         order.deliveryAddress.coords = [parseFloat(deliveryCoords.lng), parseFloat(deliveryCoords.lat)];
         order.save(function(err){
          if (err) {
            console.log('Error updating order document');
          }
          else {
            console.log("order successfully updated with coordinates :", order);
          }
         })
       }
     });

   }
 });
}

// Updates an existing Order in the DB
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Order.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Order from the DB
exports.destroy = function (req, res) {
  Order.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};


//Assign an order to a runner :
//Method : POST 
//Accepts orderId , runnerId(userid) as parameters.
exports.assignOrder = function (req, res) {
  console.log("orderid :", req.body.orderid);
  console.log("userid :", req.body.userid);
  if (req.body.orderid && req.body.userid) {
    Order.findById(req.body.orderid, function (err, order) {
      if (err) {
        console.log('error :', err);
      }
      if (!order) {
        sendJSONresponse(res, http_status.FORBIDDEN, {
          "status": "failure",
          "message": "no order found with this id"
        });
      }
      else if (order) {
        //console.log('order :',order);
        //check if the order is not assigned first 
        if (order.status == 'unassigned') {
          User.findById(req.body.userid, function (err, user) {
            //check if the user is a "runner" , he is "free" and he set status to "on" in mobile
            //console.log('user :',user);
            if (!user) {
              sendJSONresponse(res, http_status.FORBIDDEN, {
                "status": "failure",
                "message": "no user found with this id"
              });
            }
            else if (!user.runner || user.runner.status == 'atWork' || user.runner.appStatus == 'off') {
              sendJSONresponse(res, http_status.FORBIDDEN, {
                "status": "failure",
                "message": "cannot assign to this runner , he is not available"
              });
            }
            else {
              user.runner.status = 'atWork';
              user.runner.deliveryId = order._id;
              order.status = 'assigned';
              order.runnerId = user._id;
              user.save(function (err) {
                if (err) {
                  console.log('error saving user while adding task to him');
                }
              });
              order.save(function (err) {
                if (err) {
                  console.log('error saving order while adding task to runner');
                }
              });
              //Run any background tasks here:-
              sendJSONresponse(res, http_status.OK, {
                "status": "success",
                "message": "task successfully assigned to runner"
              });
            }
          });
        }
        else {
          sendJSONresponse(res, http_status.FORBIDDEN, {
            "status": "failure",
            "message": "task is already assigned to a runner"
          });
        }
      }
    })
  }
  else {
    sendJSONresponse(res, http_status.NOT_FOUND, {
      "status": "failure",
      "message": "please send orderid and userid to assign an order"
    });
  }
}
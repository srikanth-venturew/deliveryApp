/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/deliveryModels              ->  index
 * POST    /api/deliveryModels              ->  create
 * GET     /api/deliveryModels/:id          ->  show
 * PUT     /api/deliveryModels/:id          ->  update
 * DELETE  /api/deliveryModels/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var DeliveryModel = require('./deliveryModel.model');
var http_status = require('http-status-codes');


function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

function sendJSONresponse(res, status, content) {
  res.status(status);
  res.json(content);
};

// Gets a list of DeliveryModels
exports.index = function(req, res) {
  DeliveryModel.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Gets a single DeliveryModel from the DB
exports.show = function(req, res) {
  DeliveryModel.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Creates a new DeliveryModel in the DB
exports.create = function(req, res) {
  if(req.body.name){
    if(DeliveryModel.findOne({name:req.body.name},function(err,deliveryModel){
      if(err){
        sendJSONresponse(res,http_status.INTERNAL_SERVER_ERROR,{
          "status":"failure",
          "message":"server error"
        });    
      }
      else if(!deliveryModel){
        DeliveryModel.createAsync(req.body)
        .then(responseWithResult(res, 201))
        .catch(handleError(res));
      }
      else{
        sendJSONresponse(res,http_status.NOT_FOUND,{
          "status":"failure",
          "message":"The name with same delivery model already exists"
        });    
      }
    }));
    
  }
  else{
    sendJSONresponse(res,http_status.NOT_FOUND,{
      "status":"failure",
      "message":"Please send the name of the delivery model"
    });
  }
};

// Updates an existing DeliveryModel in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  DeliveryModel.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a DeliveryModel from the DB
exports.destroy = function(req, res) {
  DeliveryModel.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};

'use strict';

var app = require('..\..\app');
var request = require('supertest');

var newDeliveryModel;

describe('DeliveryModel API:', function() {

  describe('GET /api/deliveryModels', function() {
    var deliveryModels;

    beforeEach(function(done) {
      request(app)
        .get('/api/deliveryModels')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          deliveryModels = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      deliveryModels.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/deliveryModels', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/deliveryModels')
        .send({
          name: 'New DeliveryModel',
          info: 'This is the brand new deliveryModel!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newDeliveryModel = res.body;
          done();
        });
    });

    it('should respond with the newly created deliveryModel', function() {
      newDeliveryModel.name.should.equal('New DeliveryModel');
      newDeliveryModel.info.should.equal('This is the brand new deliveryModel!!!');
    });

  });

  describe('GET /api/deliveryModels/:id', function() {
    var deliveryModel;

    beforeEach(function(done) {
      request(app)
        .get('/api/deliveryModels/' + newDeliveryModel._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          deliveryModel = res.body;
          done();
        });
    });

    afterEach(function() {
      deliveryModel = {};
    });

    it('should respond with the requested deliveryModel', function() {
      deliveryModel.name.should.equal('New DeliveryModel');
      deliveryModel.info.should.equal('This is the brand new deliveryModel!!!');
    });

  });

  describe('PUT /api/deliveryModels/:id', function() {
    var updatedDeliveryModel

    beforeEach(function(done) {
      request(app)
        .put('/api/deliveryModels/' + newDeliveryModel._id)
        .send({
          name: 'Updated DeliveryModel',
          info: 'This is the updated deliveryModel!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedDeliveryModel = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedDeliveryModel = {};
    });

    it('should respond with the updated deliveryModel', function() {
      updatedDeliveryModel.name.should.equal('Updated DeliveryModel');
      updatedDeliveryModel.info.should.equal('This is the updated deliveryModel!!!');
    });

  });

  describe('DELETE /api/deliveryModels/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/deliveryModels/' + newDeliveryModel._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when deliveryModel does not exist', function(done) {
      request(app)
        .delete('/api/deliveryModels/' + newDeliveryModel._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});

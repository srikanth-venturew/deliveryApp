'use strict';

var app = require('..\..\app');
var request = require('supertest');

var newPricingPlan;

describe('PricingPlan API:', function() {

  describe('GET /api/pricingPlans', function() {
    var pricingPlans;

    beforeEach(function(done) {
      request(app)
        .get('/api/pricingPlans')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          pricingPlans = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      pricingPlans.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/pricingPlans', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/pricingPlans')
        .send({
          name: 'New PricingPlan',
          info: 'This is the brand new pricingPlan!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newPricingPlan = res.body;
          done();
        });
    });

    it('should respond with the newly created pricingPlan', function() {
      newPricingPlan.name.should.equal('New PricingPlan');
      newPricingPlan.info.should.equal('This is the brand new pricingPlan!!!');
    });

  });

  describe('GET /api/pricingPlans/:id', function() {
    var pricingPlan;

    beforeEach(function(done) {
      request(app)
        .get('/api/pricingPlans/' + newPricingPlan._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          pricingPlan = res.body;
          done();
        });
    });

    afterEach(function() {
      pricingPlan = {};
    });

    it('should respond with the requested pricingPlan', function() {
      pricingPlan.name.should.equal('New PricingPlan');
      pricingPlan.info.should.equal('This is the brand new pricingPlan!!!');
    });

  });

  describe('PUT /api/pricingPlans/:id', function() {
    var updatedPricingPlan

    beforeEach(function(done) {
      request(app)
        .put('/api/pricingPlans/' + newPricingPlan._id)
        .send({
          name: 'Updated PricingPlan',
          info: 'This is the updated pricingPlan!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedPricingPlan = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPricingPlan = {};
    });

    it('should respond with the updated pricingPlan', function() {
      updatedPricingPlan.name.should.equal('Updated PricingPlan');
      updatedPricingPlan.info.should.equal('This is the updated pricingPlan!!!');
    });

  });

  describe('DELETE /api/pricingPlans/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/pricingPlans/' + newPricingPlan._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when pricingPlan does not exist', function(done) {
      request(app)
        .delete('/api/pricingPlans/' + newPricingPlan._id)
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

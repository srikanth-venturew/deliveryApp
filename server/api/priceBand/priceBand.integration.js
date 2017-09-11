'use strict';

var app = require('..\..\app');
var request = require('supertest');

var newPriceBand;

describe('PriceBand API:', function() {

  describe('GET /api/priceBands', function() {
    var priceBands;

    beforeEach(function(done) {
      request(app)
        .get('/api/priceBands')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          priceBands = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      priceBands.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/priceBands', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/priceBands')
        .send({
          name: 'New PriceBand',
          info: 'This is the brand new priceBand!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newPriceBand = res.body;
          done();
        });
    });

    it('should respond with the newly created priceBand', function() {
      newPriceBand.name.should.equal('New PriceBand');
      newPriceBand.info.should.equal('This is the brand new priceBand!!!');
    });

  });

  describe('GET /api/priceBands/:id', function() {
    var priceBand;

    beforeEach(function(done) {
      request(app)
        .get('/api/priceBands/' + newPriceBand._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          priceBand = res.body;
          done();
        });
    });

    afterEach(function() {
      priceBand = {};
    });

    it('should respond with the requested priceBand', function() {
      priceBand.name.should.equal('New PriceBand');
      priceBand.info.should.equal('This is the brand new priceBand!!!');
    });

  });

  describe('PUT /api/priceBands/:id', function() {
    var updatedPriceBand

    beforeEach(function(done) {
      request(app)
        .put('/api/priceBands/' + newPriceBand._id)
        .send({
          name: 'Updated PriceBand',
          info: 'This is the updated priceBand!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedPriceBand = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPriceBand = {};
    });

    it('should respond with the updated priceBand', function() {
      updatedPriceBand.name.should.equal('Updated PriceBand');
      updatedPriceBand.info.should.equal('This is the updated priceBand!!!');
    });

  });

  describe('DELETE /api/priceBands/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/priceBands/' + newPriceBand._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when priceBand does not exist', function(done) {
      request(app)
        .delete('/api/priceBands/' + newPriceBand._id)
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

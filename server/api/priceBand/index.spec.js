'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var priceBandCtrlStub = {
  index: 'priceBandCtrl.index',
  show: 'priceBandCtrl.show',
  create: 'priceBandCtrl.create',
  update: 'priceBandCtrl.update',
  destroy: 'priceBandCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var priceBandIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './priceBand.controller': priceBandCtrlStub
});

describe('PriceBand API Router:', function() {

  it('should return an express router instance', function() {
    priceBandIndex.should.equal(routerStub);
  });

  describe('GET /api/priceBands', function() {

    it('should route to priceBand.controller.index', function() {
      routerStub.get
                .withArgs('/', 'priceBandCtrl.index')
                .should.have.been.calledOnce;
    });

  });

  describe('GET /api/priceBands/:id', function() {

    it('should route to priceBand.controller.show', function() {
      routerStub.get
                .withArgs('/:id', 'priceBandCtrl.show')
                .should.have.been.calledOnce;
    });

  });

  describe('POST /api/priceBands', function() {

    it('should route to priceBand.controller.create', function() {
      routerStub.post
                .withArgs('/', 'priceBandCtrl.create')
                .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/priceBands/:id', function() {

    it('should route to priceBand.controller.update', function() {
      routerStub.put
                .withArgs('/:id', 'priceBandCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/priceBands/:id', function() {

    it('should route to priceBand.controller.update', function() {
      routerStub.patch
                .withArgs('/:id', 'priceBandCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/priceBands/:id', function() {

    it('should route to priceBand.controller.destroy', function() {
      routerStub.delete
                .withArgs('/:id', 'priceBandCtrl.destroy')
                .should.have.been.calledOnce;
    });

  });

});

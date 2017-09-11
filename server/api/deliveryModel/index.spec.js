'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var deliveryModelCtrlStub = {
  index: 'deliveryModelCtrl.index',
  show: 'deliveryModelCtrl.show',
  create: 'deliveryModelCtrl.create',
  update: 'deliveryModelCtrl.update',
  destroy: 'deliveryModelCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var deliveryModelIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './deliveryModel.controller': deliveryModelCtrlStub
});

describe('DeliveryModel API Router:', function() {

  it('should return an express router instance', function() {
    deliveryModelIndex.should.equal(routerStub);
  });

  describe('GET /api/deliveryModels', function() {

    it('should route to deliveryModel.controller.index', function() {
      routerStub.get
                .withArgs('/', 'deliveryModelCtrl.index')
                .should.have.been.calledOnce;
    });

  });

  describe('GET /api/deliveryModels/:id', function() {

    it('should route to deliveryModel.controller.show', function() {
      routerStub.get
                .withArgs('/:id', 'deliveryModelCtrl.show')
                .should.have.been.calledOnce;
    });

  });

  describe('POST /api/deliveryModels', function() {

    it('should route to deliveryModel.controller.create', function() {
      routerStub.post
                .withArgs('/', 'deliveryModelCtrl.create')
                .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/deliveryModels/:id', function() {

    it('should route to deliveryModel.controller.update', function() {
      routerStub.put
                .withArgs('/:id', 'deliveryModelCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/deliveryModels/:id', function() {

    it('should route to deliveryModel.controller.update', function() {
      routerStub.patch
                .withArgs('/:id', 'deliveryModelCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/deliveryModels/:id', function() {

    it('should route to deliveryModel.controller.destroy', function() {
      routerStub.delete
                .withArgs('/:id', 'deliveryModelCtrl.destroy')
                .should.have.been.calledOnce;
    });

  });

});

'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var pricingPlanCtrlStub = {
  index: 'pricingPlanCtrl.index',
  show: 'pricingPlanCtrl.show',
  create: 'pricingPlanCtrl.create',
  update: 'pricingPlanCtrl.update',
  destroy: 'pricingPlanCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var pricingPlanIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './pricingPlan.controller': pricingPlanCtrlStub
});

describe('PricingPlan API Router:', function() {

  it('should return an express router instance', function() {
    pricingPlanIndex.should.equal(routerStub);
  });

  describe('GET /api/pricingPlans', function() {

    it('should route to pricingPlan.controller.index', function() {
      routerStub.get
                .withArgs('/', 'pricingPlanCtrl.index')
                .should.have.been.calledOnce;
    });

  });

  describe('GET /api/pricingPlans/:id', function() {

    it('should route to pricingPlan.controller.show', function() {
      routerStub.get
                .withArgs('/:id', 'pricingPlanCtrl.show')
                .should.have.been.calledOnce;
    });

  });

  describe('POST /api/pricingPlans', function() {

    it('should route to pricingPlan.controller.create', function() {
      routerStub.post
                .withArgs('/', 'pricingPlanCtrl.create')
                .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/pricingPlans/:id', function() {

    it('should route to pricingPlan.controller.update', function() {
      routerStub.put
                .withArgs('/:id', 'pricingPlanCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/pricingPlans/:id', function() {

    it('should route to pricingPlan.controller.update', function() {
      routerStub.patch
                .withArgs('/:id', 'pricingPlanCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/pricingPlans/:id', function() {

    it('should route to pricingPlan.controller.destroy', function() {
      routerStub.delete
                .withArgs('/:id', 'pricingPlanCtrl.destroy')
                .should.have.been.calledOnce;
    });

  });

});

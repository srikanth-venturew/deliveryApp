'use strict';

var express = require('express');
var controller = require('./order.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/', controller.index); //show orders
router.get('/:id', controller.show);
router.post('/',auth.isAuthenticated(),controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.post('/assignOrder', controller.assignOrder);


module.exports = router;

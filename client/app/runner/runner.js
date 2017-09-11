'use strict';

angular.module('angularFullstackApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('runner', {
        url: '/runner',
        templateUrl: 'app/runner/runner.html',
        controller: 'RunnerCtrl'
      });
  });

'use strict';

angular.module('angularFullstackApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.orders = {
      unassigned: [],
      assigned: [],
      completed: []
    };


    $scope.runners = {
      free: [],
      busy: [],
      inactive: []
    };


    $http.get('/api/orders').success(function (orders) {
      orders.data.forEach(function (order) {
        if (order.status == 'unassigned') {
          $scope.orders.unassigned.push(order);
        }
        else if (order.status == 'assigned') {
          $scope.orders.assigned.push(order);
        }
        if (order.status == 'completed') {
          $scope.orders.completed.push(order);
        }
      }, this);
      //socket.syncUpdates('order', $scope.orders);
    }).then(function (data) {
      //$scope.unassignedHeading = $scope.unassigned.length + "UNASSIGNED";
    });


    //Get runners
    $http.get('/api/users?role=runner').success(function (users) {
      users.data.forEach(function (user) {
        if (user.runner.appStatus == 'off') {
          $scope.runners.inactive.push(user);
        }
        else if (user.runner.status == 'free') {
          $scope.runners.free.push(user);
        }
        else if (user.runner.status == 'atWork') {
          $scope.runners.busy.push(user);
        }
        
      }, this);
      //socket.syncUpdates('order', $scope.orders);
    }).then(function (data) {
      //$scope.unassignedHeading = $scope.unassigned.length + "UNASSIGNED"; 
    });

    $scope.addThing = function () {
      if ($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.assignOrder = function (order) {
      //$http.delete('/api/things/' + thing._id);
      console.log("Assign this order :", order);
    };



    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });


  });

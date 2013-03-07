'use strict';

var blocktoolApp = angular.module('blocktoolApp', ['angular-underscore', 'ui'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);


blocktoolApp.run(['Utils', 'Console', 'NinjaService', 'BlockService'
  , function(Utils, console, NinjaService, BlockService) {

    BlockService.LoadBlocks();

  }]);
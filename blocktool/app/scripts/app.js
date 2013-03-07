'use strict';

var devicetoolApp = angular.module('devicetoolApp', ['angular-underscore', 'ui'])
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


devicetoolApp.run(['Utils', 'Console', 'NinjaService', 'BlockService'
  , function(Utils, console, NinjaService, BlockService) {

    BlockService.LoadBlocks();

  }]);
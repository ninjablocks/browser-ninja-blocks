'use strict';

var blocktoolApp = angular.module('blocktoolApp', ['angular-underscore', 'ui', 'ngResource'])
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


blocktoolApp.run(['$rootScope', 'Utils', 'UIEvents', 'Console', 'NinjaService', 'BlockService'
  , function($rootScope, Utils, UIEvents, console, NinjaService, BlockService) {

    // Initiate Blocks to load
    $rootScope.$broadcast(UIEvents.LoadBlocks);

  }]);
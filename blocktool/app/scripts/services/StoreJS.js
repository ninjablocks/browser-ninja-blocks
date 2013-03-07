'use strict';

blocktoolApp.factory('StoreJS',
  ['$window', function($window) {

  var store = $window.store;

  // Return the original store js
  return store;
}]);

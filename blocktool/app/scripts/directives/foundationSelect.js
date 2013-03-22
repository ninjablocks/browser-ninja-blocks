'use strict';

blocktoolApp.directive('foundationSelect',
  ['$rootScope', 'UIEvents', '$timeout'
  , function($rootScope, UIEvents, $timeout) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {

      $rootScope.$on(UIEvents.VendorDeviceUIUpdate, function(event) {
        $timeout(function() {
          $(element).change();
        }, 0);
      });

    }
  };
}]);

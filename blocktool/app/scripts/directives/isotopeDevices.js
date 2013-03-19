'use strict';

blocktoolApp.directive('isotopeDevices', 
  ['$rootScope', '$timeout', 'UIEvents', '$window',
  function($rootScope, $timeout, UIEvents, $window) {

  var isotopeElement;
  var isotopeLoaded = false;
  var deviceWidth = $(".devices .device").outerWidth();

  var isotopeOptions = {
    itemSelector: '.device',
    layoutMode: 'masonry',
    animationEngine: 'css',
    animationOptions: {
      duration: 400,
      easing: 'swing',
      queue: false
    },
    masonry: {
      columnWidth: deviceWidth
    }
  };

  console.log("isotopeOptions", isotopeOptions);

  // Listen for REMOVED devices
    $rootScope.$on(UIEvents.IsotopeDeviceRemove, function(eventObj, deviceElement) {
    isotopeElement.isotope('remove', deviceElement);
  });

  // Listen for ADDED devices
  $rootScope.$on(UIEvents.IsotopeDeviceAdd, function(eventObj, deviceElement) {
    if (isotopeLoaded) {
      isotopeElement.isotope('reloadItems').isotope({ sortBy: 'original-order' });
    }
  });

  $rootScope.$on(UIEvents.IsotopeReLayout, function(eventObj) {
    if (isotopeLoaded) {
      var deviceWidth = $(".devices .device").outerWidth();
      isotopeOptions.masonry.columnWidth = deviceWidth;
      // isotopeElement.isotope('option', isotopeOptions);
      isotopeElement.isotope('destroy');
      isotopeElement.isotope(isotopeOptions);
      isotopeElement.isotope('reloadItems');
      console.log("[Isotope]: DeviceWidth", deviceWidth);

    }
  });

  // Listen for FILTERS
  $rootScope.$on(UIEvents.IsotopeFilter, function(eventObj, filter) {
    // console.log("Isotope Filtering: ", filter);
    isotopeElement.isotope({ filter: filter});
  });

  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {

      scope.$watch(function() { return scope.Devices; }, function(devices) {

        if (devices) {
          isotopeElement = element.isotope(isotopeOptions);
          isotopeLoaded = true;

        }
      });

      var resizeTimeout = new Date(); 

      $(window).resize(function() {
        if (!scope.$$phase) {
          scope.$apply(function() {
            var newTimeout = new Date();
            if (!((newTimeout - resizeTimeout) < 1000)) {
              $rootScope.$broadcast(UIEvents.IsotopeReLayout);
            } else {
              resizeTimeout = newTimeout;
            }
          });

        }
      });
    }
  };
}]);



blocktoolApp.directive('isotopeRemovable'
  , ['$rootScope', 'UIEvents'
  , function($rootScope, UIEvents) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {

      jQuery(element).on('click', '.remove', (function() {
        // console.log("Isotope Removable");
        scope.$emit(UIEvents.IsotopeDeviceRemove, element);
      }).bind(this));

    }
  };
}]);


blocktoolApp.directive('isotopeDevice'
  , ['UIEvents', 
  function(UIEvents) {
    return function(scope, element, attrs) {
      scope.$watch(attrs.isotopeDevice, function(value) {
        // console.log("device added");

        scope.$emit(UIEvents.IsotopeDeviceAdd, element);
      });
    };
}]);
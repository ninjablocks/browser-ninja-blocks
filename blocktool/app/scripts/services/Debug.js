'use strict';

blocktoolApp.factory('Console'
  , ['$window'
  , function(window) {

  var debug = {

    /**
     * Debug flag
     * @type {Boolean}
     */
    DEBUG: true,

    /**
     * Logs the called arguments to the console
     */
    log: function() {

      if (this.DEBUG) { window.console.log( Array.prototype.slice.call(arguments) ); }
    }
  };

  return window.console;

}]);
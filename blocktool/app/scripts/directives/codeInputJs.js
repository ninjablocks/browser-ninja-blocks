'use strict';

blocktoolApp.directive('codeInputJs',
  ['$rootScope', 'UIEvents'
  , function($rootScope, UIEvents) {

  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      console.log("[CodeMirror]: Creating...");
      element.addClass("codeInput");

      var defaultText = element.text().trim();
      element.empty();
      /**
       * Setup Code Mirror
       */
      var options = {
        value: defaultText,
        mode: "javascript",
        theme: "solarized light",
        tabSize: 2,
        lineNumbers: false,
        readOnly: attrs.hasOwnProperty("readonly")
      };

      var codeMirror = CodeMirror(element[0], options);

      var textArea = codeMirror.getInputField();

      codeMirror.on("change", function(instance, changeObj) {
        var code = instance.getValue(" ");
        scope.OnActuateCode = code;
      });

    }
  };
}]);

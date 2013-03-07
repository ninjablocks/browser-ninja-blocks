'use strict';

blocktoolApp.directive('codeInputJs',
  ['$rootScope', 'UIEvents'
  , function($rootScope, UIEvents) {

  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      console.log("[CodeMirror]: Creating...");
      element.addClass("codeInput");

      if (attrs.hasOwnProperty("indented")) {
        element.addClass("indented");
      }


      var defaultText = element.text().trim();
      element.empty();

      if (scope.Device && scope.Device.Options.onActuateCode && !attrs.hasOwnProperty("override")) {
        defaultText = scope.Device.Options.onActuateCode;
      }
      defaultText = defaultText.replace(/[ \t]{2,}/mg, '');

      /**
       * Setup Code Mirror
       */
      var options = {
        value: defaultText,
        mode: "javascript",
        theme: "solarized light",
        tabSize: 2,
        lineNumbers: false,
        lineWrapping: attrs.hasOwnProperty("wrap"),
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

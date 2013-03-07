'use strict';

blocktoolApp.directive('selectOnClick',
  [ '$window'
  , function(window) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      
      element.on("click", function(event) {
        var event = event || window.event,
            elem = event.target || event.srcElement,
            tag = (elem.tagName || "").toLowerCase(),
            sel, range;
        
        if (tag === "textarea" || tag === "input") {
          try {
            elem.select();
          } catch(e) {
            // May be disabled or not selectable
          }
        } else if (window.getSelection) { // Not IE
          sel = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(elem);
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (document.selection) { // IE
          document.selection.empty();
          range = document.body.createTextRange();
          range.moveToElementText(elem);
          range.select();
        }
      });
      
    }
  };
}]);

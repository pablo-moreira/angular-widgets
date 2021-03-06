(function(window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetColumn', ColumnWidget)
		.directive('wgColumn', ColumnDirective);

	function ColumnDirective() {
        return {
        	priority: 1000,
        	restrict: 'E',
        	compile: function compile(element, attrs, transclude) {
        		
        		var options = {        			
	        		field 		: attrs.value,
	        		sortBy		: attrs.sortby || attrs.value,
	        		sortable 	: attrs.sortable || attrs.sortby !== undefined ? true : false,
	        		headerText	: attrs.headertext || attrs.value,
	        		element		: element,
	        		contents	: element[0].innerHTML.trim()
	        	};
    				
        		element.html('');
        		
        		return {
        			pre: function (scope, element, attrs) {
        				element.data("options", options);		
        			},
        			post: function (scope, element, attrs) {}
                };
        	}
        };
    }

    function ColumnWidget() {
    	
		var widgetColumn = {};

		widgetColumn.determineColumnsOptions = function(container) {

			var puiColumns = angular.element(container).findAllSelector('wg-column'),
				columns = [];

			angular.forEach(puiColumns, function(puiColumn) {
				this.push(angular.element(puiColumn).data('options'));
			}, columns);

			puiColumns.remove();

			return columns;
		};

		return widgetColumn;
	}
    
}(window, document));
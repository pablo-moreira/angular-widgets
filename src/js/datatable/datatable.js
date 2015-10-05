
/*globals angular event AngularWidgets */

(function(window, document, undefined) {
    "use strict";
    
    angular.module('pje.ui').factory('widgetDatatable', ['$compile', '$http', 'widgetBase', 'widgetColumn', 'datatablePaginator', 'widgetFacet', 
                      function ($compile, $http, widgetBase, widgetColumn, datatablePaginator, widgetFacet) {

        var widgetDatatable = {};
        
        widgetDatatable.template = '<div class="pui-datatable ui-widget"><div class="pui-datatable-tablewrapper"><div ng-transclude></div><table><thead></thead><tbody class="pui-datatable-data"></tbody></table></div></div>';
        
        widgetDatatable.buildWidget = function(scope, element, attrs) {
        	return new widgetDatatable.DataTable(scope, element, attrs);        	
        };
        
        widgetDatatable.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	
        	return new widgetDatatable.DataTable(scope, element, options);
        };   
                       
        function DataTable(scope, element, options) {
        			
        	this.columns = [];
			this.options = {};
			this.element;
			this.selection = [];
			this.firstLoad = true;
			this.sorts = [];
        	
			this.constructor = function (scope, element, options) {
				
				this.element = element;
				this.scope = scope;
				
				this.determineOptions(options);
				
				this.setValue(this.options.itemsBind ? this.scope.$eval(this.options.items) : this.options.items);		            
				this.paginatorData = this.options.paginator ? datatablePaginator.buildWidget(scope, element, options, this.options) : null;
			
				this.determineTransclude();					

				if (this.options.columns) {
					this.columns = this.options.columns;
				}
				
	            if (!this.columns.length) {	            	
	            	this.determineColumnInfo();
	            }
				
	            this.buildFacets();
				this.buildCaption();
				this.buildColumnHeaders();
								
				if (this.isSortingEnabled()) {
					this.initSorting();
	            }
				
				this.value.load(this.getParams());
				
				widgetBase.createBindAndAssignIfNecessary(this, "getCurrentPage,goToPage");
        	};
        	
        	this.addSelection = function (item) {

	            if (!this.isSelected(item)) {	             
	        		if (this.options.itemId) {
	        			this.selection.push(this.getItemId(item));
	        		}
	        		else {
	        			this.selection.push(item);
	        		}        		
	            }
	        };
	        
	        this.buildBody = function () {

	        	var tbody = this.element.findAllSelector("tbody");
	        	
	        	this.tbody = tbody;
	        	
	        	tbody.data("dataTable", this);
	        	
	        	tbody.html('<tr class="ui-widget-content" ng-repeat="' + this.options.item + ' in getData()" pui-row-build />');

				var	row = tbody.findAllSelector('tr');
	            
	            tbody.append(row);
	            	        		
	    		for(var i = 0, t = this.columns.length; i < t; i++) {
	        		
	        		var column = this.columns[i],
	            		columnInTable = angular.element('<table><tbody><tr><td/></tr></tbody></table>'),
	            		td = columnInTable.findAllSelector('td');

	            	if (column.contents) {
	            		td.append(column.contents);
	            	}
	            	else {
	            		td.append(angular.element('<span ng-bind="' + this.options.item + '.' + column.field + '"></span>'));
	            	}
	            	
	            	row.append(td);
	        	}
								
	            $compile(this.element.contents())(this.scope);
	        };
	        
	        this.buildCaption = function () {
	            if(this.options.caption) {
	                var caption = angular.element('<table><caption class="pui-datatable-caption ui-widget-header">' + this.options.caption + '</caption></table>');
	                this.element.findAllSelector('table').append(caption.childrenSelector('caption'));
	            }
	        };
	        
	        this.buildFacets = function () {
	        
	        	if (this.facets) {
	        		if (this.facets.header) {
	        			var header = angular.element('<div class="pui-datatable-header ui-widget-header ui-corner-top"></div>');
	        			header.append(this.facets.header);
	        			this.element.prepend(header);
	        		}
	        		if (this.facets.footer) {
	        			var footer = angular.element('<div class="pui-datatable-footer ui-widget-header ui-corner-bottom"></div>');
	        			footer.append(this.facets.footer);
	        			this.element.append(footer);
	        		}
	        	}
	        }
	        
	        this.determineColumnInfo = function () {
	            if (!this.isHttpDataLoader()) {
	            	for (var property in this.value.allData[0]) {
	            		this.columns.push({ 
	            			element: null,
	            			field: property, 
	            			headerText: property, 
	            			sortable: false, 
	            			sortBy: property
	            		});
	                }
	            }
	        };
	        
	        this.buildColumnHeaders = function () {

				this.thead = this.element.findAllSelector('thead');
	        	
				if (this.columns) {
					
					var $this = this;
					
	                angular.forEach(this.columns, function (column) {
	                    
	                	// Elements are created as child of div tag. And if not valid html, it is not created.
	                    var headerInTable = angular.element('<table><thead><th class="ui-state-default"/></thead></table>'),
	                        header = headerInTable.findAllSelector('th');
	                    
	                    header.data('sortBy', column.sortBy);
	                    
	                    $this.thead.append(header);

	                    if (column.headerText) {
	                        header.text(column.headerText);
	                    }

	                    if (column.sortable) {
	                        header.addClass('pui-sortable-column').append('<span class="pui-sortable-column-icon ui-icon ui-icon-carat-2-n-s"></span>');
	                        header.data('order', 1);
	                    }
	                });
	            }
	        };
					            				
			this.buildRow = function (scope, element, attrs) {
				
				var item = scope[this.options.item];
				
				// Share item with autocomplete call onBuildRow
				element.data('item', item);
				
				if(this.options.selectionMode) {					
					this.initSelection(element);
				}
				
                if (this.options.selectionMode && this.isSelected(item)) {
                	element.addClass("ui-state-highlight");
                }
				
				scope.$watch('$even', function (newValue, oldValue) {
					if (newValue) {
						element.addClass('pui-datatable-even').removeClass('pui-datatable-odd');
					}
					else {
						element.addClass('pui-datatable-odd').removeClass('pui-datatable-even');
					}
				});
				
				if (this.options.onBuildRow) {
					this.options.onBuildRow(this, scope, element, attrs);
				}
			};
			
			this.getItemId = function (item) {
				return item[this.options.itemId];
			}

			this.changeScope = function () {
				
				var $this = this;
				
				this.scope.getData = function () { 
					return $this.value.getData(); 
				};
			
				if (this.options.itemsBind) {
					this.scope.$watch(this.options.items, function(newValue, oldValue) {
						if (newValue !== oldValue) {
							$this.setValue(newValue);
							$this.value.load($this.getParams());
						}
					});
				}
			};
			
	        this.determineOptions = function (options) {
	        		        					
	        	this.options = {
					item: 'item',
					itemId: null,
					items: [],
					itemsBind: angular.isString(options.items),
					value: [],
					caption: null,
					selectionMode: null,
					onRowSelect: null,
					onRowUnselect: null,
					rows: 10,
					paginator: false,
					onBuildRow: null
		        };

		        widgetBase.determineOptions(this.scope, this.options, options, ['onRowSelect','onRowUnselect']);
			};
			
	        this.getFirst = function() {
	            return this.options.paginator ? this.paginatorData.getFirst() : 0;
	        };

	        this.getPageSize = function () {
	        	return this.options.paginator ? this.paginatorData.getRows() : this.value.getRowCount();
	        }		
	        
	        this.getParams = function () {
						        	
	        	var params = {
					first: this.getFirst(),
					sorts: this.sorts,
					filter: null
				};

				if (this.options.paginator) {
					params.pageSize = this.paginatorData.getRows();
				}
				
				return params;		        	
	        }
	        								
	        this.initPaginator = function () {
	        	
				this.element.after(this.paginatorData.paginatorContainer);
	        	
	        	var $this = this;
	        	
	        	datatablePaginator.initialize(this.paginatorData, this.value.getRowCount(), function() {
					$this.value.load($this.getParams());
				});		
	        }
	        
			this.initSelection = function(row) {
	            
				row.hover(function () {
	                if (!row.hasClass('ui-state-highlight')) {
	                    row.addClass('ui-state-hover');
	                }
	            }, function () {
	                if (!row.hasClass('ui-state-highlight')) {
	                    row.removeClass('ui-state-hover');
	                }
	            });
	            
	            var $this = this;

	            row.bind('click', function(e) {
	                if (e.target.nodeName === 'TD') {
	                    var selected = row.hasClass('ui-state-highlight'),
	                        metaKey = event.metaKey||event.ctrlKey,
	                        shiftKey = event.shiftKey;

	                    //unselect a selected row if metakey is on
	                    if(selected && metaKey) {
	                        $this.unselectRow(row, false);
	                    }
	                    else {
	                        //unselect previous selection if this is single selection or multiple one with no keys
	                        if($this.isSingleSelection() || ($this.isMultipleSelection() && !metaKey && !shiftKey)) {
	                            $this.unselectAllRows();
	                        }

	                        $this.selectRow(row, false);
	                    }
	                }
	            });
	        };
			
	        this.initSorting = function() {
	            
				var sortableColumns = this.thead.childrenSelector('.pui-sortable-column');

	            widgetBase.hoverAndFocus(sortableColumns);

	            sortableColumns.hover(function () {
	                var column = angular.element(this);
	                if (!column.hasClass('ui-state-active')) {
	                    column.addClass('ui-state-hover');
	                }
	            }, function () {
	                var column = angular.element(this);
	                if (!column.hasClass('ui-state-active')) {
	                    column.removeClass('ui-state-hover');
	                }
	            });
	            
	            var $this = this;

	            sortableColumns.click(function(e) {
	                var column =  angular.element(e.target.nodeName === 'TH' ? e.target : e.target.parentNode ),
	                    sortBy = column.data('sortBy'),
	                    order = column.data('order'),
	                    siblings = column.siblings(),
	                    activeColumns = AngularWidgets.filter(siblings,function (item) {
	                        return angular.element(item).hasClass('ui-state-active');
	                    }),
	                    sortIcon = column.childrenSelector('.pui-sortable-column-icon');

	                if (activeColumns.length > 0) {
	                    angular.forEach(activeColumns, function(activeColumn) {
	                    	angular.element(activeColumn)
	                    	 	.data('order', 1)
	                    	 	.removeClass('ui-state-active')
	                    	 	.children('span.pui-sortable-column-icon')
		                        .removeClass('ui-icon-triangle-1-n ui-icon-triangle-1-s');
	                    });
	                }

	                $this.sort(sortBy, order == 1 ? 'asc' : 'desc');

	                //update state
	                column.data('order', -1 * order);

	                column.removeClass('ui-state-hover').addClass('ui-state-active');
	                sortIcon.removeClass('ui-icon-carat-2-n-s');
	                if (order === -1) {
	                    sortIcon.removeClass('ui-icon-triangle-1-n').addClass('ui-icon-triangle-1-s');
	                }
	                else if (order === 1) {
	                    sortIcon.removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-n');
	                }
	            });
	        };
	        
			this.isHttpDataLoader = function() {
				return this.value instanceof window.AngularWidgets.HttpDataLoader;
			};
			
	        this.isSingleSelection = function() {
	            return this.options.selectionMode === 'single';
	        };

	        this.isMultipleSelection = function() {
	            return this.options.selectionMode === 'multiple';
	        };
	        
	        this.isSortingEnabled = function() {        	
	            
	        	if(this.columns) {
	        		for(var i = 0, t = this.columns.length; i < t; i++) {
	                    if(this.columns[i].sortable) {
	                        return true;
	                    }
	                }
	            }

	            return false;
	        };
	        
			this.determineTransclude = function() {

	        	var divTransclude  = angular.element(this.element.children()[0]).children()[0];

	        	var columns = widgetColumn.determineColumnsOptions(divTransclude);
	        	
	        	this.facets = widgetFacet.determineFacetsOptions(divTransclude);
	        		        	
	        	if (columns) {
	        		this.columns = columns;
	        	}

				// Delete transclude div
				angular.element(divTransclude).remove();
	        };
	                 			
			this.onLoadData = function () {
									
				if (this.firstLoad) {								
					
					this.firstLoad = false;
					
					this.changeScope();
					
					this.buildBody();
					
					if (this.options.paginator) {
						this.initPaginator();
					}
				}
				else {												
					if (this.options.paginator) {
						datatablePaginator.update(this.paginatorData, this.value.getRowCount());
					}
					
					if (!this.isHttpDataLoader()) {
						this.scope.$apply();
					}
					
				}
			};
			
			this.clearSelection = function() {
				this.selection = [];
			};
							
	        this.removeSelection = function(item) {
	        	
	        	if (!this.isSelected(item)) {	        		
	        		if (this.options.itemId) {
	        			this.selection.splice(this.selection.indexOf(this.getItemId(item)), 1);
	        		}
	        		else {
	        			this.selection.splice(this.selection.indexOf(item), 1);
	        		}        		
	            }
	        };
	        
	        this.selectRow = function(row, silent) {

	        	var item = row.data('item');
	            
	            row.removeClass('ui-state-hover').addClass('ui-state-highlight').attr('aria-selected', true);

	            this.addSelection(item);

	            if(!silent && this.options.onRowSelect) {
	            	this.options.onRowSelect('rowSelect', item);
	            }
	        };        

			this.setValue = function(v) {
								
				if (angular.isString(v)) {
					this.value = new AngularWidgets.HttpDataLoader({
						url: v
					});
				}
				else if ( v instanceof AngularWidgets.HttpDataLoader 
						|| v instanceof AngularWidgets.ArrayDataLoader) {
					this.value = v;
				}
				else {
					this.value = new AngularWidgets.ArrayDataLoader(v);
				}
				
				var $this = this;
				
				this.value.init({
					scope : this.scope,
					http : $http,
					onLoadData : function () { 
						$this.onLoadData(); 
					} 
				});
			};
	        
			this.sort = function (field, order) {
	            
				this.sorts = [{ 
					field : field, 
					order: order
				}];
				
				this.value.load(this.getParams());					
			};
			
			this.getCurrentPage = function() {
				return this.options.paginator ? this.datatablePaginator.getCurrentPage() : 0;
			}
			
			this.goToPage = function(page) {							
				this.paginatorData.goToPage(page);				
			}
			
			this.unselectAllRows = function(silent) {
	            
				this.tbody.children('tr.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false);

	            if (!silent && this.options.onRowUnselect) {
	                this.options.onRowUnselect('rowUnselectAll', null);
	            }
	            
	            this.selection = [];
	        };
	        
	        this.unselectRow = function (row, silent) {
	            
	            var item = row.data('item');
	            
	            row.removeClass('ui-state-highlight').attr('aria-selected', false);

	            this.removeSelection(item);

	            if (!silent && this.options.onRowUnselect) {
	                this.options.onRowUnselect('rowUnselect', item);
	            }
	        };

	        this.isSelected = function(item) {	        	
	        	return AngularWidgets.inArray(this.selection, this.options.itemId ? this.getItemId(item) : item);
	        };
        	
        	this.constructor(scope, element, options);        
        };
        
        widgetDatatable.DataTable = DataTable;
        
        return widgetDatatable;
    }]);
    
    angular.module('pje.ui').directive('puiDatatable', [ '$compile', '$http', 'widgetBase', 'widgetDatatable', 'widgetColumn', 'datatablePaginator', function ($compile, $http, widgetBase, widgetDatatable, widgetColumn, datatablePaginator) {
		return {
			restrict: 'E',
			priority: 50,
			transclude: true,				
			scope: true,
			link: function(scope, element, attrs, ctrl) {
				widgetDatatable.buildWidget(scope, element, attrs);
			},
			replace: true,
		    template: widgetDatatable.template
		 };
	}]);
    
    angular.module('pje.ui').directive('puiRowBuild', function (){
		return {
			restrict: 'A',
			link: function(scope, element, attrs, ctrl) {
				var dataTable = element.parent().data('dataTable');
				dataTable.buildRow(scope, element, attrs);
			}
		};
	});
    
}(window, document));
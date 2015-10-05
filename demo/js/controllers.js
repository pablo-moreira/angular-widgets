(function (window, document, undefined) {
    "use strict";

    angular.module('demo').controller('MainController', ['$location', '$rootScope', 'widgets', 'version',  function($location, $rootScope, widgets, version) {
    		
    	this.widgets = widgets;
        this.version = version;
        this.angularVersion = angular.version;
                
    	var url = $location.absUrl();

		this.widget = null;
	    	    	
		for (var i=0, t=this.widgets.length; i<t; i++) {
			    		
			for (var j=0, l=this.widgets[i].subPages.length; j<l; j++) {    			
				
				var pg = this.widgets[i].subPages[j];
				
				if (url.indexOf(pg.path) != -1) {
					this.widget = this.widgets[i];
					this.path = pg.path;
	    			break;	
				}
			}
			
			if (this.widget) {
				break;
			}
		};
		
		this.selectWidget = function(widget, path) {
			this.widget = widget;
			this.path = path;
		};
	}])    
    .controller('ButtonController', ['$scope',  'version', function ($scope) {
        

        $scope.showMessage = function(msg) {
            alert(msg);
        };

        $scope.buttonDisabled = true;

        $scope.enableButton = function() {
            $scope.buttonDisabled = false;
        };

        $scope.disableButton = function() {
            $scope.buttonDisabled =  true;
        };

        $scope.buttonTitle = 'Change me';

        $scope.buttonVisible = false;

        $scope.showButton = function() {
            $scope.buttonVisible = true;
        };

        $scope.hideButton = function() {
            $scope.buttonVisible =  false;
        };

    } ])
    .controller('PanelController', [ '$scope',  function ($scope) {
        
		$scope.panelBind;
        
		$scope.panelTitle = "Change me";
        
        $scope.onToggle = function (panel) {
        	alert('User toggled the panel to ' + (panel.isCollapsed() ? 'collapse' : 'expand') + '!');
        };
        
        $scope.onClose = function(panel) {
        	alert('User closed the panel');
        };
    }])
    .controller('TabviewController', [ '$scope',  function($scope) {

    	$scope.title1 = 'title1';
        $scope.description1 = 'description1';
        $scope.title2 = 'title2';
        $scope.description2 = 'description2';

        $scope.onTabChange = function(tabView, index) {
            alert('Tab with index '+ index + ' selected');
        };
        
        $scope.onTabClose = function(tabView, index) {
        	alert('Tab with index ' + index + ' closed - Tabs remains: ' + tabView.getLength());
        };
        
        $scope.tabViewBind = null;
        $scope.activeIndex = 1;     

        $scope.includeList = ["partials/puiTabview/include/panel1.html"
            , "partials/puiTabview/include/panel2.html"];

        $scope.distributedData = {
            field1: "field1"
            , field2: "field2"
            , field3: "field3"
        };

        $scope.addPanel = function() {
            $scope.includeList.push("partials/puiTabview/include/panel3.html");
        }
    }])
    .controller('InputController', [ '$scope',  function($scope) {
        

        $scope.value1 = 'Change me';

        $scope.numbers = 123;

        $scope.fieldDisabled = true;

        $scope.enableField = function() {
            $scope.fieldDisabled = false;
        };

        $scope.disableField = function() {
            $scope.fieldDisabled =  true;
        };

        $scope.fieldVisible = false;

        $scope.showField = function() {
            $scope.fieldVisible = true;
        };

        $scope.hideField = function() {
            $scope.fieldVisible =  false;
        };
    } ])
    .controller('DatatableController', [ '$scope', '$http',  'puiGrowl', function($scope, $http, puiGrowl) {      
    	
        $scope.fixedData =  [
            {'brand':'Volkswagen','year': 2012, 'color':'White', 'vin':'dsad231ff'},
            {'brand':'Audi','year': 2011, 'color':'Black', 'vin':'gwregre345'},
            {'brand':'Renault','year': 2005, 'color':'Gray', 'vin':'h354htr'},
            {'brand':'Bmw','year': 2003, 'color':'Blue', 'vin':'j6w54qgh'},
            {'brand':'Mercedes','year': 1995, 'color':'White', 'vin':'hrtwy34'},
            {'brand':'Opel','year': 2005, 'color':'Black', 'vin':'jejtyj'},
            {'brand':'Honda','year': 2012, 'color':'Yellow', 'vin':'g43gr'},
            {'brand':'Chevrolet','year': 2013, 'color':'White', 'vin':'greg34'},
            {'brand':'Opel','year': 2000, 'color':'Black', 'vin':'h54hw5'},
            {'brand':'Mazda','year': 2013, 'color':'Red', 'vin':'245t2s'}
        ];

        $scope.remoteData = function (callback) {
            $http.get('json/cars.json')
                .then(function(response){
                    $scope.safeApply(  // external changes aren't picked up by angular
                        callback.call(this, response.data)
                    )
                });
        };

        $scope.carTableData = {
            items : $scope.fixedData
            , itemId : 'vin'
            , selectionMode : 'single'            
            , onRowSelect: function(event, data) {
                puiGrowl.showInfoMessage('Row selection', 'Selected a '+data.color+ ' '+data.brand+ ' of '+data.year +' (id = '+data.vin+')');
            }
        };

        $scope.multiSelectTableData = {
            items : $scope.fixedData
            , itemId : 'vin'
            , selectionMode : 'multiple'            
            , onRowSelect: function(event, data) {
                puiGrowl.showInfoMessage('Row selection', 'Selected a '+data.color+ ' '+data.brand+ ' of '+data.year +' (id = '+data.vin+')');
            }
            , onRowUnselect: function(event, data) {
                if (data) {
                    puiGrowl.showInfoMessage('Row deselection', 'deselected the '+data.color+ ' '+data.brand+ ' of '+data.year +' (id = '+data.vin+')');
                }
            }
        };        

        $scope.data = {};
        $scope.data.rowIndex = null;

        $scope.progPaginatedData = {
            value : $scope.fixedData
            , rows : 4
            , paginator : true
            , selectedPage: 0
            , onPage : function(event, data) {
                $scope.safeApply(function() {
                    $scope.progPaginatedData.selectedPage = data;
                });
            }
        };

        // Prog Pagination
        $scope.progPaginationBind = null;
        $scope.progPaginationPage = 0;        
         
        // HttpDataLoader
        $scope.httpDataLoaderObject = new PJeUI.HttpDataLoader({
        	url: 'json/cars2.json',
        	success: function (data, params) {
        		
		        if (params.sorts.length > 0) {
			        
		        	var field = params.sorts[0].field;
		        	var order = params.sorts[0].order == "asc" ? 1 : -1;
		        
					data.rows.sort(function(data1, data2) {
		            
						var value1 = data1[field],
		                	value2 = data2[field],
		                	result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
			
						return (order * result);
			        });
		        }
        		
        		var pageSize = params.pageSize || data.rowCount;
        		
        		var page = params.first + pageSize,
    				rowCount = data.rowCount

	    		var rows = [];
            
	            for (var i = params.first; i < (page) && i < data.rowCount; i++) {
	             	rows.push(data.rows[i]);
	            }
	            
        		return { 
	        		rowCount: data.rowCount,
	        		rows: rows
        		}
        	}
        });        
        
        // Common
        $scope.onRowSelect = function(event, data) {
            puiGrowl.showInfoMessage('Row selection', 'Selected a ' + data.color + ' ' + data.brand + ' of ' + data.year + ' (id = ' + data.vin + ')');
        }
        $scope.onRowUnselect = function(event, data) {
			if (data) {
            	puiGrowl.showInfoMessage('Row deselection', 'deselected the ' + data.color + ' ' + data.brand + ' of ' + data.year + ' (id = ' + data.vin + ')');
            }
        }        	        
        $scope.showInfo = function (car) {
        	puiGrowl.showInfoMessage('Car Information', 'Car Vin: ' + car.vin + ' Brand: ' + car.brand );
        };
    }])
    .controller('GrowlController', [ '$scope',  'puiGrowl', function($scope, puiGrowl) {
        

        $scope.showInfoGrowl = function() {
            puiGrowl.showInfoMessage('Info message title', "Info detail message");
        };

        $scope.showErrorGrowl = function() {
            puiGrowl.showErrorMessage('Error message title', "Error detail message");
        };

        $scope.showWarnGrowl = function() {
            puiGrowl.showWarnMessage('Warn message title', "Warn detail message");
        };

        $scope.showStickyMessage = function() {
            puiGrowl.setSticky(true);
            puiGrowl.clear();
            puiGrowl.showInfoMessage('Message', "Message remains until close icon clicked or other message requested");
        };

        $scope.resetGrowlOptions = function() {
            puiGrowl.setSticky(false);
        }
    } ])
    .controller('AutocompleteController', [ '$scope',   function($scope) {
				
    	$scope.value01 = 'b';
    	$scope.value02 = null;
    	$scope.value03 = null;
		$scope.value04 = null;
    	
        $scope.country = null;

        $scope.countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia',
            'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda',
            'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burma', 'Burundi', 'Cambodia',
            'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo, Democratic Republic',
            'Congo, Republic of the', 'Costa Rica', 'Cote d\'Ivoire', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
            'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland',
            'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Greenland', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
            'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
            'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea, North', 'Korea, South', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
            'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
            'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Mongolia', 'Morocco', 'Monaco', 'Mozambique', 'Namibia',
            'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Panama', 'Papua New Guinea',
            'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', ' Sao Tome',
            'Saudi Arabia', 'Senegal', 'Serbia and Montenegro', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
            'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
            'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates',
            'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
                
       	$scope.objects = [
           {'brand':'Volkswagen','year': 2012, 'color':'White', 'vin':'dsad231ff'},
           {'brand':'Audi','year': 2011, 'color':'Black', 'vin':'gwregre345'},
           {'brand':'Renault','year': 2005, 'color':'Gray', 'vin':'h354htr'},
           {'brand':'Bmw','year': 2003, 'color':'Blue', 'vin':'j6w54qgh'},
           {'brand':'Mercedes','year': 1995, 'color':'White', 'vin':'hrtwy34'},
           {'brand':'Opel','year': 2005, 'color':'Black', 'vin':'jejtyj'},
           {'brand':'Honda','year': 2012, 'color':'Yellow', 'vin':'g43gr'},
           {'brand':'Chevrolet','year': 2013, 'color':'White', 'vin':'greg34'},
           {'brand':'Opel','year': 2000, 'color':'Black', 'vin':'h54hw5'},
           {'brand':'Mazda','year': 2013, 'color':'Red', 'vin':'245t2s'}
       ];
        

       	$scope.autoCompleteMethod = function (request, response) {
       	    
       		var data = [];
       	    
       		var query = request.query;
       	    
       		for (var i = 0; i < 5; i++) {
       			data.push(query.value + i);
       		}
       	    
       		response(data);
       	};

        $scope.fieldDisabled = true;

        $scope.enableField = function () {
            $scope.fieldDisabled = false;
        };

        $scope.disableField = function () {
            $scope.fieldDisabled = true;
        };

        $scope.selectedsCountries = new Array();
//        $scope.multipleCountry = {
//            
//            , completeMethod: $scope.countries
//            , multipleValues: []
//            , addSelection : function(value) {
//                $scope.safeApply(  // external changes aren't picked up by angular
//                    $scope.multipleCountry.multipleValues.push(value)
//                )
//            }
//            , removeSelection : function(value) {
//                var arr = $scope.multipleCountry.multipleValues,
//                    idx = arr.indexOf(value);
//                if (idx > -1) {
//                    $scope.safeApply(  // external changes aren't picked up by angular
//                        $scope.multipleCountry.multipleValues = arr.splice(idx, 1)
//                    )
//                }
//            }
//        };

        $scope.limitToList = {
            forceSelection : true
            , completeMethod: $scope.countries
        };

        $scope.callbackOptions = {
            completeMethod: $scope.countries
            , makeSelection: function(label) {
                alert(label + ' selected ');
            }
        };

    } ])
    .controller('FieldsetController', [ '$scope',   function($scope) {
        
    	$scope.fieldsetBind;

        $scope.onToggle = function (e, fieldset) {
        	alert('User toggled the fieldset to ' + (fieldset.isCollapsed() ? 'collapse' : 'expand') + '!');            
        };

        $scope.fieldsetName = 'Change me';
        
    } ])
    .controller('EventController', ['$scope',   function($scope) {
        
        $scope.value1 = '';

        $scope.showInfo = function(value) {
            alert('Value of field is '+value);
        };

        $scope.data = {
            name : 'test'
        };

        $scope.showName = function() {
            alert('Current name is  ' + $scope.data.name);
        };

    } ])
    .controller('DialogController', ['$scope', function($scope) {

    	$scope.basicDialog = null;    
    	
    }])
    .controller('puiPanel', [ function() {

    }]);
    
    
}(window, document));
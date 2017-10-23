import WMSCapabilities from 'ol/format/wmscapabilities';


class Sidebar {
		
	constructor() {
		this.products = {
			maps: [],
			observations: [],
			forecasts: [],
			radar: [],
			satellite: []	
		}
		
		//console.log(this.products);
	}
	
	updateProducts() {
		console.log("updateProducts()");
		
		var apikey = decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2]);
				
		var url = 'http://wms.fmi.fi/fmi-apikey/'+apikey+'/geoserver/wms?request=GetCapabilities&service=WMS';
	
		var parser = new WMSCapabilities();
		var self = this;
			
		fetch(url).then(function(response) {
			  return response.text();
      	}).then(function(text) {
	      	var result = parser.read(text);
	      	console.log(result);
	    
		  	result.Capability.Layer.Layer.forEach(function(value, index) {
				
				if (value.Name.search("BasicMap")>=0) {
					self.products.maps.push(value);
				}

				if (value.Name.search("Radar")>=0) {
					self.products.radar.push(value);
				}

				if (value.Name.search("Weather")>=0) {
					self.products.forecasts.push(value);
				}
				
				if (value.Name.search("Satellite")>=0) {
					self.products.satellite.push(value);
				}
				 	
		  	});
		  	
		  	self.updateProductListView();
	    
	    });
		
	}
	
	updateProductListView() {
		
		console.log("updateProductListView()");
		
		var keys = Object.keys(this.products);	
		
		var html = "";
		
		var self = this;
		
		keys.forEach(function(value, index) {
			html += '<div class="fmi-metweb-productgroup closed">';
			html += '<div class="fmi-metweb-productgroup-title">'+value.toUpperCase()+'</div>';		
			html += '<div class="fmi-metweb-productgroup-list">';
			
			if (self.products[value].length==0) {
				html += '<div class="fmi-metweb-productgroup-product">No products</div>';			
			} else {
				self.products[value].forEach(function(value, index) {
					html += '<div class="fmi-metweb-productgroup-product">'+value.Name+'</div>';
				});
			}
			
			html += '</div></div>';
		});	
	
		$("#fmi-metweb-productgroup-container").html(html);
		$(".fmi-metweb-productgroup-title").on("click", self.toggleProductGroup);
	
	}
	
	toggleProductGroup() {
		
		var $group = $(this).parent(".fmi-metweb-productgroup").first();
		
		if ($group.hasClass("closed"))
			$group.removeClass("closed").addClass("open");
		else
			$group.removeClass("open").addClass("closed");
		
	}
	
	
}

export default Sidebar;


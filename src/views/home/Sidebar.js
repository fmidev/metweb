import WMSCapabilities from 'ol/format/wmscapabilities';


class Sidebar {
		
	constructor() {
		this.windows = false;
		
		this.products = {
			all: [],
			maps: [],
			observations: [],
			forecasts: [],
			radar: [],
			satellite: []	
		}
		
		//console.log(this.products);
	}
	
	setWindows(windows) {
		this.windows = windows;
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
				
				self.products.all.push(value);
				 	
		  	});
		  	
		  	self.updateProductListView();
	    
	    });
		
	}
	
	getApiKey() {
		return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2]);
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
		//$(".fmi-metweb-productgroup-product").on("click", self.addProductToActiveMap);
		
		var products = document.querySelectorAll(".fmi-metweb-productgroup-product");
		
		for(var i=0; i<products.length; i++) {
			products[i].addEventListener("click", (e) => { this.addProductToActiveMap(e); });	
		}
	}
	
	toggleProductGroup() {
		
		var $group = $(this).parent(".fmi-metweb-productgroup").first();
		
		if ($group.hasClass("closed"))
			$group.removeClass("closed").addClass("open");
		else
			$group.removeClass("open").addClass("closed");
		
	}
	
	addProductToActiveMap(evt) {
		
		console.log("addProductToActiveMap");
		
		var name = $(evt.target).html();
		var product = false;
		
		//console.log(this.products.all);
				
		for(let current of this.products.all) {
			if (current.Name===name) {
				product = current; 
				break;
			}
		}
		
		if (!product)
			return;
		
		
		var config = this.generateConfigForProduct(product);
		
		//console.log(config.map.model.layers);
		
		this.windows.set(0, config);
	}
	
	generateConfigForProduct(product) {
		
		var apiKey = this.getApiKey();
		
		var resolutionTime = 30 * 60 * 1000;
		var currentDate = new Date();
		var currentTime = currentDate.getTime();
		var beginTime = currentTime-resolutionTime;
		var endTime = currentTime+resolutionTime;
		var resolutions = [2048, 1024, 512, 256, 128, 64];
		
		var config = {
			project: 'mymap',
			// Map view configurations
			map: {
				model: {
					// Layer configuration
					layers: [
						// ---------------------------------------------------------------
						{
							className: 'WMTS',
							title: 'Taustakartta',
							type: 'map',
							visible: true,
							opacity: 1.0,
							sourceOptions: {
								matrixSet: 'ETRS-TM35FIN',
								layer: 'KAP:Europe_basic_EurefFIN',
								format: 'image/png'
							},
							tileCapabilities: 'http://wms.fmi.fi/fmi-apikey/'+apiKey+'/geoserver/gwc/service/wmts?request=GetCapabilities',
							animation: {
								hasLegend: false
							}
						}
					]
				},
				view: {
					container: 'fmi-animator',
					projection: 'EPSG:3857',
					extent: [-500000, 5000000, 5000000, 20000000],
					resolutions: resolutions,
					defaultCenterLocation: [2750000, 9000000],
					defaultCenterProjection: 'EPSG:3857',
					defaultZoomLevel: 0,
					showLegend: true,
					legendTitle: 'Legend',
					noLegendText: 'None',
					showLayerSwitcher: true,
					showLoadProgress: true,
					ignoreObsOffset: 5 * 60 * 1000,
					maxAsyncLoadCount: 5,
					// Disable panning and zooming
					staticControls: false
				}
			},
			// Time configuration
			time: {
				model: {
					autoStart: false,
					waitUntilLoaded: false,
					autoReplay: true,
					refreshInterval: 60 * 60 * 1000,
					frameRate: 500,
					resolutionTime: resolutionTime,
					defaultAnimationTime: beginTime,
					beginTime: beginTime,
					endTime: endTime,
					endTimeDelay: 1000
				},
				view: {
					showTimeSlider: false,
					timeZone: 'Europe/Helsinki',
					imageWidth: 55,
					imageHeight: 55,
					imageBackgroundColor: '#585858',
					sliderOffset: 55,
					sliderHeight: 55,
					statusHeight: 12,
					tickTextColor: '#000000',
					pastColor: '#B2D8EA',
					futureColor: '#D7B13E',
					tickColor: '#FFFFFF',
					notLoadedColor: '#585858',
					loadingColor: '#B2D8EA',
					loadedColor: '#94BF77',
					loadingErrorColor: '#9A2500',
					tickHeight: 24,
					tickTextYOffset: 18,
					tickTextSize: 12,
					pointerHeight: 30,
					pointerTextOffset: 15,
					pointerColor: '#585858',
					pointerTextColor: '#D7B13E',
					pointerTextSize: 12
				}
			}
		};
		
		// Add product to layers
		
		console.log("product: "+product);
		
		var layer = {
			"className": "WMTS",
			"title": product.Title,
			"type": "obs",
			"visible": true,
			"opacity": 1.0,
			"sourceOptions": {
				"matrixSet": "ETRS-TM35FIN-FINLAND",
				"layer": product.Name,
				"format": "image/png"
			},
			"tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
			"timeCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/wms?request=GetCapabilities&service=WMS",
			"animation": {
				"beginTime": beginTime,
				"hasLegend": "http://data.fmi.fi/fmi-apikey/"+apiKey+"/dali?customer=legend&product=rr&width=100&height=250&type=png"
			}
		};
		
		config.map.model.layers.push(layer);
		
		return config;		
	
	}
	
	
	
}

export default (new Sidebar);


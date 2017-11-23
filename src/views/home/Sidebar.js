import WMSCapabilities from 'ol/format/wmscapabilities';
import MenuReader from './MenuReader.js';
import Metadata from './Metadata.js';

class Sidebar {
		
	constructor() {
		this.windows = false;
			
		//console.log(this.products);
	}
	
	setWindows(windows) {
		this.windows = windows;
	}
	
	updateProducts() {
		console.log("updateProducts()");
			
		// Now read configuration
		
		var menu = MenuReader.getMenuJson();
		this.updateProductListView(menu);
		
		Metadata.resolveMetadataForMenu(menu);	
	}
	
	getApiKey() {
		if (window.location.search.match(/(\?|&)apikey\=([^&]*)/)==null)
			return APIKEY;		
		
		return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2]);
				
	}
	
	updateProductListView(menu) {
		
		console.log("updateProductListView()");
		
		var html = "";
				
		for(var i=0; i<menu.menu.length; i++) {
			
			var submenu = menu.menu[i];
			
			html += '<div class="fmi-metweb-productgroup closed">';
			html += '<div class="fmi-metweb-productgroup-title">'+submenu.title.toUpperCase()+'</div>';		
			html += '<div class="fmi-metweb-productgroup-list">';
			
			if (submenu.items.length==0) {
				html += '<div class="fmi-metweb-productgroup-product">No products</div>';			
			} else {
				submenu.items.forEach(function(value, index) {
					var data = "";
					
					if (value.layer)
						data += ' data-layer="'+value.layer+'"';
						
					if (value.metadata)
						data += ' data-metadata="'+value.metadata+'"';
					else
						data += ' data-metadata="'+menu.metadata[0].name+'"';
						
					if (submenu.type)
						data += ' data-type="'+submenu.type+'"';
					else
						data += ' data-type="'+submenu.type+'"';
						
					// Find time interval for layer
																			
					html += '<div class="fmi-metweb-productgroup-product" '+data+'>'+value.title+'</div>';
				});
			}
			
			html += '</div></div>';
		};
	
		$("#fmi-metweb-productgroup-container").html(html);
		$(".fmi-metweb-productgroup-title").on("click", this.toggleProductGroup);
		//$(".fmi-metweb-productgroup-product").on("click", self.addProductToActiveMap);
		
		var products = document.querySelectorAll(".fmi-metweb-productgroup-product");
		
		for(var i=0; i<products.length; i++) {
			products[i].addEventListener("click", (e) => { this.addProductToActiveMap(e); });	
		}
	}
	
	toggleProductGroup() {
		
		console.log("toggleProductGroup()");
		
		var $group = $(this).parent(".fmi-metweb-productgroup").first();
		
		if ($group.hasClass("closed"))
			$group.removeClass("closed").addClass("open");
		else
			$group.removeClass("open").addClass("closed");
		
	}
	
	addProductToActiveMap(evt) {
		
		console.log("addProductToActiveMap");
		
		var title = $(evt.target).html();
		var layer = $(evt.target).data("layer");
		var type = $(evt.target).data("type");
		var metadata = $(evt.target).data("metadata");
		
		if (!layer)
			return;	
		
		var config = this.generateConfigForProduct(title, layer, type, metadata);
		
		//console.log(config.map.model.layers);
		
		this.windows.set(this.windows.getSelected(), config);
	}
	
	generateConfigForProduct(title, layer, type, metadata) {
				
		var apiKey = this.getApiKey();
		
		var baseUrl = 'http://wms.fmi.fi/fmi-apikey/' + apiKey + '/geoserver/';
		var wmsBaseUrl = baseUrl + 'wms'		
		
		var currentDate = new Date();
		var currentTime = currentDate.getTime();
			  
		var resolutions = [2048, 1024, 512, 256, 128, 64];
		var origins1024 = [[-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]];
		var extent = [-118331.366408356, 6335621.16701424, 875567.731906565, 7907751.53726352];
		var imgPath = 'src/assets/images/';
		
		// Resolve correct time resolution from metadata		
		
		var minutes = Metadata.getTimeResolutionForLayer(metadata, layer);
		
		if (minutes)
			var resolutionTime = minutes * 60 * 1000;
		else
			var resolutionTime = 60 * 60 * 1000;
		
		if (type=="obs") {
			var beginTime = currentTime-10*resolutionTime;
			var endTime = currentTime;
	    } else {
			var beginTime = currentTime;
			var endTime = currentTime+10*resolutionTime;		    		    
	    }	
					
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
					refreshInterval: 5 * 60 * 1000,
					frameRate: 500,
					resolutionTime: resolutionTime,
					defaultAnimationTime: beginTime,
					beginTime: beginTime,
					endTime: endTime,
					endTimeDelay: 1000
				},
				view: {
					showTimeSlider: true,
					timeZone: 'Europe/Helsinki',
					playPauseImageWidth: 60,
					playPauseImageHeight: 60,
					timeStepsImageWidth: 60,
					timeStepsImageHeight: 60,
					backgroundColor: '#000000',
					imageBackgroundColor: 'rgba(0,0,0,0)',
					imageHoverColor: 'rgba(0,0,0,0)',
					shadowOpacity: 0.3,
					height: 100,
					sliderXOffset: 10,
					sliderYOffset: 40,
					sliderHeight: 60,
					statusHeight: 4,
					statusXOffset: 30,
					statusYOffset: 40,
					statusRounded: true,
					tickTextColor: '#FFFFFF',
					pastColor: '#8ED141',
					futureColor: '#74B6E6',
					tickColor: '#FFFFFF',
					notLoadedColor: '#585858',
					loadingColor: '#BDBDBD',
					loadingErrorColor: '#9A2500',
					tickHeight: 0,
					tickTextYOffset: 35,
					tickTextSize: 14,
					pointerTop: true,
					pointerHeight: 30,
					pointerArrowHeight: 10,
					pointerArrowWidth: 5,
					pointerYOffset: 50,
					pointerTextYOffset: 0,
					pointerColor: '#FFFFFF',
					pointerStrokeColor: '#BDBDBD',
					pointerStrokeWidth: 1,
					pointerTextColor: '#000000',
					pointerTextSize: 13,
					pointerHandleYOffset: 0,
					pointerHandleImageWidth: 18,
					pointerHandleImageHeight: 18,
					pointerHandleImagePath: imgPath + 'timeline-handle.svg',
					playImagePath: imgPath + 'play.svg',
					pauseImagePath: imgPath + 'pause.svg',
					timeStepsImagePath: imgPath + 'time-steps.svg'
				}
			}
		};
		
		// Add product to layers
			
		var layer = {
              className: 'TileWMS',
              title: title,
              visible: true,
              opacity: 1.0,
              type: type,
              sourceOptions: {
                url: wmsBaseUrl,
                params: {
                  'LAYERS': layer,
                  'TRANSPARENT': 'TRUE',
                  'FORMAT': 'image/png'
                },
                projection: 'EPSG:3067',
                tileGridOptions: {
                  origins: origins1024,
                  extent: extent,
                  resolutions: resolutions,
                  tileSize: 1024
                }
              },
              //"tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
			  "timeCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/wms?request=GetCapabilities&service=WMS",
              animation: {
                beginTime: currentTime,
                hasLegend: true
              }
        };
			
		config.map.model.layers.push(layer);
		
		return config;		
	
	}
	
	
	
}

export default (new Sidebar);


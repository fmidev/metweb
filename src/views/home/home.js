/**
 * Application entry point
 */

// Load application styles
import './home.less';
// Load temporarily from tmp directory
import * as mapWindows from '../../tmpLib/mapWindows';

// ================================
// START YOUR APP HERE
// ================================


// Some initial testing. Will be added to own class soon.

$(document).ready(function() {

	$(".fmi-metweb-productgroup-title").on("click", toggleProductGroup);
	$("#fmi-metweb-sidebar").on("click", toggleSidebar);
	$(".fmi-metweb-filter-button").on("click", toggleFilter);

	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};

	// Testimielessä API key on tässä mahdollista antaa URL-parametrina,
	// jotta esimerkki toimisi eikä avainta tarvitsisi säilyttää versionhallinnassa
    var apiKey = getUrlParameter('api-key');
    console.log(apiKey);
	var config = getConfig(apiKey);

	// Määritellään ikkunoiden sijainti, luodaan ne sekä konfiguroidaan niiden sisältö
    mapWindows
    	.setContainer('fmi-metweb-windows')
		.createWindows()
		.set(0, config)
		.set(1, config)
		.set(2, config)
		.set(3, config);
});

function toggleSidebar() {
	if ($("#fmi-metweb-sidebar-menu").is(":visible")) {
		$("#fmi-metweb-sidebar").removeClass("open");
        $("#fmi-metweb-sidebar-menu").css("display", "none");
		$("#fmi-metweb-windows").css("width", "100%");
    } else {
	    $("#fmi-metweb-sidebar").addClass("open");
		$("#fmi-metweb-sidebar-menu").css("display", "flex");
		$("#fmi-metweb-windows").width(function(i, w) {
			return w - 270;
		});
    }
}

function getConfig(apiKey) {

	// Initialize options objects for animation.
	var resolutionTime = 5 * 60 * 60 * 1000;
	var currentDate = new Date();
	var currentTime = window.fi.fmi.metoclient.ui.animator.Utils.floorTime(currentDate.getTime(), 60 * 60 * 1000);
	var beginDate = new Date(currentTime);
	var endDate = new Date(currentTime);
	// Make sure begin time starts from the exact hour.
	// Then, timesteps will be on the proper positions when layers are requested.
	// If requested times do not match exactly FMI observation times, layers may
	// not contain any visible content.
	beginDate = window.fi.fmi.metoclient.ui.animator.Utils.floorDate(beginDate, 60 * 60 * 1000);
	var beginTime = beginDate.getTime();
	var endTime = endDate.getTime();
	var baseUrl = 'http://wms.fmi.fi/fmi-apikey/' + apiKey + '/geoserver/';
	var wmsBaseUrl = baseUrl + 'wms';
	var wmtsBaseUrl = baseUrl + 'gwc/service/wmts';
	var resolutions = [2048, 1024, 512, 256, 128, 64];
	var matrixIds = [
		'ETRS-TM35FIN:2',
		'ETRS-TM35FIN:3',
		'ETRS-TM35FIN:4',
		'ETRS-TM35FIN:5',
		'ETRS-TM35FIN:6',
		'ETRS-TM35FIN:7'
	];
	var origin = [-4537345.568, 8254755.58];
	var origins256 = [[-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]];
	var origins512 = [[-118331.36640836, 8432773.1670142], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]];
	var origins1024 = [[-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]];
	var extent = [-118331.366408356, 6335621.16701424, 875567.731906565, 7907751.53726352];

	return {
		project: 'mymap',
		// Map view configurations
		map: {
			model: {
				// Layer configuration
				layers: [
					// ---------------------------------------------------------------
					{
						"className": "WMTS",
						"title": "Taustakartta",
						"type": "map",
						"visible": true,
						"opacity": 1.0,
						"sourceOptions": {
							"matrixSet": "ETRS-TM35FIN",
							"layer": "KAP:Europe_basic_EurefFIN",
							"format": "image/png"
						},
						"tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
						"animation": {
							"hasLegend": false
						}
					},
					{
						"className": "WMTS",
						"title": "Tutkahavainto",
						"type": "obs",
						"visible": true,
						"opacity": 1.0,
						"sourceOptions": {
							"matrixSet": "ETRS-TM35FIN-FINLAND",
							"layer": "Radar:suomi_rr_eureffin",
							"format": "image/png"
						},
						"tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
						"timeCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/wms?request=GetCapabilities&service=WMS",
						"animation": {
							"beginTime": 1505371354395,
							"hasLegend": "http://data.fmi.fi/fmi-apikey/"+apiKey+"/dali?customer=legend&product=rr&width=100&height=250&type=png"
						}
					},
					{
						"className": "WMTS",
						"title": "airports tma cta",
						"type": "overlay",
						"visible": true,
						"sourceOptions": {
							"matrixSet": "ETRS-TM35FIN",
							"layer": "KAP:airports_tma_cta",
							"format": "image/png"
						},
						"tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
						"animation": {
							"hasLegend": false
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
				defaultAnimationTime: (new Date()).getTime(),
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
}

function toggleProductGroup() {
	
	var $group = $(this).parent(".fmi-metweb-productgroup").first();
	
	if ($group.hasClass("closed"))
		$group.removeClass("closed").addClass("open");
	else
		$group.removeClass("open").addClass("closed");
	
}

function toggleFilter() {
	
	if ($(this).hasClass("selected"))
		$(this).removeClass("selected");
	else
		$(this).addClass("selected");	
	
}

/**
 * Application entry point
 */

// Load application styles
import './home.less';
import '../../styles/map.less';
// Load temporarily from tmp directory
import * as layout from '../../tmpLib/layout';
import Sidebar from './Sidebar.js';

// ================================
// START YOUR APP HERE
// ================================


// Some initial testing. Will be added to own class soon.

$(document).ready(function() {

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
  var apiKey = getUrlParameter('apikey');
  console.log(apiKey);
	var config = getConfig(apiKey);
	// Esimerkin vuoksi neljä vastaavaa karttanäkymää, joiden sijainnit poikkeavat toisistaan
	var config0 = jQuery.extend(true, {}, config);
	config0.map.view.defaultCenterLocation = [2250000, 8500000];
	var config1 = jQuery.extend(true, {}, config);
	config1.map.view.defaultCenterLocation = [2750000, 9000000];
	var config2 = jQuery.extend(true, {}, config);
	config2.map.view.defaultCenterLocation = [2050000, 9500000];
	var config3 = jQuery.extend(true, {}, config);
	config3.map.view.defaultCenterLocation = [2800000, 10800000];
	// Määritellään ikkunoiden sijainti, luodaan ne sekä konfiguroidaan niiden sisältö
	layout
    .setContainer('fmi-metweb-windows')
		.createWindows()
		.set(0, config0)
		.set(1, config1)
		.set(2, config2)
		.set(3, config3)
		.select(0)
		.onSelectionChanged(function(selected) {
			console.log('On selection changed: '+selected);
		})

	console.log(layout);
	console.log('Selected: '+layout.getSelected());

	Sidebar.setWindows(layout);
	Sidebar.updateProducts();

});

function toggleSidebar() {
	if ($("#fmi-metweb-sidebar-menu").is(":visible")) {
		$("#fmi-metweb-sidebar").removeClass("open");
    $("#fmi-metweb-sidebar-menu").css("display", "none");
		$("#fmi-metweb-windows-and-footer").css("width", "calc(100vw - 50px)");
    } else {
	    $("#fmi-metweb-sidebar").addClass("open");
  		$("#fmi-metweb-sidebar-menu").css("display", "flex");
	  	$("#fmi-metweb-windows-and-footer").css("width", "calc(100vw - 320px)");
    }
}

function getConfig(apiKey) {

	// Create animation layers.
	var resolutionTime = 30 * 60 * 1000;
	var currentDate = new Date();
	var currentTime = currentDate.getTime();
	var beginTime = currentTime-2*resolutionTime;
	var endTime = currentTime+2*resolutionTime;
	var resolutions = [2048, 1024, 512, 256, 128, 64];
	var imgPath = 'src/assets/images/';
	return {
		project: 'metweb',
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
					},
					{
						className: 'WMTS',
						title: 'Tutkahavainto',
						type: 'obs',
						visible: true,
						opacity: 1.0,
						sourceOptions: {
							matrixSet: 'ETRS-TM35FIN-FINLAND',
							layer: 'Radar:suomi_rr_eureffin',
							format: 'image/png'
						},
						tileCapabilities: 'http://wms.fmi.fi/fmi-apikey/'+apiKey+'/geoserver/gwc/service/wmts?request=GetCapabilities',
						timeCapabilities: 'http://wms.fmi.fi/fmi-apikey/'+apiKey+'/geoserver/wms?request=GetCapabilities&service=WMS',
						animation: {
							beginTime: beginTime,
							hasLegend: 'http://data.fmi.fi/fmi-apikey/'+apiKey+'/dali?customer=legend&product=rr&width=100&height=250&type=png'
						}
					},
					{
						className: 'WMTS',
						title: 'airports tma cta',
						type: 'overlay',
						visible: true,
						sourceOptions: {
							matrixSet: 'ETRS-TM35FIN',
							layer: 'KAP:airports_tma_cta',
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
}

function toggleFilter() {
	
	if ($(this).hasClass("selected"))
		$(this).removeClass("selected");
	else
		$(this).addClass("selected");	
	
}

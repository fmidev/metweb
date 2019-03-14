
import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'
import * as _ol_extent_ from 'ol/extent.js';
import _ol_proj_ from 'ol/proj.js';

const defaultSteps = 12;
const PROJECTION = "EPSG:3857";
const EXTENT = _ol_proj_.get(PROJECTION).getExtent();

//var startResolution = _ol_extent_.getWidth(EXTENT) / 512;
//var resolutions = new Array(22);
//for (var i = 0, ii = resolutions.length; i < ii; ++i) {
//  resolutions[i] = startResolution / Math.pow(2, i);
//}

//const RESOLUTIONS = resolutions

/* Application core functions */

// Cookie getter
export const getCookie = (cname) => {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


// Get API key from a) get param or b) environment variable
export const getApiKey = () => {
  if (window.location.search.match(/(\?|&)apikey\=([^&]*)/) == null)
    return APIKEY

  return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2])

}


// Update menu tree based on GoldenLayout state
export const updateActiveProducts = (menuObject, windows) => {
  // By default everything all products be inactive
  menuObject.menu.forEach((menu, menuIndex) => {
    menu.items.forEach((item, itemIndex) => {
      item.active = false
    })
  })

  var config = getSelectedWindowConfig(windows);

  // After resetting the values to inactive, set active products
  if(config){
    Object.keys(config.layers).forEach((key) => {
      menuObject.menu.forEach((menu, menuIndex) => {
        menu.items.forEach((item, itemIndex) => {
          if(key == item.layer){
            item.active = true
          }
        })
      })
    });
  }

  return menuObject

}


function setTimeParameters(config){
  config.resolutionTime = 300000
  config.modifiedResolutionTime = 300000
  config.firstDataPointTime = Number.MAX_VALUE
  config.lastDataPointTime = 0
  Object.values(config.layers).forEach((layer) => {
    if (layer.animation.hasLegend) {
      if (layer.resolutionTime > config.resolutionTime) {
        config.resolutionTime = layer.resolutionTime
        config.modifiedResolutionTime = layer.resolutionTime
      }
      if (layer.firstDataPointTime < config.firstDataPointTime) {
        config.firstDataPointTime = layer.firstDataPointTime
      }
      if (layer.lastDataPointTime > config.lastDataPointTime) {
        config.lastDataPointTime = layer.lastDataPointTime
      }
    }
  })
  var currentDate = new Date()
  var currentTime = currentDate.getTime()
  if (config.firstDataPointTime > currentTime) {
    config.endTime = config.firstDataPointTime + (config.resolutionTime * defaultSteps)
    config.beginTime = config.firstDataPointTime
  } else if (config.lastDataPointTime < currentTime) {
    config.beginTime = config.lastDataPointTime - (config.resolutionTime * defaultSteps)
    config.endTime = config.lastDataPointTime
  }
}

export const getSelectedWindowConfig = (windows) => {
  var selectedWindowId = windows.getSelected()
  var config = selectedWindowId !== null && selectedWindowId !== undefined ? windows.get(selectedWindowId) : false
  return config;
}
export const setSelectedWindowConfig = (windows, config) => {
  var selectedWindowId = windows.getSelected()
  windows.set(selectedWindowId, config)
}

// Activate product in selected window
export const activateProductInSelectedWindow = (product, windows) => {
  var config = generateConfigForProduct(product.title, product.layer, product.type, product, product.source, windows)
  setSelectedWindowConfig(windows, config);
}

// Deactivate product in selected window
export const deactivateProductInSelectedWindow = (product, windows) => {
  var config = getSelectedWindowConfig(windows)

  if(!config)
    return

    delete config.layers[product.layer]
    config.resolutionTime = getResolution(config)
    config.modifiedResolutionTime = getResolution(config)
    setSelectedWindowConfig(windows, config)
}

// Generate MetOClient config object based on the less verbose TOML config
// NOTE: "Append" type function.
// In Metweb terms, _product object_ is _added_ to _currently selected window_.
// In MetOClient terms, _config object_ is _modified_ by appending a _layer_
export const generateConfigForProduct = (title, layer, type, product, source, windows) => {
    var config = windows.get(windows.getSelected())
    var sourcecfg = MenuReader.getSource(source)

  if (!sourcecfg) {
    alert('Missing source information for the product')
    return
  }

  var apiKey = getApiKey()

  // What is the reason for origins? Removing them doesn't seem to change anything.
  var origins1024 = [[-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]]

  if (config == null) {
    config = {
      project: 'mymap',
      // Layer configuration
      layers: {
        // ---------------------------------------------------------------
      // ---------------------------------------------------------------
      'OpenStreetMap': {
          className: 'OSM',
          title: 'OpenStreetMap',
          type: 'map'
      },
          'MML_Taustakartta': {
          className: 'WMTS',
          title: 'MML taustakartta',
          type: 'map',
          source: {
            matrixSet: 'WGS84_Pseudo-Mercator',
            layer: 'taustakartta',
          },
          tileCapabilities: 'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?service=WMTS&request=GetCapabilities&version=1.0.0'
        },
        'MML_Maastokartta': {
          className: 'WMTS',
          title: 'MML maastokartta',
          type: 'map',
          source: {
            matrixSet: 'WGS84_Pseudo-Mercator',
            layer: 'maastokartta',
          },
          tileCapabilities: 'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?service=WMTS&request=GetCapabilities&version=1.0.0'
        },
        'Ocean_Basemap': {
          className: 'WMTS',
          title: 'ESRI ArcGIS Ocean Map',
          type: 'map',
          source: {
            matrixSet: 'GoogleMapsCompatible',
            layer: 'Ocean_Basemap',
          },
          tileCapabilities: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean_Basemap/MapServer/WMTS/1.0.0/WMTSCapabilities.xml'
        },
        'Canvas_World_Dark_Gray_Base': {
          className: 'WMTS',
          title: 'ESRI ArcGIS Dark Gray Basemap',
          type: 'map',
          source: {
            matrixSet: 'GoogleMapsCompatible',
            layer: 'Canvas_World_Dark_Gray_Base',
          },
          tileCapabilities: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/WMTS/1.0.0/WMTSCapabilities.xml'
        },
        'Canvas_World_Light_Gray_Base': {
          className: 'WMTS',
          title: 'ESRI ArcGIS Light Gray Basemap',
          type: 'map',
          source: {
            matrixSet: 'GoogleMapsCompatible',
            layer: 'Canvas_World_Light_Gray_Base',
          },
          tileCapabilities: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/WMTS/1.0.0/WMTSCapabilities.xml'
        }
      },
      projection: PROJECTION,
      extent: EXTENT,
//      resolutions: RESOLUTIONS,
      defaultCenterLocation: [2750000, 9000000],
      defaultCenterProjection: PROJECTION,
      defaultZoomLevel: 6,
      showLegend: true,
      legendTitle: 'Legend',
      noLegendText: 'None',
      showLayerSwitcher: true,
      showLoadProgress: true,
      maxAsyncLoadCount: 5,
      // Disable panning and zooming
      staticControls: false,
      autoStart: false,
      waitUntilLoaded: false,
      autoReplay: true,
      refreshInterval: 5 * 60 * 1000,
      frameRate: 500,
      showTimeSliderMenu: true,
      endTimeDelay: 1000,
      showTimeSlider: true,
      timeLimitsForced: true,
      timeZone: 'Europe/Helsinki',
      localization: {
        locale: __('en')
      }
    }
  }


    // Add product to layers
    config.layers[layer] = getLayerConfig(product)

  if (product.time) {
    var endTime = product.time.end
    var beginTime = product.time.start
    if (product.time.type === "for") {
      //endTime = product.time.start + (product.time.resolution * defaultSteps)
      endTime = product.time.end
    } else if (product.time.type === "obs") {
      beginTime = product.time.end - (product.time.resolution * defaultSteps)
    }
    config.resolutionTime = getResolution(config)
    config.modifiedResolutionTime = getResolution(config)
    config.defaultAnimationTime = product.time.default
    config.beginTime = beginTime
    config.endTime = endTime
    config.lastDataPointTime = product.time.end
    config.firstDataPointTime = product.time.start
  } 

    


  return config

}

export const getResolution = (config) => {
  var resolution = 300000
  if (config.layers) {
    for (var key in config.layers) {
      if (config.layers[key].resolutionTime) {
        resolution = Math.max(resolution, config.layers[key].resolutionTime)
      }
    }
    return resolution
  } else {
    return NaN
  }
}

export const getLayerConfig = (product) => {
    var sourcecfg = MenuReader.getSource(product.source)

    var layerConfig = {
	className: 'TileWMS',
	title: product.title,
	visible: true,
	opacity: 0.9,
	source: {
	    url: sourcecfg.url,
	    params: {
		'LAYERS': product.layer,
		'TRANSPARENT': 'TRUE',
		'FORMAT': 'image/png'
	    },
	    projection: PROJECTION,
//	    tileGridOptions: {
//		origins: origins1024,
//		extent: EXTENT,
//		resolutions: RESOLUTIONS,
//		tileSize: 1024
//	    }
	},
	'timeCapabilities': sourcecfg.timeCapabilities,
	animation: {
	    hasLegend: true
	}
    }


    if (product.time) {
	layerConfig.type = product.time.type
	layerConfig.firstDataPointTime = product.time.start
	layerConfig.lastDataPointTime =  product.time.end
	layerConfig.resolutionTime = product.time.resolution
    }

    return layerConfig
}


export const notify = (notificationString) => {
  if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(notificationString);
  }else if (Notification.permission !== "denied") {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(notificationString);
      }
    });
  }
}

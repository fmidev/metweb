
import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'
const clonedeep = require('lodash.clonedeep')
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

const defaultSteps = 12;
function setTimeParameters(layers){
  let config = {}
  config.resolutionTime = 300000
  config.modifiedResolutionTime = 300000
  config.firstDataPointTime = Number.MAX_VALUE
  config.lastDataPointTime = 0
  Object.values(layers).forEach((layer) => {
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
  if (config.firstDataPointTime + 36000000 > currentTime) {
    config.firstDataPointTime = Math.ceil(currentTime / config.resolutionTime) * config.resolutionTime
  }
  if (config.firstDataPointTime > currentTime) {
    config.endTime = config.firstDataPointTime + (config.resolutionTime * defaultSteps)
    config.beginTime = config.firstDataPointTime
  } else if (config.lastDataPointTime < currentTime) {
    config.beginTime = config.lastDataPointTime - (config.resolutionTime * defaultSteps)
    config.endTime = config.lastDataPointTime
  } else {
    config.beginTime = (Math.floor(currentTime / config.resolutionTime) * config.resolutionTime) - (config.resolutionTime * (defaultSteps / 2))
    config.endTime = (Math.ceil(currentTime / config.resolutionTime) * config.resolutionTime) + (config.resolutionTime * (defaultSteps / 2))
  }
  config.defaultAnimationTime = config.beginTime
  return config
}

function setMapParameters(windows, config){
  if (windows.getMetOClient(windows.getSelected()) !== undefined) {
    if (windows.getMetOClient(windows.getSelected()).getMap() !== null) {
      config.defaultCenterLocation = windows.getMetOClient(windows.getSelected()).getMap().getView().getCenter()
      config.defaultZoomLevel = windows.getMetOClient(windows.getSelected()).getMap().getView().getZoom()
    }
  }
  return config
}

export let getSelectedWindowConfig = (windows) => {
  var selectedWindowId = windows.getSelected()
  var config = selectedWindowId !== null && selectedWindowId !== undefined ? windows.get(selectedWindowId) : false
  return config;
}
export let setSelectedWindowConfig = (windows, config) => {
  var selectedWindowId = windows.getSelected()
  windows.set(selectedWindowId, config)
}

// Activate product in selected window
export let activateProductInSelectedWindow = (product, windows) => {
  var config = generateConfigForProduct(product.title, product.layer, product.type, product.source, windows)
  setSelectedWindowConfig(windows, config);
}

// Deactivate product in selected window
export const deactivateProductInSelectedWindow = (product, windows) => {
  let map = windows.getMetOClient(windows.getSelected())
  let layers = map.getLayerConfigs()
  let modifiedLayers = []
  layers.forEach(function(layer) {
    if (layer.title !== product.title) {
      modifiedLayers.push(layer)
    }
  })
  let first = setTimeParameters(layers)
  let second = setTimeParameters(modifiedLayers)
  if (map !== undefined && first.firstDataPointTime == second.firstDataPointTime && first.lastDataPointTime == second.lastDataPointTime) {
    map.updateAnimation({
      layers: modifiedLayers,
      firstDataPointTime: second.firstDataPointTime,
      lastDataPointTime: second.lastDataPointTime,
      beginTime: map.getAnimationTimes()[0],
      endTime: map.getAnimationTimes()[map.getAnimationTimes().length - 1],
      timeStep: (map.getAnimationTimes()[map.getAnimationTimes().length - 1] - map.getAnimationTimes()[0]) / (map.getAnimationTimes().length - 1),
    })
  } else {
    map.updateAnimation({
      layers: modifiedLayers,
      firstDataPointTime: second.firstDataPointTime,
      lastDataPointTime: second.lastDataPointTime,
      beginTime: second.beginTime,
      endTime: second.endTime,
      timeStep: second.resolutionTime
    })
  }
}

// Generate MetOClient config object based on the less verbose TOML config
// NOTE: "Append" type function.
// In Metweb terms, _product object_ is _added_ to _currently selected window_.
// In MetOClient terms, _config object_ is _modified_ by appending a _layer_
export const generateConfigForProduct = (title, layer, type, source, windows) => {
  let map = windows.getMetOClient(windows.getSelected())
  var config = windows.get(windows.getSelected())
  var sourcecfg = MenuReader.getSource(source)

  if (!sourcecfg) {
    alert('Missing source information for the product')
    return
  }

  var apiKey = getApiKey()

  var baseUrl = sourcecfg.url
  var wmsBaseUrl = baseUrl + 'wms'

  var currentDate = new Date()
  var currentTime = currentDate.getTime()

  var resolutions = [8192, 4096, 2048, 1024, 512, 256, 128, 64]
  // What is the reason for origins? Removing them doesn't seem to change anything.
  var origins1024 = [[-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]]
  var extent3067 = [-118331.366408356, 6335621.16701424, 875567.731906565, 7907751.53726352]
  var extent3857 = [-20026376.39, -20048966.10, 20026376.39, 20048966.10]

  // {beginTime, endTime, resolutionTime}
  var timeData = Metadata.getTimeDataForLayer(sourcecfg, layer)

  var endTime = timeData.endTime
  var beginTime = timeData.beginTime
  if (beginTime + 36000000 > currentTime) {
    beginTime = Math.ceil(currentTime / timeData.resolutionTime) * timeData.resolutionTime
  }
  if (timeData.type === "for") {
    endTime = beginTime + (timeData.resolutionTime * defaultSteps)
  } else if (timeData.type === "obs") {
    beginTime = endTime - (timeData.resolutionTime * defaultSteps)
  }

  if (config == null) {
    config = {
      project: 'mymap',
      // Layer configuration
      layers: {
        // ---------------------------------------------------------------
        'OpenStreetMap': {
          className: 'OSM',
          title: 'OpenStreetMap',
          preload: Infinity,
          type: 'map',
          animation: {
            hasLegend: false
          }
        },
        'Taustakartta': {
          className: 'WMTS',
          title: 'MML Taustakartta',
          preload: Infinity,
          type: 'map',
          source: {
            matrixSet: 'WGS84_Pseudo-Mercator',
            layer: 'taustakartta',
          },
          tileCapabilities: 'https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts?service=WMTS&request=GetCapabilities&version=1.0.0',
          animation: {
            hasLegend: false
          }
        },
        'Ocean_Basemap': {
          className: 'WMTS',
          title: 'ESRI ArcGIS Ocean Map',
          preload: Infinity,
          type: 'map',
          source: {
            matrixSet: 'GoogleMapsCompatible',
            layer: 'Ocean_Basemap',
          },
          tileCapabilities: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean_Basemap/MapServer/WMTS/1.0.0/WMTSCapabilities.xml',
          animation: {
            hasLegend: false
          }
        },
        'Canvas_World_Dark_Gray_Base': {
          className: 'WMTS',
          title: 'ESRI ArcGIS Dark Gray Basemap',
          preload: Infinity,
          type: 'map',
          source: {
            matrixSet: 'GoogleMapsCompatible',
            layer: 'Canvas_World_Dark_Gray_Base',
          },
          tileCapabilities: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/WMTS/1.0.0/WMTSCapabilities.xml',
          animation: {
            hasLegend: false
          }
        },
        'Canvas_World_Light_Gray_Base': {
          className: 'WMTS',
          title: 'ESRI ArcGIS Light Gray Basemap',
          preload: Infinity,
          type: 'map',
          source: {
            matrixSet: 'GoogleMapsCompatible',
            layer: 'Canvas_World_Light_Gray_Base',
          },
          tileCapabilities: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/WMTS/1.0.0/WMTSCapabilities.xml',
          animation: {
            hasLegend: false
          }
        }
      },
      projection: 'EPSG:3857',
      extent: extent3857,
      resolutions: resolutions,
      defaultCenterLocation: [2750000, 9000000],
      defaultCenterProjection: 'EPSG:3857',
      defaultZoomLevel: 2,
      showLegend: true,
      legendTitle: 'Legend',
      noLegendText: 'None',
      showLayerSwitcher: true,
      showLoadProgress: true,
      maxAsyncLoadCount: 5,
      // Disable panning and zooming
      staticControls: false,
      // Time configuration
      autoStart: false,
      waitUntilLoaded: false,
      autoReplay: true,
      refreshInterval: 5 * 60 * 1000,
      frameRate: 500,
      showTimeSliderMenu: true,
      resolutionTime: timeData.resolutionTime,
      modifiedResolutionTime: timeData.resolutionTime,
      defaultAnimationTime: timeData.startFrame,
      beginTime: beginTime,
      endTime: endTime,
      lastDataPointTime: timeData.endTime,
      firstDataPointTime: timeData.beginTime,
      endTimeDelay: 1000,
      showTimeSlider: true,
      menuTimeSteps: [
        ['5min', 300000],
        ['10min', 600000],
        ['15min', 900000],
        ['30min', 1800000],
        ['1h', 3600000],
        ['3h', 10800000],
        ['6h', 21600000],
        ['12h', 43200000],
        ['24h', 86400000]
      ],
      timeLimitsForced: true,
      timeZone: 'Europe/Helsinki',
      localization: {
        locale: __('en')
      }
    }
  }
  // Add product to layers
  var layerConfig = {
    className: 'TileWMS',
    title: title,
    preload: Infinity,
    visible: true,
    opacity: 1.0,
    type: type || timeData.type,
    firstDataPointTime: timeData.beginTime,
    lastDataPointTime: timeData.endTime,
    resolutionTime: timeData.resolutionTime,
    source: {
      url: wmsBaseUrl,
      params: {
        'LAYERS': layer,
        'TRANSPARENT': 'TRUE',
        'FORMAT': 'image/png'
      },
      projection: 'EPSG:3857',
      tileGridOptions: {
        origins: origins1024,
        extent: extent3857,
        resolutions: resolutions,
        tileSize: 1024
      }
    },
    timeCapabilities: sourcecfg.timeCapabilities,
    animation: {
      hasLegend: true
    }
  }

  let newLayerConfig = {
    'layer': layerConfig
  }
  let first = setTimeParameters([])
  let second = setTimeParameters([])
  let modifiedMap = clonedeep(map)
  let addedLayer = []
  if (map !== undefined) {
    addedLayer = modifiedMap.getLayerConfigs()
    addedLayer.push(layerConfig)
    first = setTimeParameters(map.getLayerConfigs())
    second = setTimeParameters(addedLayer)
  }
  if (map !== undefined && first.firstDataPointTime == second.firstDataPointTime && first.lastDataPointTime == second.lastDataPointTime) {
    map.updateAnimation({
      layersChanged: newLayerConfig,
      firstDataPointTime: second.firstDataPointTime,
      lastDataPointTime: second.lastDataPointTime,
      beginTime: map.getAnimationTimes()[0],
      endTime: map.getAnimationTimes()[map.getAnimationTimes().length - 1],
      timeStep: (map.getAnimationTimes()[map.getAnimationTimes().length - 1] - map.getAnimationTimes()[0]) / (map.getAnimationTimes().length - 1),
    })
  } else if (map !== undefined) {
    map.updateAnimation({
      layersChanged: newLayerConfig,
      firstDataPointTime: second.firstDataPointTime,
      lastDataPointTime: second.lastDataPointTime,
      beginTime: second.beginTime,
      endTime: second.endTime,
      timeStep: second.resolutionTime,
    })
  } else {
    config.layers[layer] = layerConfig
  }
  return config
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

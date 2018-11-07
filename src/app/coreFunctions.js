
import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'

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

// Hekpers: Selected window config getter and setter
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
  var config = generateConfigForProduct(product.title, product.layer, product.type, product.source, windows)
  setSelectedWindowConfig(windows, config);
}

// Deactivate product in selected window
export const deactivateProductInSelectedWindow = (product, windows) => {

  var config = getSelectedWindowConfig(windows)

  if(!config)
    return

  delete config.layers[product.layer]
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
    config.endTime = config.firstDataPointTime + (config.resolutionTime * 24)
    config.beginTime = config.firstDataPointTime
  } else if (config.lastDataPointTime < currentTime) {
    config.beginTime = config.lastDataPointTime - (config.resolutionTime * 24)
    config.endTime = config.lastDataPointTime
  }
  // If config contains only base map, reset time config
  if(Object.keys(config.layers).length == 1){
    var currentDate = new Date()
    var currentTime = currentDate.getTime()
    config.defaultAnimationTime = currentTime
    config.beginTime = currentTime
    config.endTime = currentTime
  }

  setSelectedWindowConfig(windows, config)

}

// Generate MetOClient config object based on the less verbose TOML config
// NOTE: "Append" type function.
// In Metweb terms, _product object_ is _added_ to _currently selected window_.
// In MetOClient terms, _config object_ is _modified_ by appending a _layer_
export const generateConfigForProduct = (title, layer, type, source, windows) => {
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
  var extent3857 = [-500000, 5000000, 5000000, 20000000]

  // {beginTime, endTime, resolutionTime}
  var timeData = Metadata.getTimeDataForLayer(sourcecfg, layer)
  var endTime = timeData.endTime
  var beginTime = timeData.beginTime
  if (timeData.type === "for") {
    endTime = timeData.beginTime + (timeData.resolutionTime * 10)
  } else if (timeData.type === "obs") {
    beginTime = timeData.endTime - (timeData.resolutionTime * 10)
  }

  if (config == null && timeData.type == 'obs') {
    config = {
      project: 'mymap',
      // Layer configuration
      layers: {
        // ---------------------------------------------------------------
        'Taustakartta': {
          className: 'WMTS',
          title: 'Taustakartta',
          type: 'map',
          visible: true,
          opacity: 1.0,
          source: {
            matrixSet: 'ETRS-TM35FIN',
            layer: 'KAP:Europe_basic_EurefFIN',
            format: 'image/png'
          },
          tileCapabilities: '//wms.fmi.fi/fmi-apikey/' + apiKey + '/geoserver/gwc/service/wmts?request=GetCapabilities',
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
    "tileCapabilities": "//wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
    'timeCapabilities': sourcecfg.timeCapabilities,
    animation: {
      hasLegend: true
    }
  }

  config.layers[layer] = layerConfig

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
    config.endTime = config.firstDataPointTime + (config.resolutionTime * 24)
    config.beginTime = config.firstDataPointTime
  } else if (config.lastDataPointTime < currentTime) {
    config.beginTime = config.lastDataPointTime - (config.resolutionTime * 24)
    config.endTime = config.lastDataPointTime
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


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

  var resolutions = [2048, 1024, 512, 256, 128, 64]
  var origins1024 = [[-118331.36640836, 8432773.1670142], [-118331.36640836, 8432773.1670142], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352], [-118331.36640836, 7907751.53726352]]
  var extent = [-118331.366408356, 6335621.16701424, 875567.731906565, 7907751.53726352]

  // {beginTime, endTime, resolutionTime (unimplemented)}
  var timeData = Metadata.getTimeDataForLayer(sourcecfg, layer)

  if (config == null) {

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
          tileCapabilities: 'http://wms.fmi.fi/fmi-apikey/' + apiKey + '/geoserver/gwc/service/wmts?request=GetCapabilities',
          animation: {
            hasLegend: false
          }
        }
      },
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
      maxAsyncLoadCount: 5,
      // Disable panning and zooming
      staticControls: false,
      // Time configuration
      autoStart: false,
      waitUntilLoaded: false,
      autoReplay: true,
      refreshInterval: 5 * 60 * 1000,
      frameRate: 500,
      // resolutionTime: timeData.resolutionTime,
      defaultAnimationTime: timeData.beginTime,
      beginTime: timeData.beginTime,
      endTime: timeData.endTime,
      endTimeDelay: 1000,
      showTimeSlider: true,
      timeZone: 'Europe/Helsinki'
    }

  } else {

    // Update time options

    if (config.beginTime == undefined || config.beginTime > timeData.beginTime)
      config.beginTime = timeData.beginTime
    if (config.endTime == undefined || config.endTime < timeData.endTime)
      config.endTime = timeData.endTime

  }

  // Add product to layers

  var layerConfig = {
    className: 'TileWMS',
    title: title,
    visible: true,
    opacity: 1.0,
    type: type || timeData.type,
    source: {
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
    "tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
    'timeCapabilities': sourcecfg.timeCapabilities,
    animation: {
      hasLegend: true
    }
  }

  config.layers[layer] = layerConfig

  return config

}



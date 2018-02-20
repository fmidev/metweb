
import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'

/* Application core functions */

export const getApiKey = () => {
  if (window.location.search.match(/(\?|&)apikey\=([^&]*)/) == null)
    return APIKEY

  return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2])

}


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


export const getSelectedWindowConfig = (windows) => {
  var selectedWindowId = windows.getSelected();
  var config = windows.get(selectedWindowId)
  return config;
}
export const setSelectedWindowConfig = (windows, config) => {
  var selectedWindowId = windows.getSelected();
  windows.set(selectedWindowId, config)
}


export const addProductToActiveMap = (product, windows) => {

  var config = generateConfigForProduct(product.title, product.layer, product.type, product.source, windows)
  setSelectedWindowConfig(windows, config);

}

export const removeProductFromActiveMap = (product, windows) => {

  var config = getSelectedWindowConfig(windows)
  if(!config)
    return

  delete config.layers[product.layer]

  setSelectedWindowConfig(windows, config)

}

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

  // Resolve correct time resolution from metadata

  var minutes = Metadata.getTimeResolutionForLayer(source, layer)

  if (minutes)
    var resolutionTime = minutes * 60 * 1000
  else
    var resolutionTime = 60 * 60 * 1000

  if (type == 'obs') {
    var beginTime = currentTime - 10 * resolutionTime
    var endTime = currentTime
  } else {
    var beginTime = currentTime
    var endTime = currentTime + 10 * resolutionTime
  }

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
      ignoreObsOffset: 5 * 60 * 1000,
      maxAsyncLoadCount: 5,
      // Disable panning and zooming
      staticControls: false,
      // Time configuration
      autoStart: false,
      waitUntilLoaded: false,
      autoReplay: true,
      refreshInterval: 5 * 60 * 1000,
      frameRate: 500,
//            resolutionTime: resolutionTime,
      defaultAnimationTime: beginTime,
      beginTime: beginTime,
      endTime: endTime,
      endTimeDelay: 1000,
      showTimeSlider: true,
      timeZone: 'Europe/Helsinki'
    }

  } else {

    // Update time options

    if (config.beginTime > beginTime)
      config.beginTime = beginTime
    if (config.endTime < endTime)
      config.endTime = endTime

  }

  // Add product to layers

  var layerConfig = {
    className: 'TileWMS',
    title: title,
    visible: true,
    opacity: 1.0,
    type: type,
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

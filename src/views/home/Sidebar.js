import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'

class Sidebar {

  constructor () {
    this.windows = false
  }

  setWindows (windows) {
    this.windows = windows
  }

  updateProducts () {
    // Now read configuration
    var menu = MenuReader.getMenuJson(this.getApiKey())
    this.updateProductListView(menu)

    Metadata.resolveMetadataForMenu(menu)
  }

  getApiKey () {
    if (window.location.search.match(/(\?|&)apikey\=([^&]*)/) == null)
      return APIKEY

    return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2])

  }

  updateProductListView (menu) {
    var html = ''

    for (var i = 0; i < menu.menu.length; i++) {

      var submenu = menu.menu[i]

      html += '<div class="fmi-metweb-productgroup closed">'
      html += '<div class="fmi-metweb-productgroup-title">' + submenu.title + ' <span class="fmi-metweb-product-count"></span></div>'
      html += '<div class="fmi-metweb-productgroup-list">'

      if (submenu.items.length == 0) {
        html += '<div class="fmi-metweb-productgroup-product">No products</div>'
      } else {
        submenu.items.forEach(function (value, index) {
          var data = ''

          if (value.layer)
            data += ' data-layer="' + value.layer + '"'

          if (value.source)
            data += ' data-source="' + value.source + '"'
          else
            data += ' data-source="' + menu.source[0].name + '"'

          if (value.type)
            data += ' data-type="' + value.type + '"'
          else if (submenu.type)
            data += ' data-type="' + submenu.type + '"'
          else
            data += ' data-type="obs"'

          // Find time interval for layer

          html += '<div class="fmi-metweb-productgroup-product" '
            + data + '><div class="fmi-metweb-product-title">' + value.title
            + '</div><label class="fmi-metweb-switch"><input type="checkbox"><span class="fmi-metweb-slider"></span></label></div>'
        })
      }

      html += '</div></div>'
    }


    $('#fmi-metweb-productgroup-container').html(html)
    $('.fmi-metweb-productgroup-title').on('click', this.toggleProductGroup)

    //$(".fmi-metweb-productgroup-product").on("click", self.addProductToActiveMap);

    var products = document.querySelectorAll('#fmi-metweb-productgroup-container .fmi-metweb-switch')

    for (var i = 0; i < products.length; i++) {

      products[i].addEventListener('change', (e) => {
        if (e.target.checked)
          this.addProductToActiveMap(e)
        else
          this.removeProductFromActiveMap(e)
      })
    }

  }

  updateActiveProducts () {

    var config = this.windows.get(this.windows.getSelected())

    // Config is null if no products

    if (config == null) {
      $('#fmi-metweb-productgroup-container input:checkbox').prop('checked', false)
      $('#fmi-metweb-productgroup-container .fmi-metweb-product-count').html('')
      return
    }

    var keys = Object.keys(config.map.model.layers)

    $('#fmi-metweb-productgroup-container .fmi-metweb-productgroup').each(function () {

      var count = 0

      $(this).find('.fmi-metweb-productgroup-product').each(function () {
        var layer = $(this).data('layer')

        if (keys.indexOf(layer) > -1) {
          $(this).find('input:checkbox').prop('checked', true)
          count++
        } else {
          $(this).find('input:checkbox').prop('checked', false)
        }

      })

      if (count == 0)
        $(this).find('.fmi-metweb-product-count').html('')
      else
        $(this).find('.fmi-metweb-product-count').html('(' + count + ')')

    })

  }

  toggleProductGroup () {
    var $group = $(this).parent('.fmi-metweb-productgroup').first()

    if ($group.hasClass('closed'))
      $group.removeClass('closed').addClass('open')
    else
      $group.removeClass('open').addClass('closed')

  }

  addProductToActiveMap (evt) {

    var parent = $(evt.target).closest('.fmi-metweb-productgroup-product')

    var title = parent.find('.fmi-metweb-product-title').html()
    var layer = parent.data('layer')
    var type = parent.data('type')
    var source = parent.data('source')

    if (!layer)
      return

    var config = this.generateConfigForProduct(title, layer, type, source)

    this.windows.set(this.windows.getSelected(), config)
    this.updateActiveProducts()
  }

  removeProductFromActiveMap (evt) {
    var parent = $(evt.target).closest('.fmi-metweb-productgroup-product')

    var title = parent.find('.fmi-metweb-product-title').html()
    var layer = parent.data('layer')
    var type = parent.data('type')
    var source = parent.data('source')

    if (!layer)
      return

    var config = this.windows.get(this.windows.getSelected())
    delete config.map.model.layers[layer]

    this.windows.set(this.windows.getSelected(), config)
    this.updateActiveProducts()

  }

  generateConfigForProduct (title, layer, type, source) {
    var config = this.windows.get(this.windows.getSelected())

    var sourcecfg = MenuReader.getSource(source)

    if (!sourcecfg) {
      alert('Missing source information for the product')
      return
    }

    var apiKey = this.getApiKey()

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
        // Map view configurations
        map: {
          model: {
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
            }
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
            refreshInterval: 5 * 60 * 1000,
            frameRate: 500,
//            resolutionTime: resolutionTime,
            defaultAnimationTime: beginTime,
            beginTime: beginTime,
            endTime: endTime,
            endTimeDelay: 1000
          },
          view: {
            showTimeSlider: true,
            timeZone: 'Europe/Helsinki'
          }
        }
      }

    } else {

      // Update time options

      if (config.time.model.beginTime > beginTime)
        config.time.model.beginTime = beginTime
      if (config.time.model.endTime < endTime)
        config.time.model.endTime = endTime

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
      //"tileCapabilities": "http://wms.fmi.fi/fmi-apikey/"+apiKey+"/geoserver/gwc/service/wmts?request=GetCapabilities",
      'timeCapabilities': sourcecfg.timeCapabilities,
      animation: {
        beginTime: currentTime,
        hasLegend: true
      }
    }

    config.map.model.layers[layer] = layerConfig

    return config

  }

}

export default (new Sidebar)


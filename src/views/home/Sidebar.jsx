import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'
import React from 'react';
import ReactDOM from 'react-dom';
import { ProductList } from './ProductList.jsx'

export class Sidebar extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      windows: false,
      menu: MenuReader.getMenuJson(this.getApiKey())
    };
    Metadata.resolveMetadataForMenu(this.state.menu)
  }

  componentWillMount(){
    if(this.state.windows){
      try{
        this.updateActiveProducts()
      }catch(e){ /* Some kind of error handling fault in the Layout component produces errors here */ }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ windows: nextProps.windows });
  }

  getApiKey () {
    if (window.location.search.match(/(\?|&)apikey\=([^&]*)/) == null)
      return APIKEY

    return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2])

  }

  updateActiveProducts (){

    // By default everything all products be inactive
    this.state.menu.menu.forEach((menu, menuIndex) => {
      menu.items.forEach((item, itemIndex) => {
          item.active = false
      })
    })
    var config = this.state.windows.get(this.state.windows.getSelected())

    if(!config)
      return

    // After resetting the values to inactive, set active products
    Object.keys(config.layers).forEach((key) => {
      this.state.menu.menu.forEach((menu, menuIndex) => {
        menu.items.forEach((item, itemIndex) => {
          if(key == item.layer){
            item.active = true
          }
        })
      })
    });

  }

  // Received a change event from the lower hierarchy. Add/remove layer from the relevant map
  handleProductStateChange (productComponent) {
    if (!productComponent.props.product.layer || !this.state.windows){
      return
    }
    if(productComponent.state.active){
      this.addProductToActiveMap (productComponent.props.product)
    }else{
      this.removeProductFromActiveMap (productComponent.props.product)
    }
    this.updateActiveProducts()
  }

  addProductToActiveMap (product) {

    var config = this.generateConfigForProduct(product.title, product.layer, product.type, product.source)

    this.state.windows.set(this.state.windows.getSelected(), config)

  }

  removeProductFromActiveMap (product) {

    var config = this.state.windows.get(this.state.windows.getSelected())
    if(!config)
      return

    delete config.layers[product.layer]

    this.state.windows.set(this.state.windows.getSelected(), config)

  }

  generateConfigForProduct (title, layer, type, source) {
    var config = this.state.windows.get(this.state.windows.getSelected())

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

  render(){
    var productLists = [];

    // Build an array of productLists
    if(this.state.menu){

      this.state.menu.menu.forEach((productList, index) => {
        var products = productList.items;
        var title = productList.title ? productList.title : "Untitled"

        // Set product source fallbacks
        products.forEach((product, index) => {
          if(!product.source){
            product.source = this.state.menu.source[0].name
          }
        });
        productLists.push(<ProductList key={'pl'+index} title={title} products={products} onChange={this.handleProductStateChange.bind(this)} />)
      });

    }
    return (
      <div>
        {productLists}
      </div>
    )
  }

}

export default Sidebar

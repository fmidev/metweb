import MenuReader from './MenuReader.js'
import Metadata from './Metadata.js'
import React from 'react';
import ReactDOM from 'react-dom';
import { ProductList } from './ProductList.jsx'

export class Sidebar extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      windows: false,
      menu: MenuReader.getMenuJson(this.getApiKey())
    };
    Metadata.resolveMetadataForMenu(this.state.menu)
  }

  componentDidUpdate(){
    this.updateActiveProducts()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ windows: nextProps.windows }, function(){
      this.updateActiveProducts()
    });
  }

  toggleOpen() {
    const currentState = this.state.open;
    this.setState({ open: !currentState });

  };

  getApiKey () {
    if (window.location.search.match(/(\?|&)apikey\=([^&]*)/) == null)
      return APIKEY

    return decodeURIComponent(window.location.search.match(/(\?|&)apikey\=([^&]*)/)[2])

  }

  updateActiveProducts (){

    if(!this.state.windows){
      return
    }

    try{

      // By default everything all products be inactive
      this.state.menu.menu.forEach((menu, menuIndex) => {
        menu.items.forEach((item, itemIndex) => {
          item.active = false
        })
      })

      // Get config object of selected window. the .get() method uses ID, while .getSelected() returns index
      var selectedWindowId = this.state.windows.getSelected() + 1;
      var config = this.state.windows.get(selectedWindowId)

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

    }catch(e){ /* Most errors here are the Layout component saying findItemById is null */ }

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

    // Build an array of productLists
    var productLists = [];
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
      <div id="fmi-metweb-sidebar" className={this.state.open ? "open" : ""}>
        <div id="fmi-metweb-sidebar-toggle" onClick={this.toggleOpen.bind(this)} >
        </div>

        <div id="fmi-metweb-sidebar-menu">

          <div id="fmi-metweb-sidebar-menu-title">{"Tuotevalikko"}</div>

          <div id="fmi-metweb-sidebar-menu-filters">
            <div className="fmi-metweb-title">{"Filtterit"}</div>

            <div className="fmi-metweb-wrappable-container">
              <div className="fmi-metweb-filter-button">{"Filtteri 1"}</div>
              <div className="fmi-metweb-filter-button">{"Filtteri 2"}</div>
              <div className="fmi-metweb-filter-button">{"Filtteri 3"}</div>
              <div className="fmi-metweb-filter-button">{"Filtteri 4"}</div>
            </div>
          </div>

          <div id="fmi-metweb-productgroup-container">
             {productLists}
          </div>
        </div>
      </div>
    )
  }

}

export default Sidebar

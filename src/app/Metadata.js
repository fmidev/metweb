import WMSCapabilities from 'ol/format/wmscapabilities'
import moment from 'moment'

class Metadata {

  constructor () {
    this.capabilities = {}
  }

  resolveMetadataForMenu (menu, callback) {

    var self = this
    var urls = []
    var namesForUrls = {}

    for (var i = 0; i < menu.source.length; i++) {

      var item = menu.source[i]

      if (item.type !== 'wms')
        continue

      if (item.timeCapabilities)
        var url = item.timeCapabilities
      else
        var url = item.url

      urls.push(url)
      namesForUrls[url] = item.name
    }

    var results = []

    for (var i = 0; i < urls.length; i++) {

      results.push($.ajax({
        url: urls[i],
        beforeSend: function (jqXHR, settings) {
          jqXHR.url = settings.url
        }
      }))
    }

    $.when.apply(this, results).done(function () {

      var parser = new WMSCapabilities()

      for (var i = 0; i < arguments.length; i++) {
        var jqXHR = arguments[i][2]
        var result = parser.read(jqXHR.responseText)

        var name = namesForUrls[jqXHR.url]

        if (result && name) {
          self.capabilities[name] = result
        }
      }
      if(typeof callback === "function"){
        callback();
      }
    }.bind(callback))

  }

  getWMSLayersAsMenuProducts (source) {

    if (!this.capabilities[source]) {
      console.log('not loaded: ' + source)
      alert('Metadata has not loaded yet. Please check the FMI API key and try again.')
      return
    }

    let products = []

    this.capabilities[source].Capability.Layer.Layer.forEach((layer) => {
      products.push({
        title : layer.Title,
        layer : layer.Name,
        source : source
      })
    })

    return products
  }

  getTimeDataForLayer (sourcecfg, layer) {

    if (!this.capabilities[sourcecfg.name]) {
      console.log('not loaded: ' + sourcecfg.name)
      alert('Metadata has not loaded yet. Please check the FMI API key and try again.')
      return
    }

    for (var i = 0; i < this.capabilities[sourcecfg.name].Capability.Layer.Layer.length; i++) {

      var current = this.capabilities[sourcecfg.name].Capability.Layer.Layer[i]

      if (current.Name == layer && typeof current.Dimension !== "undefined") {
        console.log(current);
        for (var n = 0; n < current.Dimension.length; n++) {
          var dimension = current.Dimension[n]

          if (dimension.name == 'time') { console.log(dimension)

            // Prepare generic helper variables
            var timeData = {}
            var currentTime = new Date().getTime()

            // Prepare layer specific helper variables
            var items = dimension.values.split("/")
            var containsInterval = true
            if(items.length==1){ // If delimiter is not slash, the time dimension values are listed explicitly and delimited with comma
              items = dimension.values.split(",")
              containsInterval = false
            }
            var indexOfLastTimeStep = containsInterval ? items.length-2 : items.length-1
            var indexOfFirstTimeStep = Math.max(0, indexOfLastTimeStep - 5)

            // Prepare layer time data
            timeData.resolutionTime = containsInterval ? moment.duration(items[items.length-1]).asMilliseconds() : 60000

            if(moment(items[indexOfLastTimeStep]).valueOf() > currentTime){
              timeData.type = "for" }else{
              timeData.type = "obs" }

            if(containsInterval){
              timeData.beginTime = currentTime - (timeData.type === "obs" ? timeData.resolutionTime * 10 : 0)
              timeData.endTime = currentTime + (timeData.type === "for" ? timeData.resolutionTime * 10 : 0)
            }else{
              timeData.beginTime = moment(items[indexOfFirstTimeStep]).valueOf()
              timeData.endTime = moment(items[indexOfLastTimeStep]).valueOf()
            }

            return timeData;

          }

        }
      }
    }

    return false

  }

}

export default (new Metadata)

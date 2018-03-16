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

          if (dimension.name == 'time') {

            console.log(dimension);

            var items = dimension.values.split("/")
            if(items.length==1)
              items = dimension.values.split(",") // Smartmet has no delimiter convention here?! Most layers have slash but some have comma...

            console.log(items);

            var containsInterval = isNaN(moment(items[items.length-1]).valueOf)

            var indexOfLastTimeStep = containsInterval ? items.length-2 : items.length-1
            var indexOfBeginning = Math.max(0, indexOfLastTimeStep - 5)

            // Validate dates here. It could be due to a mistake above, or due to non-ISO8601 format.
            // If non-ISO8601 dates have to be supported, the format must be found in getCapabilities response
            if(moment(items[indexOfBeginning]).isValid() && moment(items[indexOfLastTimeStep]).isValid()){

              var timeData = {}
              var currentTime = new Date().getTime()

              if(moment(items[indexOfLastTimeStep]).valueOf() > new Date().getTime()){
                timeData.type = "for" }else{
                timeData.type = "obs" }

              timeData.resolutionTime = containsInterval ? moment.duration(items[items.length-1]).asMilliseconds() : 60000

              /*
              timeData.beginTime = moment(items[indexOfBeginning]).valueOf() // Moment will do its best to parse anything, but also throws warnings on weird formats
              timeData.endTime = moment(items[indexOfLastTimeStep]).valueOf()
              }
              */

              timeData.beginTime = currentTime - (timeData.type === "obs" ? timeData.resolutionTime * 10 : 0)
              timeData.endTime = currentTime + (timeData.type === "for" ? timeData.resolutionTime * 10 : 0)
              
              /*
              timeData.beginTime: undefined
              timeData.endTime =  undefined
              }
              */
              return timeData;

            }else{
              console.log("Fishy dates in getCapabilities for layer "+layer);
              return false
            }


          }

        }
      }
    }

    return false

  }

}

export default (new Metadata)

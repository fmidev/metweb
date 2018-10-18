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

        for (var n = 0; n < current.Dimension.length; n++) {
          var dimension = current.Dimension[n]

          if (dimension.name == 'time') {
            var timeData = {}
            var currentTime = new Date().getTime()

            // Try slash and comma delimited values. By WMS standards, slash means implicit timesteps, comma means explicit timesteps.
            var items = dimension.values.split("/")
            if(items.length==1)
              items = dimension.values.split(",")
            // However, to form boolean about explicit/implicit timesteps, moment().isValid() is more robust. See below.

            // If the last item is not a valid date, assume it is a valid duration
            var containsInterval = !moment(items[items.length-1]).isValid()
            // Format and sort explicit timesteps
            var itemsAsMilliseconds = [];
            items.forEach(function(value, index){
              if(!containsInterval || (containsInterval && index != items.length - 1)){
                itemsAsMilliseconds.push(moment(value).valueOf())
              }
            })
            itemsAsMilliseconds.sort(function(a,b){ return a - b })
            // Forecast or observation data?
            if(itemsAsMilliseconds[itemsAsMilliseconds.length - 1] > currentTime){
              timeData.type = "for"
            }else{
              timeData.type = "obs"
            }

            timeData.resolutionTime = containsInterval ? moment.duration(items[items.length-1]).asMilliseconds() : 3600000
            timeData.beginTime = itemsAsMilliseconds[0]
            timeData.endTime = itemsAsMilliseconds[itemsAsMilliseconds.length - 1]
            if (timeData.type === 'for') {
              timeData.startFrame = Math.max(timeData.beginTime, timeData.endTime - (timeData.resolutionTime * 10))
            } else if (timeData.type === 'obs') {
              timeData.startFrame = timeData.beginTime
            } else {
              console.log("ERROR: SOMETHING BAD JUST HAPPENED")
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

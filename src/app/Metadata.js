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

    products = this.getLayers(this.capabilities[source].Capability.Layer.Layer, source, source)
    console.log(products)
    return products
  }


 getLayers(parentlayer, source, category) {
    let products = []
    parentlayer.forEach((layer) => {
	if (Array.isArray(layer.Layer)) {
	    console.log(layer.Title)
	    products = products.concat(this.getLayers(layer.Layer, source, category + '/' + layer.Title))
	} else {
	    products.push(this.getLayerInfo(layer, source, category))
	} 
    })
    return products
  }

  getLayerInfo(layer, source, category) {
      console.log('Title: ' + layer.Title + ' Name: ' + layer.Name + ' Category: ' + source)
      let product = 
      {
        category : category,
        title : layer.Title,
        layer : layer.Name,
        abstract: layer.Abstract,
        source : source
      }
      if (typeof layer.Dimension !== "undefined") {
	  product.time = this.getTimeDimension(layer.Dimension)
      }
      return product
  }

    getTimeDimension(dimensions) {
	//var time = {}
	var beginTime
        var endTime
        var resolutionTime
        var prevtime
	var defaultTime

	dimensions.forEach((dimension) => {
	    if (dimension.name == 'time') {
		defaultTime = dimension.default ? moment(dimension.default).valueOf() : NaN
		dimension.values.split(",").forEach((times) => {
		    var time = times.split("/")
		    // Time dimension is list of times separated by comma
		    if (time.length==1) {
			// begin time is the smallest of listed times
			beginTime = beginTime ? beginTime : moment(time[0]).valueOf()
			beginTime = Math.min(beginTime,moment(time[0]).valueOf())
			// end time is the bigest of listed times
			endTime = endTime ? endTime : moment(time[0]).valueOf()
			endTime = Math.max(endTime,moment(time[0]).valueOf())
			// resolution is the difference of the last two times listed
			resolutionTime = prevtime ? (moment(time[0]).valueOf() - prevtime) : 3600000
			prevtime = moment(time[0]).valueOf()
		    }
		    // Time dimension is starttime/endtime/period
		    else if (time.length==3) {
			beginTime = moment(time[0]).valueOf()
			endTime = moment(time[1]).valueOf()
			resolutionTime = moment.duration(time[2]).asMilliseconds()
		    }
		}) // forEach
	    } // if
	}) // forEach
        var currentTime = new Date().getTime()
	var type = endTime > currentTime ? "for" : "obs"
        console.log("start: "+beginTime+" end: "+endTime+" resolution: "+resolutionTime+" type: "+type+" default: " + defaultTime)
	return {start: beginTime, end: endTime, resolution: resolutionTime, type: type, default: defaultTime}
    }

}

export default (new Metadata)


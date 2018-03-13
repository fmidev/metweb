import Metadata from './Metadata.js'

var menufiles = {}

function importAll (r) {
  r.keys().forEach(key => menufiles[key] = r(key))
}

importAll(require.context('../assets/conf', true, /\.toml$/))

String.prototype.replaceAll = function (search, replacement) {
  var target = this
  return target.replace(new RegExp(search, 'g'), replacement)
}

class MenuReader {

  constructor () {
    this.menu = {}
  }

  setMenuJson(apikey, callback){

    // Read main menu
    var toml = require('toml')

    try {
      var menucfg = menufiles['./menu.toml']

      // Replace apikey if given
      if (apikey)
        menucfg = menucfg.replaceAll('{APIKEY}', apikey)

      var data = toml.parse(menucfg)

      var tomlMenu = false;
      if(tomlMenu) {

        // Read sub menus
        for (var i = 0; i < data.menu.length; i++) {

          try {
            var items = toml.parse(menufiles['./' + data.menu[i].file])
            data.menu[i].items = items.item
            data.menu[i].error = false
          } catch (e) {
            data.menu[i].error = true
            data.menu[i].items = []
          }

        }

        this.menu = data
        Metadata.resolveMetadataForMenu(data)

      } else {

        // Clear manually configured menu
        data.menu = []
        this.menu = data

        // Read sub menus
        Metadata.resolveMetadataForMenu(data, function(){

          this.menu.source.forEach((source) => {

            switch (source.server){
              case "smartmet":
              case "geoserver":
              default:
                this.menu.menu.push( {
                  title : source.name,
                  items : Metadata.getWMSLayersAsMenuProducts(source.name)
                } );
            }

          })

          if(typeof callback === "function"){
            callback()
          }

        }.bind(this, callback))
      }

    } catch (e) {
      // Error
    }

  }

  getMenuJson () {

    return this.menu

  }

  getSource (name) {

    for (var i = 0; i < this.menu.source.length; i++) {
      if (this.menu.source[i].name == name)
        return this.menu.source[i]
    }

    return false

  }

}

export default (new MenuReader)

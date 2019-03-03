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

            let sourceItems = Metadata.getWMSLayersAsMenuProducts(source.name);

            switch (source.server){

              case "smartmet":
                sourceItems.forEach((item) => {
                  let layerCategorisation = item.layer.split(":")
                  let parentTitle = layerCategorisation.length > 2 ?
                                      layerCategorisation[0]+":"+layerCategorisation[1] // Layer is at least two folders deep
                                      :
                                      layerCategorisation.length > 1 ?
                                        layerCategorisation[0] // Layer is just one folder deep
                                        :
                                        "Ryhmittelemätön ("+item.source+")" // Layer has no folder
                  let parentIdx = this.menu.menu.findIndex(function(m){ return m.title === parentTitle })
                  if( parentIdx === -1 ){
                    this.menu.menu.push({
                      title : parentTitle,
                      items: []
                    })
                    parentIdx = this.menu.menu.length - 1
                  }
                  this.menu.menu[parentIdx].items.push(item);
                })
                break;

              case "geoserver":
                sourceItems.forEach((item) => {
                  let layerCategorisation = item.layer.split(":")
                  let parentTitle = layerCategorisation.length > 1 ?
                                      layerCategorisation[0] // Layer is in a workspace
                                      :
                                      "Ryhmittelemätön ("+item.source+")" // Layer has no workspace
                  let parentIdx = this.menu.menu.findIndex(function(m){ return m.title === parentTitle })
                  if( parentIdx === -1 ){
                    this.menu.menu.push({
                      title : parentTitle,
                      items: []
                    })
                    parentIdx = this.menu.menu.length - 1
                  }
                  this.menu.menu[parentIdx].items.push(item);
                })
                break;

              case "generic":
                sourceItems.forEach((item) => {
                  let parentTitle = item.category
                  let parentIdx = this.menu.menu.findIndex(function(m){ return m.title === parentTitle })
                  if( parentIdx === -1 ){
                    this.menu.menu.push({
                      title : parentTitle,
                      items: []
                    })
                    parentIdx = this.menu.menu.length - 1
                  }
                  this.menu.menu[parentIdx].items.push(item);
                })
                break;

              default:
                this.menu.menu.push( {
                  title : source.name,
                  items : sourceItems
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

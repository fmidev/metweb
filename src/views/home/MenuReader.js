var menufiles = {};

function importAll (r) {
  r.keys().forEach(key => menufiles[key] = r(key));
}

importAll(require.context("../../assets/conf", true, /\.toml$/));

class MenuReader {
	
	constructor() {}
	
	getMenuJson(apikey) {
				
		// Read main menu
		
		var toml = require('toml');
		
		try {
			var menucfg = menufiles["./menu.toml"];
			
			// Replace apikey if given
			
			if (apikey)
				menucfg = menucfg.replace("{APIKEY}", apikey);
			
			var data = toml.parse(menucfg);
		} catch(e) {
			return false;
		}		

		// Read sub menus	
		
		for(var i=0; i<data.menu.length; i++) {			
			
			try {
				var items = toml.parse(menufiles["./"+data.menu[i].file]);
				data.menu[i].items = items.item;
				data.menu[i].error = false;
			} catch(e) {
				data.menu[i].error = true;
				data.menu[i].items = [];
			}
			
		}
		
		return data;
		
	}
	
}

export default (new MenuReader);
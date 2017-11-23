import WMSCapabilities from 'ol/format/wmscapabilities';

class Metadata {
	
	constructor() {
		this.capabilities = {};
	}
	
	resolveMetadataForMenu(menu) {
		
		var parser = new WMSCapabilities();
		var self = this;
		
		for(var i=0; i < menu.metadata.length; i++) {
			
			var item = menu.metadata[i];
			
			if (item.type !== "GetCapabilities")
				continue;
			
			fetch(item.url).then(function(response) {
				return response.text();
			}).then(function(text) {
		      	var result = parser.read(text);
				self.capabilities[item.name] = result;
		  	});

		}
	}
	
	getTimeResolutionForLayer(metadata, layer) {
			
		if (!this.capabilities[metadata]) {
			alert("Metadata has not loaded yet. Please try again.");
			return;
		}
		
		for(var i=0; i<this.capabilities[metadata].Capability.Layer.Layer.length; i++) {
			
			var current = this.capabilities[metadata].Capability.Layer.Layer[i];
			
			if (current.Name==layer) {
				
				for(var n=0; n<current.Dimension.length; n++) {
					var dimension = current.Dimension[n];
					
					if (dimension.name=="time") {
						var items = dimension.values.split("/"); 
						var duration = this.convertDuration(items[2]);
						return parseInt(duration.H)*60+parseInt(duration.M);
					}
					
				}
				
			}
		}
		
		return false;
		
	}
	
	convertDuration(t) { 
		// From: http://jsfiddle.net/zu8kL/1/	
		//dividing period from time
		var	x = t.split('T'),
			duration = '',
			time = {},
			period = {},
			//just shortcuts
			s = 'string',
			v = 'variables',
			l = 'letters',
			// store the information about ISO8601 duration format and the divided strings
			d = {
				period: {
					string: x[0].substring(1,x[0].length),
					len: 4,
					// years, months, weeks, days
					letters: ['Y', 'M', 'W', 'D'],
					variables: {}
				},
				time: {
					string: x[1],
					len: 3,
					// hours, minutes, seconds
					letters: ['H', 'M', 'S'],
					variables: {}
				}
			};
		//in case the duration is a multiple of one day
		if (!d.time.string) {
			d.time.string = '';
		}

		for (var i in d) {
			var len = d[i].len;
			for (var j = 0; j < len; j++) {
				d[i][s] = d[i][s].split(d[i][l][j]);
				if (d[i][s].length>1) {
					d[i][v][d[i][l][j]] = parseInt(d[i][s][0], 10);
					d[i][s] = d[i][s][1];
				} else {
					d[i][v][d[i][l][j]] = 0;
					d[i][s] = d[i][s][0];
				}
			}
		} 
		period = d.period.variables;
		time = d.time.variables;
		time.H += 	24 * period.D + 
								24 * 7 * period.W +
								24 * 7 * 4 * period.M + 
								24 * 7 * 4 * 12 * period.Y;
		
		if (time.H) {
			duration = time.H + ':';
			if (time.M < 10) {
				time.M = '0' + time.M;
			}
		}

		if (time.S < 10) {
			time.S = '0' + time.S;
		}

		duration += time.M + ':' + time.S;

		return time;

	}
	
	
}

export default (new Metadata);
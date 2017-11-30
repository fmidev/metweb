import WMSCapabilities from 'ol/format/wmscapabilities';

class Metadata {
	
	constructor() {
		this.capabilities = {};
	}
	
	resolveMetadataForMenu(menu) {
		
		var self = this;
		var urls = [];
		var namesForUrls = {};
		
		for(var i=0; i < menu.source.length; i++) {
			
			var item = menu.source[i];
			
			if (item.type !== "wms")
				continue;
							
			if (item.timeCapabilities)
				var url = item.timeCapabilities
			else
				var url = item.url;
		
			urls.push(url);
			namesForUrls[url] = item.name;			
		}	
	
		var results = [];
		
		for(var i=0; i<urls.length; i++) {
			
			results.push($.ajax( {
				url:urls[i],
				beforeSend: function(jqXHR, settings) {
					jqXHR.url = settings.url;
    			}
    		}));
		}
		
		$.when.apply(this, results).done(function() {
			
			var parser = new WMSCapabilities();
			
			for(var i=0;i<arguments.length;i++){			
		    	var jqXHR = arguments[i][2];
		      	var result = parser.read(jqXHR.responseText);
		      	
		      	var name = namesForUrls[jqXHR.url];
			 
		      	if (result && name) {
		      		console.log(name);
		      		self.capabilities[name] = result;
		        }
		   	}
		});
	
	}
		
	getTimeResolutionForLayer(source, layer) {
			
		if (!this.capabilities[source]) {		
			console.log("not loaded: "+source);
			alert("Metadata has not loaded yet. Please try again.");
			return;
		}
		
		for(var i=0; i<this.capabilities[source].Capability.Layer.Layer.length; i++) {
			
			var current = this.capabilities[source].Capability.Layer.Layer[i];
			
			if (current.Name==layer) {
				
				for(var n=0; n<current.Dimension.length; n++) {
					var dimension = current.Dimension[n];
					
					if (dimension.name=="time") {
						var items = dimension.values.split("/");
						
						// This one is returned when timesteps are listed, not interval (for example some satellite layers)
						
						if (items.length==1)
							return 30;
												 
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
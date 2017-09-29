/**
 * Application entry point
 */

// Load application styles
import './home.less';
// Load temporarily from tmp directory
import * as mapWindows from '../../tmpLib/mapWindows';

// ================================
// START YOUR APP HERE
// ================================


// Some initial testing. Will be added to own class soon.

$(document).ready(function() {

	$(".fmi-metweb-productgroup-title").on("click", toggleProductGroup);
	$("#fmi-metweb-sidebar").on("click", toggleSidebar);
	$(".fmi-metweb-filter-button").on("click", toggleFilter);

	/*
	mapWindows.get(index)
	Get a MetOClient object from a windows collection location specified by `index`.

	mapWindows.push(config)
	Push a new MetOClient object defined by MetOClient configuration object `config` to the end of windows collection.

	mapWindows.set(index, config)
	Set a new MetOClient object defined by MetOClient configuration object `config` to the windows collection location specified by `index`.

	mapWindows.unset(index)
	Remove a MetOClient object from a windows collection location specified by `index`.
	*/

});

function toggleSidebar() {
	if ($("#fmi-metweb-sidebar-menu").is(":visible")) {
        $("#fmi-metweb-sidebar-menu").css("display", "none");
		$("#fmi-metweb-windows").css("width", "100%");
    } else {
		$("#fmi-metweb-sidebar-menu").css("display", "flex");
		$("#fmi-metweb-windows").width(function(i, w) {
			return w - 270;
		});
    }
}

function toggleProductGroup() {
	
	var $group = $(this).parent(".fmi-metweb-productgroup").first();
	
	if ($group.hasClass("closed"))
		$group.removeClass("closed").addClass("open");
	else
		$group.removeClass("open").addClass("closed");
	
}

function toggleFilter() {
	
	if ($(this).hasClass("selected"))
		$(this).removeClass("selected");
	else
		$(this).addClass("selected");	
	
}

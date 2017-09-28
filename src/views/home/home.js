/**
 * Application entry point
 */

// Load application styles
import './home.less';

// ================================
// START YOUR APP HERE
// ================================


// Some initial testing. Will be added to own class soon.

$(document).ready(function() {

	$(".fmi-metweb-productgroup-title").on("click", toggleProductGroup);
	$("#fmi-metweb-sidebar").on("click", toggleSidebar);
	$(".fmi-metweb-filter-button").on("click", toggleFilter);

});

function toggleSidebar() {
	
	if ($("#fmi-metweb-sidebar-menu").is(":visible"))
		$("#fmi-metweb-sidebar-menu").css("display", "none");
	else
		$("#fmi-metweb-sidebar-menu").css("display", "flex");	
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

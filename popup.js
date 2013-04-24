$(function () {
	chrome.tabs.getSelected(null, function(tab){
		chrome.tabs.executeScript(tab.id, {code: 'getXpath();'});
	});

	var xpathInput = $('#xpath');
	xpathInput.focus();

	$('form').bind('submit', function () {
		chrome.tabs.getSelected(null, function(tab){
			chrome.tabs.executeScript(tab.id, {code: 'find("' + xpathInput.val() + '");'});
		});
		return false;
	});
});
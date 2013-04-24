chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.getSelected(null, function(tab){
		chrome.tabs.executeScript(tab.id, {code: 'init();'});
	});
});
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(null, {
		code: 'init()'
	});
});

chrome.commands.onCommand.addListener(function(command) {
	if (command == 'toggle-sidebar') {
		chrome.tabs.executeScript({
			code: 'toggleSidebar()'
		});
	} else if (command == 'input-autocomplete') {
		chrome.tabs.executeScript({
			code: 'inputAutocomplete()'
		});
	}
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	chrome.tabs.executeScript(null, {
		code: 'currentSelection = "' + info.selectionText + '"; findXPath()'
	});
});

chrome.contextMenus.create({
	id: 'getXPath',
	title: 'Get unique XPath',
	contexts: ['selection']
});
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript({
		code: 'init()'
	});
});

chrome.commands.onCommand.addListener(function(command) {
	if (command == 'toggle-sidebar') {
		chrome.tabs.executeScript({
			code: 'toggleSidebar()'
		});
	} else if (command == 'expand-shortcut') {
		chrome.tabs.executeScript({
			code: 'inputAutocomplete()'
		});
	}
});

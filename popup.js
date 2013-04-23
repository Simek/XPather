$(function() {
	$("form").bind("submit", function(){
		chrome.tabs.executeScript(null, {file: "jquery.js"}, function() {
			chrome.tabs.executeScript(null, {file: "jquery.xpath.js"}, function() {
				chrome.tabs.executeScript(null, {file: "xpather.js"}, function() {
					chrome.tabs.executeScript(null, {code: "find(\"" + $("#xpath").val() + "\");"});
				});
			});
		});
		return false;
	});
});
$(function () {
	$("#xpath").focus();

	$("form").bind("submit", function () {
		chrome.tabs.getSelected(null, function(tab){
			chrome.tabs.executeScript(tab.id, {code: "find(\"" + $("#xpath").val() + "\");"});
		});
		return false;
	});
});
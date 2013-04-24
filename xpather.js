var resultBoxNode = $('<div/>').attr('id', 'xpather-result').hide();
$('body').append(resultBoxNode);

var previousMatched = [];
var resultBox = $('#xpather-result')

function find(xpath) {
	if (previousMatched.length != 0) {
		$.each(previousMatched, function (key, value) {
			$(value).removeClass('xpather-highlight');
		});
	}

	var result = $.xpath(xpath);
	if (result.selector == "invalid") {
		resultBox.addClass("no-results").text("Invalid XPath");
	} else {
		previousMatched = result;
		if (result.length != 0) {
			$.each(result, function (key, value) {
				$(value).addClass('xpather-highlight');
			});
			resultBox.removeClass("no-results").text(result.length);
			console.log(result);
		} else {
			resultBox.addClass("no-results").text("No results");
		}
	}
	resultBox.show();
}
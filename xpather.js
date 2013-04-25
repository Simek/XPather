var previousMatched = [];

var body = $('body');
body.append($('<div id="xpather"><form id="xpather-form"><input id="xpather-xpath" type="text" /></form><div id="xpather-result"></div></div>').hide());

var xpather = $('#xpather');
var resultBox = $('#xpather-result');
var xpathInput = $('#xpather-xpath');
var xpathForm = $('#xpather-form');

function init() {
	if (xpather.is(":visible") == false) {
		body.css('margin-top', '50px');
		xpather.show();
		xpathInput.focus();
		xpathForm.bind('submit', function () {
			find(xpathInput.val());
			return false;
		});
	} else {
		body.css('margin-top', '0');
		xpather.hide();
		clearHighlight(previousMatched);
	}
}

function find(xpath) {
	if (previousMatched.length != 0) {
		clearHighlight(previousMatched);
	}

	var result = $.xpath(xpath);
	if (result.selector == 'invalid') {
		resultBox.addClass('no-results').text('Invalid XPath');
	} else {
		previousMatched = result;
		if (result.length != 0) {
			$.each(result, function (key, value) {
				$(value).addClass('xpather-highlight');
			});
			resultBox.removeClass('no-results').text(result.length);
			console.log(result);
		} else {
			resultBox.addClass('no-results').text('No results');
		}
	}
	resultBox.show();
}

function clearHighlight(nodes) {
	$.each(nodes, function (key, value) {
		$(value).removeClass('xpather-highlight');
	});
	$('*[class=""]').removeAttr('class');
}
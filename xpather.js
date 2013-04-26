var xpatherHTML = '\
	<div id="xpather">\
		<form id="xpather-form">\
			<input id="xpather-xpath" type="text" />\
		</form> \
		<div id="xpather-result"></div>\
		<div id="xpather-sidebar-toggler"></div>\
		</div>\
	<div id="xpather-sidebar"></div>'

var previousMatched = [];

var body = $('body');
body.append(xpatherHTML);

var xpather = $('#xpather');
var resultBox = $('#xpather-result');
var xpathInput = $('#xpather-xpath');
var xpathForm = $('#xpather-form');
var sidebar = $('#xpather-sidebar');
var sidebarToggler = $('#xpather-sidebar-toggler');

function init() {
	body.toggleClass('xpather-on');
	if (xpather.is(":visible") == false) {
		xpather.show();
		xpathInput.focus();
		xpathForm.bind('submit', function () {
			find(xpathInput.val());
			return false;
		});
		sidebarToggler.bind('click', function () {
			body.toggleClass('xpather-sidebar-on');
			sidebarToggler.toggleClass('xpather-sidebar-toggler-active');
			sidebar.toggle();
			return false;
		});
	} else {
		xpather.hide();
		sidebar.hide();
		body.removeClass('xpather-sidebar-on');
		clearHighlight(previousMatched);
	}
}

function find(xpath) {
	if (previousMatched.length != 0) {
		sidebar.empty();
		clearHighlight(previousMatched);
	}

	var result = $.xpath(xpath);
	if (result.selector == 'invalid') {
		resultBox.addClass('no-results').text('Invalid XPath');
	} else {
		previousMatched = result;
		if (result.length != 0) {
			$.each(result, function (key, value) {
				var node = $(value);
				node.addClass('xpather-highlight');
				if(node.text().length != 0) {
					sidebar.append($('<div class="xpather-sidebar-entry" />').text(getNodeText(node)));
				} else {
					sidebar.append($('<div class="xpather-sidebar-entry xpather-sidebar-entry-empty" />').text("EMPTY NODE"));
				}
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

function getNodeText(node) {
	return $.trim(node.text().replace(/ +(?= )/g,' '));
}
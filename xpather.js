var xpatherHTML = '\
	<div id="xpather">\
		<form id="xpather-form">\
			<input id="xpather-xpath" type="text" autocomplete="off" />\
		</form> \
		<div id="xpather-result"></div>\
		<div id="xpather-sidebar-toggler"></div>\
	</div>\
	<div id="xpather-sidebar">\
		<div id="xpather-sidebar-spacer"></div>\
		<div id="xpather-sidebar-entries"></div>\
	</div>';

var previousMatched = [];
var sidebarVisible = false;

var doc = $(document);
var body = $('body');
body.append(xpatherHTML);

var xpather = $('#xpather');
var resultBox = $('#xpather-result');
var xpathInput = $('#xpather-xpath');
var xpathForm = $('#xpather-form');
var sidebar = $('#xpather-sidebar');
var sidebarEntries = $('#xpather-sidebar-entries');
var sidebarToggler = $('#xpather-sidebar-toggler');

function init() {
	body.toggleClass('xpather-on');
	if (xpather.is(':visible') == false) {
		xpather.show();
		chrome.storage.local.get('sidebarVisible', function (data) {
			if (data.sidebarVisible) {
				toggleSidebar();
			}
		});
		xpathInput.focus();
		xpathForm.on('submit', function () {
			find();
			return false;
		});
		sidebarToggler.click(function () {
			toggleSidebar();
		});
		doc.keydown(function (e) {
			if (e.altKey && e.shiftKey) {
				toggleSidebar();
			}
		});
		xpathInput.keyup(function (e) {
			if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
				if (xpathInput.val() != 0) {
					if (e.keyCode == 13) {
						clearTimeout(xpathInput.data('timer'));
						find();
					} else {
						findWithDelay();
					}
				}
			}
		})
	} else {
		chrome.storage.local.set({sidebarVisible: sidebar.is(':visible') ? true : false});
		sidebar.hide();
		xpather.hide();
		body.removeClass('xpather-sidebar-on');
		sidebarToggler.removeClass('xpather-sidebar-toggler-active')
		sidebarToggler.off();
		xpathInput.off();
		doc.off();
		clearHighlight();
	}
}

function find() {
	if (previousMatched.length != 0) {
		sidebarEntries.empty();
		clearHighlight();
	}

	var xpath = xpathInput.val();
	var result = $.xpath(xpath);

	if (result.selector == 'invalid') {
		resultBox.addClass('no-results').text('Invalid XPath');
	} else {
		previousMatched = result;
		if (result.length != 0) {
			$.each(result, function (index, element) {
				var node = $(element);
				if (node[0].nodeName == '#text') {
					node.wrap('<bdi class="xpather-text-hightlight"/>')
				} else {
					node.addClass('xpather-highlight');
				}
				sidebarEntries.append(createSidebarEntry(index, node));
			});
			resultBox.removeClass('no-results').text(result.length);
		} else {
			resultBox.addClass('no-results').text('No results');
		}
	}
	resultBox.show();
}

function findWithDelay() {
	var delay = 700;

	clearTimeout(xpathInput.data('timer'));
	xpathInput.data('timer', setTimeout(function () {
		xpathInput.removeData('timer');
		find();
	}, delay));
}

function createSidebarEntry(index, node) {
	var entry = $('<div class="xpather-sidebar-entry" />');
	var nodeText = node.text().trim();

	if (nodeHasOnlyImage(node) && nodeText.length == 0) {
		entry.text("IMAGE ONLY").wrapInner('<span/>');
		entry.addClass('xpather-sidebar-entry-info');
	} else if (nodeText.length != 0) {
		entry.text(getNodeText(node)).wrapInner('<span/>');
	} else if (!/\S/.test(nodeText)) {
		entry.text("WHITESPACE ONLY").wrapInner('<span/>');
		entry.addClass('xpather-sidebar-entry-info');
	} else {
		entry.text("EMPTY NODE").wrapInner('<span/>');
		entry.addClass('xpather-sidebar-entry-info');
	}
	entry.append('<div class="xpather-sidebar-entry-count">' + (index + 1) + '</div>');

	entry.click(function () {
		body.animate({
			scrollTop: getSafeOffset(node)
		}, 750);
		clearImportantHighlight();
		node.addClass('xpath-important-highlight');
	});

	return entry;
}

function toggleSidebar() {
	body.toggleClass('xpather-sidebar-on');
	sidebarToggler.toggleClass('xpather-sidebar-toggler-active');
	sidebar.toggle();
}

function clearHighlight() {
	clearImportantHighlight();
	unwrapMatchedText();
	$.each(previousMatched, function (index, element) {
		$(element).removeClass('xpather-highlight');
	});
	$('*[class=""]').removeAttr('class');
}

function clearImportantHighlight() {
	$('.xpath-important-highlight').removeClass('xpath-important-highlight');
}

function unwrapMatchedText() {
	$('.xpather-text-hightlight').each(function(index, element) {
		$(element).replaceWith($(element).text());
	});
}

function nodeHasOnlyImage(node) {
	if (node.children().length != 0) {
		var hasOnlyImage = true;
		node.children().each(function(index, element) {
			if ($(element).prop('tagName').toLowerCase() != 'img') {
				return false;
			}
		})
		return hasOnlyImage;
	} else {
		return false;
	}
}

function getSafeOffset(node) {
	var offsetTop = node.offset().top;
	return  offsetTop < 150 ? 0 : offsetTop - 150;
}

function getNodeText(node) {
	return $.trim(node.text().replace(/ +(?= )/g, ' '));
}
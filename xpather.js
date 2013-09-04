var xpatherHTML = '\
	<xpather id="xpather">\
		<form id="xpather-form">\
			<input id="xpather-xpath" type="text" placeholder="enter XPath…" autocomplete="off" />\
		</form> \
		<xpather id="xpather-result"></xpather>\
		<xpather id="xpather-sidebar-toggler"></xpather>\
	</xpather>\
	<xpather id="xpather-sidebar">\
		<xpather id="xpather-sidebar-spacer"></xpather>\
		<xpather id="xpather-sidebar-entries"></xpather>\
	</xpather>';

var previousMatched = [];
var sidebarVisible = false;

var functionsWithShortcuts = {
	'sw': ['starts-with'],
	'co': ['contains'],
	'ew': ['ends-with'],
	'uc': ['upper-case'],
	'lc': ['lower-case'],
	'no': ['not']
}

var selectorsWithShortcuts = {
	'@c': ['class'],
	'@i': ['id'],
	'@t': ['title'],
	'@s': ['style'],
	'@h': ['href']
}

var tagsWithShortcuts = {
	'd': ['div'],
	's': ['span']
}

var doc = $(document);
var body = $('body');
var html = $('html');

if(isDocumentValid()) {
	html.append(xpatherHTML);
	var xpather = $('#xpather'); 
	var resultBox = $('#xpather-result');
	var xpathInput = $('#xpather-xpath');
	var xpathForm = $('#xpather-form');
	var sidebar = $('#xpather-sidebar');
	var sidebarEntries = $('#xpather-sidebar-entries');
	var sidebarToggler = $('#xpather-sidebar-toggler');
}

function init() {
	if(isDocumentValid()) {
		html.toggleClass('xpather-on');
		if (xpather.is(':visible') == false) {
			xpather.show();
			correctFixedNodes();
			chrome.storage.local.get('sidebarVisible', function (data) {
				if (data.sidebarVisible) {
					toggleSidebar();
				}
			});
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
			xpathInput.keydown(function (e) {
				if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
					if (xpathInput.val() != 0) {
						if (e.keyCode == 13) {
							clearTimeout(xpathInput.data('timer'));
							find();
						} else {
							findWithDelay();
						}
					}
				} else if (e.ctrlKey && e.keyCode == 32) {
					inputAutocomplete();
					findWithDelay();
					return false;
				} else if (e.ctrlKey && (e.keyCode == 86 || e.keyCode == 88 || e.keyCode == 90)) {
					findWithDelay();
				}
			});
			xpathInput.focus();
			if (xpathInput.val() != 0) {
				find();
			}
		} else {
			chrome.storage.local.set({sidebarVisible: sidebar.is(':visible')});
			sidebar.hide();
			xpather.hide();
			html.removeClass('xpather-sidebar-on');
			sidebarToggler.removeClass('xpather-sidebar-toggler-active')
			sidebarToggler.off();
			xpathInput.off();
			doc.off();
			clearHighlight();
		}
	}
}

function isDocumentValid() {
	var pathname = window.location.pathname.split('.');
	var fileExtension = pathname[pathname.length - 1];
	if (window.location.protocol == 'file:') {
		if (fileExtension != 'html') {
			return false;
		}
	}
	return true;
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
				var type = defineElementType(node);
				switch(type) {
					case "node":
						node.addClass('xpather-highlight');
						break;
					case "text":
						node.wrap('<xpather class="xpather-text-hightlight"/>')
						break;
				}
				sidebarEntries.append(createSidebarEntry(index, node, type));
			});
			resultBox.removeClass('no-results').text(result.length);
		} else {
			resultBox.addClass('no-results').text('No results');
		}
	}
	resultBox.show();
}

function defineElementType(node) {
	var nodeType = node[0].nodeType;
	if (nodeType == 1) {
		return "node";
	} else if (nodeType == 2) {
		return "attr";
	} else if (nodeType == 3) {
		return "text";
	} else {
		return "other";
	}
}

function findWithDelay() {
	var delay = 400;

	clearTimeout(xpathInput.data('timer'));
	xpathInput.data('timer', setTimeout(function () {
		xpathInput.removeData('timer');
		find();
	}, delay));
}

function createSidebarEntry(index, node, type) {
	var entry = $('<div class="xpather-sidebar-entry" />');
	if (type == "attr") {
		entry.text(node[0].value).wrapInner('<span/>');
		entry.addClass('xpather-sidebar-entry-attribute');
	} else {
		var nodeText = node.text().trim();

		if (nodeHasOnlyImage(node) && nodeText.length == 0) {
			entry.text('IMAGE ONLY').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		} else if (nodeText.length != 0) {
			entry.text(getNodeText(node)).wrapInner('<span/>');
		} else if (!/\S/.test(nodeText)) {
			entry.text('WHITESPACE ONLY').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		} else {
			entry.text('EMPTY NODE').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		}

		entry.click(function() {
			body.animate({
				scrollTop: getSafeOffset(node)
			}, 750);
			clearImportantHighlight();
			node.addClass('xpath-important-highlight');
		});
	}
	entry.append('<div class="xpather-sidebar-entry-count">' + (index + 1) + '</div>');

	return entry;
}

function toggleSidebar() {
	html.toggleClass('xpather-sidebar-on');
	sidebarToggler.toggleClass('xpather-sidebar-toggler-active');
	sidebar.toggle();
}

function clearHighlight() {
	correctFixedNodes();
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
	$('.xpather-text-hightlight').each(function (index, element) {
		$(element).replaceWith($(element).text());
	});
}

function nodeHasOnlyImage(node) {
	var allChildren = node.find('*');
	if (allChildren.length != 0) {
		var hasOnlyImage = true;
		allChildren.each(function (index, element) {
			if ($(element).prop('tagName').toLowerCase() != 'img') {
				hasOnlyImage = false;
			}
		});
		return hasOnlyImage;
	}
	return false;
}

function getSafeOffset(node) {
	var offsetTop = node.offset().top;
	return offsetTop < 150 ? 0 : offsetTop - 150;
}

function getNodeText(node) {
	return $.trim(node.text().replace(/ +(?= )/g, ' '));
}

function inputAutocomplete() {
	var xpath = xpathInput.val();
	var caretPosition = xpathInput.caret();
	var xpathParts = xpath.substring(0, caretPosition).split('[');
	var keyword = getKeyword(xpathParts);
	var caretPositionOffset = 2;

	if (keyword.substring(0, keyword.length - 1) == '@') {
		$.each(selectorsWithShortcuts, function (shortcut, selectorName) {
			if (keyword == shortcut) {
				extendShortcut("@{0}='']", selectorName);
			}
		});
	} else {
		$.each(functionsWithShortcuts, function (shortcut, functionName) {
			if (keyword == shortcut) {
				extendShortcut("{0}()]", functionName);
			}
		});
	}

	if (!isXPathModified()) {
		xpathParts = xpath.substring(0, caretPosition).split('(');
		keyword = getKeyword(xpathParts);
		$.each(selectorsWithShortcuts, function (shortcut, selectorName) {
			if (keyword == shortcut) {
				extendShortcut("@{0}, ''", selectorName);
				caretPositionOffset = 1;
			}
		});
	}

	if (!isXPathModified()) {
		xpathParts = xpath.substring(0, caretPosition).split('/');
		keyword = getKeyword(xpathParts);
		$.each(tagsWithShortcuts, function (shortcut, tagName) {
			if (keyword == shortcut) {
				extendShortcut("{0}", tagName, 1);
				caretPositionOffset = 0;
			}
		});
	}

	if (isXPathModified()) {
		var newCaretPosition = xpath.length - caretPosition;
		xpathInput.caret(xpathInput.val().length - newCaretPosition - caretPositionOffset);
	}

	function isXPathModified() {
		return xpath != xpathInput.val();
	}
}

function extendShortcut(extendedText, name, caretPositionOffset) {
	var xpath = xpathInput.val();
	var caretPosition = xpathInput.caret();
	if (caretPositionOffset === undefined) {
		caretPositionOffset = 2;
	}
	xpathInput.val(xpath.substring(0, caretPosition - caretPositionOffset) + extendedText.format(name) + xpath.substring(caretPosition));
}

function getKeyword(parts) {
	return parts[parts.length - 1];
}

function correctFixedNodes() {
	if (xpather.is(':visible') == false) {
		body.find('.xpather-position-fix').removeClass('xpather-position-fix');
	} else {
		body.find(':fixed').addClass('xpather-position-fix');
	}
}
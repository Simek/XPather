function init() {
	"use strict";
	if (isDocumentValid) {
		$html.toggleClass('xpather-on');
		if (!$xpather.is(':visible')) {
			$xpather.show();
			correctFixedNodes();
			setTimeout(function () {
				$xpathInput.focus();
			}, 1);
			chrome.storage.sync.get('sidebarVisible', function (data) {
				if (data.sidebarVisible) {
					toggleSidebar();
				}
			});
			if ($xpathInput.val() !== 0) {
				find();
			}
		} else {
			chrome.storage.sync.set({
				'sidebarVisible': $sidebar.is(":visible")
			});
			$sidebar.hide();
			$xpather.hide();
			$sidebarToggler.removeClass('xpather-sidebar-toggler-active');
			clearHighlight();
			correctFixedNodes();
		}
	}
}

function checkIsDocumentValid() {
	if (document.contentType.indexOf('text/html') === -1) {
		return false;
	}
	return true;
}

function find() {
	var xpath = $xpathInput.val();
	if (previousXPath === xpath) {
		return;
	}

	$sidebarEntries.empty();
	clearHighlight();

	var result;
	try {
		result = $doc.xpath(xpath);
	} catch(e) {
		$resultBox.addClass('xpather-no-results').text('Invalid XPath').attr("title", e.message);
		return;
	}

	previousXPath = xpath;
	previousMatched = result;

	if (result.length !== 0) {
		if (result[0] instanceof Object) {
			$.each(result, function (index, element) {
				var node = $(element);
				var nodeType = getNodeType(node);

				if (nodeType === 'text') {
					node.wrap('<xpather class="xpather-text-hightlight"/>')
				} else if (nodeType === 'element') {
					node.safeAddClass('xpather-highlight');
				}

				$sidebarEntries.append(createSidebarEntry(index, node, nodeType));
			});
			$resultBox.removeClass('xpather-no-results').text(result.length);
		} else {
			$resultBox.removeClass('xpather-no-results').text(result[0]);
		}
	} else {
		$resultBox.addClass('xpather-no-results').text('No results');
	}

	$resultBox.show();
}

function getNodeType(node) {
	var nodeType;
	switch (node[0].nodeType) {
		case 1:
			nodeType = 'element';
			break;
		case 2:
			nodeType = 'attribute';
			break;
		case 3:
			nodeType = 'text';
			break;
		default:
			nodeType = 'other';
	}
	return nodeType;
}

function findWithDelay() {
	clearTimeout($xpathInput.data('timer'));
	$xpathInput.data('timer', setTimeout(function () {
		$xpathInput.removeData('timer');
		find();
	}, 400));
}

function createSidebarEntry(index, node, type) {
	var entry = $('<div class="xpather-sidebar-entry" />');
	if (type === 'attribute') {
		entry.text(node[0].value).wrapInner('<span/>');
		entry.addClass('xpather-sidebar-entry-attribute');
	} else {
		var nodeText = node.text().trim();
		if (type === 'element' && hasCSSContent(node) && nodeText.length === 0) {
			entry.text('FONT ICON').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		} else if (type === 'element' && node[0].nodeName === 'IMG' || (nodeHasOnlyImage(node) && nodeText.length === 0)) {
			entry.text('IMAGE').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		} else if (nodeText.length !== 0) {
			entry.text(getNodeText(node)).wrapInner('<span/>');
			if (nodeText.length > 220) {
				entry.append('<div class="xpather-sidebar-entry-fade" />');
			}
		} else if (!/\S/.test(nodeText)) {
			entry.text('WHITESPACES').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		} else {
			entry.text('EMPTY NODE').wrapInner('<span/>');
			entry.addClass('xpather-sidebar-entry-info');
		}

		entry.bind('click', function () {
			$.scrollTo(node, 500, {offset: -80});
			clearImportantHighlight();
			node.safeAddClass('xpath-important-highlight');
		});
	}
	entry.append('<div class="xpather-sidebar-entry-count">' + (index + 1) + '</div>');

	return entry;
}

function toggleSidebar() {
	$sidebarToggler.toggleClass('xpather-sidebar-toggler-active');
	$sidebar.toggle();
	chrome.storage.sync.set({
		'sidebarVisible': $sidebar.is(':visible')
	});
}

function clearHighlight() {
	clearImportantHighlight();
	unwrapMatchedText();
	$.each(previousMatched, function (index, element) {
		$(element).safeRemoveClass('xpather-highlight');
	});
	$('*[class=""]').removeAttr('class');
}

function clearImportantHighlight() {
	$('.xpath-important-highlight').safeRemoveClass('xpath-important-highlight');
}

function unwrapMatchedText() {
	$('.xpather-text-hightlight').each(function (index, element) {
		$(element).replaceWith($(element).text());
	});
}

function hasCSSContent(node) {
	if (window.getComputedStyle(node[0], ':before').content != '') {
		return true;
	}
	var hasCSSContent = false;
	node.find('*').filter(function () {
		if (window.getComputedStyle(this, ':before').content != '') {
			hasCSSContent = true;
		}
	})
	return hasCSSContent;
}

function nodeHasOnlyImage(node) {
	var allChildren = node.find('*');
	if (allChildren.length !== 0) {
		var hasOnlyImage = true;
		allChildren.each(function (index, element) {
			if ($(element).prop('tagName') != 'IMG') {
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
	return $.trim(node.text().replace(/\s+/g, ' '));
}

function inputAutocomplete() {
	var xpath = $xpathInput.val();
	var caretPosition = $xpathInput.caret();
	var xpathParts = xpath.substring(0, caretPosition).split('[');
	var keyword = getKeyword(xpathParts);
	var caretPositionOffset = 2;

	if (keyword.substring(0, keyword.length - 1) === '@') {
		tryExtend(selectorsWithShortcuts, "@{0}='']", 2);
	} else {
		tryExtend(functionsWithShortcuts, "{0}()]", 2);
	}

	if (!isXPathModified()) {
		xpathParts = xpath.substring(0, caretPosition).split('(');
		keyword = getKeyword(xpathParts);
		tryExtend(selectorsWithShortcuts, "@{0}, ''", 1);
	}

	if (!isXPathModified()) {
		xpathParts = xpath.substring(0, caretPosition).split('/');
		keyword = getKeyword(xpathParts);
		tryExtend(tagsWithShortcuts, "{0}", 0);
	}

	if (isXPathModified()) {
		var newCaretPosition = xpath.length - caretPosition;
		$xpathInput.caret($xpathInput.val().length - newCaretPosition - caretPositionOffset);
	}

	function isXPathModified() {
		return xpath != $xpathInput.val();
	}

	function tryExtend(shotrcuts, pattern, offset) {
		$.each(shotrcuts, function (shortcut, selectorName) {
			if (keyword == shortcut) {
				extendShortcut(pattern, selectorName, shortcut.length);
				caretPositionOffset = offset;
			}
		});
	}

	function extendShortcut(extendedText, name, caretPositionOffset) {
		$xpathInput.val(xpath.substring(0, caretPosition - caretPositionOffset) + extendedText.format(name) + xpath.substring(caretPosition));
	}
}

function getKeyword(parts) {
	return parts[parts.length - 1];
}

function isTopAttached() {
	return $(this).css('top') === 0;
}

function correctFixedNodes() {
	if ($xpather.is(':visible')) {
		$body.find(':fixed').filter(isTopAttached).safeAddClass('xpather-position-fix');
	} else {
		$body.find('.xpather-position-fix').safeRemoveClass('xpather-position-fix');
	}
}

var isDocumentValid = checkIsDocumentValid();

if (isDocumentValid) {
	var previousMatched = [];
	var previousXPath = "";

	var $doc = $(document);
	var $body = $('body');
	var $html = $('html');

	$html.append(xpatherHTML);
	var $xpather = $('#xpather');
	var $resultBox = $('#xpather-result');
	var $xpathInput = $('#xpather-xpath');
	var $xpathForm = $('#xpather-form');
	var $sidebar = $('#xpather-sidebar');
	var $sidebarEntries = $('#xpather-sidebar-entries');
	var $sidebarToggler = $('#xpather-sidebar-toggler');

	$xpathForm.on('submit', function () {
		"use strict";
		find();
		return false;
	});

	$sidebarToggler.click(function () {
		"use strict";
		toggleSidebar();
	});

	$doc.keydown(function (e) {
		"use strict";
		if (e.altKey && e.shiftKey) {
			toggleSidebar();
		}
	});

	$xpathInput.keydown(function (e) {
		"use strict";
		if ((e.ctrlKey || e.metaKey) && e.keyCode === 32) { // CTRL/CMD + SPACE
			inputAutocomplete();
			find();
			return false;
		} else if ((e.ctrlKey || e.metaKey) && (e.keyCode === 86 || e.keyCode === 88 || e.keyCode === 89 || e.keyCode === 90)) { // CTRL/CMD + V/X/Y/Z
			find();
		} else {
			if ($xpathInput.val() !== 0) {
				if (e.keyCode === 13) { // ENTER
					clearTimeout($xpathInput.data('timer'));
					find();
				} else {
					findWithDelay();
				}
			}
		}
	});
}

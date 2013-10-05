var panels = chrome.devtools.panels;

var getResult = function () {
	function findSingleEntryXPath(node, attribute) {
		var selector = node.attr(attribute);
		var tagName = getTagName(node);

		if (isSingleElement(tagName)) {
			return createSingleEntryXPath(node);
		} else if (isSingleElement(tagName + '[' + attribute + '="' + selector + '"]')) {
			return createSingleEntryXPathWithAttr(node, attribute);
		} else {
			return null;
		}
	}

	function getTagName(node) {
		return node.prop('tagName').toLowerCase();
	}

	function isSingleElement(selector) {
		return $(selector).length == 1
	}

	function createSingleEntryXPath(node) {
		return '\/\/' + getTagName(node);
	}

	function createSingleEntryXPathWithAttr(node, attribute) {
		return '\/\/' + getTagName(node) + '[@' + attribute + '=\'' + node.attr(attribute) + '\']';
	}

	var node = $($0);
	var result = { __proto__: null };

	var attributes = ['id', 'class', 'article', 'section', 'details', 'aside', 'time', 'header', 'href', 'src'];
	attributes.forEach(function (attribute) {
		if (node.attr(attribute)) {
			result['singleEntryXPath'] = findSingleEntryXPath(node, attribute);
			if (result.singleEntryXPath != null && result.singleEntryXPath.length != 0) {
				return;
			}
		}
	});
	return result.singleEntryXPath ? result : "";
};

panels.elements.createSidebarPane('Generated XPaths',
	function (sidebar) {
		function getXPath() {
			sidebar.setExpression("(" + getResult.toString() + ")()");
		}

		getXPath();
		panels.elements.onSelectionChanged.addListener(getXPath);
	}
);
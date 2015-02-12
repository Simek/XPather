function findSingleEntryXPath($node, attribute, tagName) {
	var selector = $node.attr(attribute);

	if (isSingleElement(tagName + '[' + attribute + '="' + selector + '"]')) {
		return createSingleEntryXPathWithAttr($node, attribute);
	}

	return null;
}

function getNodeTagName($node) {
	return $node.prop('tagName').toLowerCase();
}

function getNodeXPathIndex($node, tagName) {
	var notSameTagAntecedentsCount = $node.prevAll().filter(function () {
		return getNodeTagName($(this)) !== tagName;
	}).length;
	return $node.index() + 1 - notSameTagAntecedentsCount;
}

function getBestNode($matchedNodes) {
	var nodesWithDepth = [];

	$matchedNodes.each(function (index, element) {
		nodesWithDepth.push({
			node: $(element), 
			depth: $(element).parents().length
		});
	});

	nodesWithDepth = nodesWithDepth.sort(function (a, b) {
	    return a.depth - b.depth;
	});

	return nodesWithDepth.pop().node;
}

function isSingleElement(selector) {
	return $(selector).length === 1;
}

function isSingleElementInParent(selector, $parent) {
	return $(parent).find(selector).length === 1;
}

function createSingleEntryXPath($node) {
	return '\/\/' + getNodeTagName($node);
}

function createSingleEntryXPathWithAttr($node, attribute) {
	return '\/\/' + getNodeTagName($node) + '[@' + attribute + '=\'' + $node.attr(attribute) + '\']';
}

function createSingleEntryXPathWithIndex($node, index) {
	return '\/' + createEntryXPathWithIndex($node, index);
}

function createEntryXPathWithIndex($node, index) {
	return '\/' + getNodeTagName($node) + '[' + index + ']';
}

function findXPath() {
	if (!isDocumentValid) {
		return;
	}

	currentSelection = currentSelection.trim().replace(/\[XPATHER\]/g, '\'');

	var $matchedNodes = $('*').filter(function () {
		return filteredTagNames.indexOf(getNodeTagName($(this))) === -1 && $(this).text().indexOf(currentSelection) !== -1;
	});

	if ($matchedNodes.length === 0) {
		$xpathInput.val('');
		$resultBox.addClass('xpather-no-results').text('Unique XPath could not be found!');
		$sidebarEntries.empty();
		clearHighlight();
		return;
	}

	var $node = getBestNode($matchedNodes);
	var tagName = getNodeTagName($node);
	var nodeIndex = getNodeXPathIndex($node, tagName);

	var result = null;

	if (isSingleElement(tagName)) {
		result = createSingleEntryXPath($node);
	}

	if (!result) {
		attributes.forEach(function (attribute) {
			if ($node.attr(attribute)) {
				result = findSingleEntryXPath($node, attribute, tagName);
				if (result) {
					return;
				}
			}
		});
	}

	if (!result && isSingleElement(tagName + '[' + nodeIndex + ']')) {
		result = createSingleEntryXPathWithIndex($node, nodeIndex);
	}

	if (!result) {
		var $parent = $node.parentNode ? $node.parentNode : $node.parent();
		var parentTagName = getNodeTagName($parent);

		attributes.forEach(function (attribute) {
			if ($parent.attr(attribute)) {
				result = findSingleEntryXPath($parent, attribute, parentTagName);

				if (result) {
					if (isSingleElementInParent(tagName, $parent)) {
						result += '/' + tagName;
					} else {
						result += createEntryXPathWithIndex($node, nodeIndex);
					}
					return;
				} else {
					if (isSingleElement(parentTagName + '[' + attribute + '=\'' + $parent.attr(attribute) + '\'] > ' + tagName)) {
						result = createSingleEntryXPathWithAttr($parent, attribute) + '/' + tagName;
						return;
					}
				}
			}
		});
	}

	$xpathInput.val(result);
	find(true);

	if (!result) {
		$resultBox.addClass('xpather-no-results').text('Unique XPath could not be found!');
	}

	if (!$xpather.is(':visible')) {
		$html.toggleClass('xpather-on');
		showXPather();
	}

	return;
}

var currentSelection = null;
var attributes = ['id', 'class', 'itemprop', 'role', 'time', 'rel', 'style'];
var filteredTagNames = ['html', 'body', 'script'];
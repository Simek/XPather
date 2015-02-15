var currentSelection = null;

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

function getBestNode(currentSelection) {
	var $matchedNodes = $('body').find('*').filter(function () {
		return filteredTagNames.indexOf(getNodeTagName($(this))) === -1 && $(this).text().indexOf(currentSelection) !== -1;
	});

	if ($matchedNodes.length === 0) {
		$xpathInput.val('');
		$resultBox.addClass('xpather-no-results').text('Unique XPath could not be found!');
		$sidebarEntries.empty();
		clearHighlight();
		return null;
	}

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

function isSingleChildInParent(tagName, $parent) {
	return isSingleElement($parent.find(">" + tagName));
}

function isSingleChildInParentWithAttr(tagName, $parent, attribute) {
	var childInParentWithAttrQuery = "{pTagName}[{attr}='{value}']>{tagName}".supplant({
		pTagName: getNodeTagName($parent),
		attr: attribute,
		value: $parent.attr(attribute),
		tagName: tagName
	});
	return isSingleElement($(childInParentWithAttrQuery));
}

function createSingleEntryXPath(tagName) {
	return '\/\/' + tagName;
}

function createSingleEntryXPathWithAttr($node, attribute) {
	return "\/\/{tagName}[@{attr}='{value}']".supplant({
		tagName: getNodeTagName($node),
		attr: attribute,
		value: $node.attr(attribute)
	});
}

function createSingleEntryXPathWithIndex(tagName, index) {
	return '\/' + createEntryXPathWithIndex(tagName, index);
}

function createEntryXPathWithIndex(tagName, index) {
	return '\/' + tagName + '[' + index + ']';
}

function clearUserSelection() {
	if (document.selection && document.selection.empty) {
		document.selection.empty();
	} else if (window.getSelection) {
		var sel = window.getSelection();
		sel.removeAllRanges();
	}
}

function findXPath() {
	if (!isDocumentValid) {
		return;
	}

	currentSelection = currentSelection.replace(/\[XPATHER\]/g, '\'');

	var $node = null;
	var result = null;

	if (clickedNode) {
		var clickedNodeText = $(clickedNode).text().split('\n').join(' ');
		if (clickedNodeText.indexOf(currentSelection) === -1) {
			$node = $(clickedNode).parent();
		} else {
			$node = $(clickedNode);
		}
	} else {
		$node(getBestNode(currentSelection));
	}

	clickedNode = null;

	var tagName = getNodeTagName($node);
	var nodeIndex = getNodeXPathIndex($node, tagName);

	if (isSingleElement(tagName)) {
		result = createSingleEntryXPath(tagName);
	}

	if (!result) {
		try {
			attributes.forEach(function (attribute) {
				if ($node.attr(attribute)) {
					result = findSingleEntryXPath($node, attribute, tagName);
					if (result) {
						throw BreakException;
					}
				}
			});
		} catch (e) {}
	}

	if (!result && isSingleElement(tagName + '[' + nodeIndex + ']')) {
		result = createSingleEntryXPathWithIndex(tagName, nodeIndex);
	}

	if (!result) {
		var $parent = $node.parentNode ? $node.parentNode : $node.parent();
		var parentTagName = getNodeTagName($parent);
		
		try {
			attributes.forEach(function (attribute) {
				if ($parent.attr(attribute)) {
					result = findSingleEntryXPath($parent, attribute, parentTagName);
					if (result) {
						throw BreakException;
					}
				}
			});
		} catch (e) {}

		if (result) {
			if (isSingleChildInParent(tagName, $parent)) {
				result += '/' + tagName;
			} else {
				result += createEntryXPathWithIndex(tagName, nodeIndex);
			}
		} else {
			try {
				attributes.forEach(function (attribute) {
					if (isSingleChildInParentWithAttr(tagName, $parent, attribute)) {
						result = createSingleEntryXPathWithAttr($parent, attribute) + '/' + tagName;
						throw BreakException;
					}
				});
			} catch (e) {}
		}
	}

	$xpathInput.val(result);
	find(true);

	clearUserSelection();

	if (!result) {
		$resultBox.addClass('xpather-no-results').text('Unique XPath could not be found!');
	}

	if (!$xpather.is(':visible')) {
		$html.toggleClass('xpather-on');
		showXPather();
	}

	return;
}

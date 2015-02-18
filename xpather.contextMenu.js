var currentSelection = null;

function findSingleEntryXPath($node, attribute, tagName) {
	var selector = $node.attr(attribute);

	if (isSingleElement(tagName + '[' + attribute + '="' + selector + '"]')) {
		return createXPathWithAttr($node, attribute);
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

function tryPatentAndChildWithAttrs($node, $parent) {
	var result = null;
	var tagName = getNodeTagName($node);
	try {
		for (var i = 0; i < attributesLength; i++) {
			if (isSingleChildInParentWithAttr(tagName, $parent, attributes[i])) {
				result = createXPathWithAttr($parent, attributes[i]) + '/' + tagName;
				throw BreakException;
			}
		}
	} catch (e) {
		return result;
	}
	try {
		for (var i = 0; i < attributesLength; i++) {
			for (var j = 0; j < attributesLength; j++) {
				if (isSingleChildWithAttrInParentWithAttr($node, $parent, attributes[j], attributes[i])) {
					result = createXPathWithAttr($parent, attributes[i]) + createXPathWithAttr($node, attributes[j], true);
					throw BreakException;
				}
			}
		}
	} catch (e) {}
	return result;
}

function isSingleElement(selector) {
	return $(selector).length === 1;
}

function isSingleChildInParent(tagName, $parent) {
	return isSingleElement($parent.find(">" + tagName));
}

function isSingleChildInParentWithAttr(tagName, $parent, attribute) {
	if ($parent.attr(attribute)) {
		var childInParentWithAttrQuery = "{pTagName}[{attr}='{value}']>{tagName}".supplant({
			pTagName: getNodeTagName($parent),
			attr: attribute,
			value: $parent.attr(attribute),
			tagName: tagName
		});
		return isSingleElement($(childInParentWithAttrQuery));
	}
	return false;
}

function isSingleChildWithAttrInParentWithAttr($node, $parent, nodeAttribute, parentAttribute) {
	if ($parent.attr(parentAttribute) && $node.attr(nodeAttribute)) {
		var childInParentWithAttrQuery = "{pTagName}[{pAttr}='{pValue}']>{cTagName}[{cAttr}='{cValue}']".supplant({
			pTagName: getNodeTagName($parent),
			pAttr: parentAttribute,
			pValue: $parent.attr(parentAttribute),
			cTagName: getNodeTagName($node),
			cAttr: nodeAttribute,
			cValue: $node.attr(nodeAttribute),
		});
		return isSingleElement($(childInParentWithAttrQuery));
	}
	return false;
}

function createXPath(tagName) {
	return '\/\/' + tagName;
}

function createXPathWithAttr($node, attribute, isChild) {
	isChild = typeof isChild !== 'undefined' ?  isChild : false;
	return "{slash}\/{tagName}[@{attr}='{value}']".supplant({
		slash: isChild ? '' : '\/',
		tagName: getNodeTagName($node),
		attr: attribute,
		value: $node.attr(attribute)
	});
}
function createXPathWithIndex(tagName, index, isChild) {
	isChild = typeof isChild !== 'undefined' ?  isChild : false;
	return "{slash}\/{tagName}[{i}]".supplant({
		slash: isChild ? '' : '\/',
		tagName: tagName,
		i: index
	});
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
		result = createXPath(tagName);
	}

	if (!result) {
		try {
			for (var i = 0; i < attributesLength; i++) {
				if ($node.attr(attributes[i])) {
					result = findSingleEntryXPath($node, attributes[i], tagName);
					if (result) {
						throw BreakException;
					}
				}
			}
		} catch (e) {}
	}

	if (!result && isSingleElement(tagName + '[' + nodeIndex + ']')) {
		result = createXPathWithIndex(tagName, nodeIndex);
	}

	if (!result) {
		var $parent = $node.parentNode ? $node.parentNode : $node.parent();
		var parentTagName = getNodeTagName($parent);
		
		try {
			for (var i = 0; i < attributesLength; i++) {
				if ($parent.attr(attributes[i])) {
					result = findSingleEntryXPath($parent, attributes[i], parentTagName);
					if (result) {
						throw BreakException;
					}
				}
			}
		} catch (e) {
			if (isSingleChildInParent(tagName, $parent)) {
				result += '/' + tagName;
			} else {
				result += createXPathWithIndex(tagName, nodeIndex, true);
			}
		}
	}

	if (!result) {
		result = tryPatentAndChildWithAttrs($node, $parent);
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

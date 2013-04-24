/*
 * XPath - jQuery wrapper for the DOM 3 XPath API exposed by document.evaluate()
 *
 * Copyright © 2010 John Firebaugh
 *
 * Dual licensed under the MIT or GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */
(function ($) {
    var xp = function (xpath, contextNode) {
		try {
			var iterator = document.evaluate(xpath, contextNode, null, XPathResult.ANY_TYPE, null);
		} catch (Exception) {
			return "invalid";
		}

        var node = iterator.iterateNext();
        var nodes = [];

        while (node) {
            nodes.push(node);
            node = iterator.iterateNext();
        }

        return nodes;
    };

    $.xpath = function (xpath) {
        return $(xp(xpath, document));
    }

    $.fn.xpath = function (xpath) {
        var nodes = [];

        this.each(function () {
            nodes.push.apply(nodes, xp(xpath, this));
        });

        return this.pushStack(nodes, "xpath", xpath);
    }
})(jQuery);
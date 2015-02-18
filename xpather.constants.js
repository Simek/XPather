var xpatherHTML = '\
	<xpather id="xpather">\
		<form id="xpather-form">\
			<input id="xpather-xpath" type="text" placeholder="enter XPath…" autocomplete="off" spellcheck="false" />\
		</form> \
		<xpather id="xpather-result"></xpather>\
		<xpather id="xpather-sidebar-toggler"></xpather>\
	</xpather>\
	<xpather id="xpather-sidebar">\
		<xpather id="xpather-sidebar-spacer"></xpather>\
		<xpather id="xpather-sidebar-entries"></xpather>\
	</xpather>';

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

var attributes = ['id', 'class', 'itemprop', 'role', 'time', 'rel', 'style'];
var attributesLength = attributes.length;
var filteredTagNames = ['html', 'body', 'script'];
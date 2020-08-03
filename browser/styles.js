// Create stylesheet
var style = document.createElement('style');
style.innerHTML =
	// text color
	'body {' +
	'color: ' + mediumEmphasisColor + ';' +
	'background-color: ' + backgroundColor + ';' +
	'}' +
	// hyperlink color
	'a {' +
	'color: ' + primaryColor + ';' +
	'}' +
	// dL color
	'#dL {' +
	'color: ' + data1Color + ';' +
	'}' +
	// dR color
	'#dR {' +
	'color: ' + data2Color + ';' +
	'}' +
	// gravity colors
	'.gravity {' +
	'color: ' + primaryColor + ';' +
	'}' +
	// icon colors
	'.icon-bar {' +
	'color: ' + disabledColor + ';' +
	'}' +

	'.active {' +
	'color: ' + highEmphasisColor + ';' +
	'}' +

	'.icon-bar input:hover {' +
	'color: ' + secondaryColor + ';' +
	'}' +

	'.tooltip .tooltiptext {' +
	'color: ' + mediumEmphasisColor + ';' +
	'}';

// Get the first script tag
var ref = document.querySelector('script');

// Insert our new styles before the first script tag
ref.parentNode.insertBefore(style, ref);

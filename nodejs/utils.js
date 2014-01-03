function baseName(str) {
	var base = new String(str).substring(str.lastIndexOf('/') + 1);
	return base;
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.baseName = baseName;
exports.endsWith = endsWith;
'use strict'

if (!module) {
	exports = { ReplaceChar, RemoveChar }
}

const ReplaceChar = (str, which, by) => {
	let result = str
	while (result.includes(which)) result = result.replace(which, by)
	return result
}

const RemoveChar = (str, char) => {
	return ReplaceChar(str, char, '')
}

if (module) {
	module.exports = { ReplaceChar, RemoveChar }
}

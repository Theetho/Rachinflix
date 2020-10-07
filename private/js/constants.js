'use strict'

const path = require('path')

if (!module) {
	exports = { ROOT, PATH_THUMBNAILS, PATH_PREVIEWS, PATH_SUBTITLES }
}

const ROOT = path.resolve(__dirname, '../../../Site')
const PATH_THUMBNAILS = '/public/thumbnails'
const PATH_PREVIEWS = '/public/previews'
const PATH_SUBTITLES = '/public/subtitles'

if (module) {
	module.exports = {
		ROOT,
		PATH_THUMBNAILS,
		PATH_PREVIEWS,
		PATH_SUBTITLES,
	}
}

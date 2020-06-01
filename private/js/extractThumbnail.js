'use strict'

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')

const ENABLE_LOGGING = false

const PATH_THUMBNAILS = '/public/temps/'

const ExtractThumbnail = async (pPreviewFile, pName) => {
	const thumbnail_path = `.${PATH_THUMBNAILS}/${pName}.jpg`

	return new Promise(async (resolve, reject) => {
		// If the subtitle already exists, we don't need to reextract it
		if (fs.existsSync(thumbnail_path)) resolve('File already exists')
		else {
			ffmpeg(pPreviewFile)
				.outputOption(['-s 640x360', `-frames 1`])
				.on('start', (command) => {
					if (ENABLE_LOGGING) console.log(command)
				})
				.on('end', (stdout, stderr) => {
					resolve()
				})
				.on('error', (error, stdout, stderr) => {
					reject('Error: ', error.message, stdout, stderr)
				})
				.save(thumbnail_path)
		}
	})
}

module.exports = ExtractThumbnail

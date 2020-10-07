'use strict'

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const logger = require('../../src/logger')
const { PATH_THUMBNAILS } = require('./constants')

const ExtractThumbnail = async (pPreviewFile, pName) => {
	const thumbnail_path = `.${PATH_THUMBNAILS}/${pName}.jpg`

	return new Promise(async (resolve, reject) => {
		// If the subtitle already exists, we don't need to reextract it
		if (fs.existsSync(thumbnail_path))
			resolve({ generated: false, message: '' })
		else {
			ffmpeg(pPreviewFile)
				.outputOption(['-s 640x360', `-frames 1`])
				.on('start', (command) => {
					logger.Debug(command)
				})
				.on('end', (stdout, stderr) => {
					resolve({ generated: true, message: 'Thumbnail generated !' })
				})
				.on('error', (error, stdout, stderr) => {
					reject('Error: ', error.message, stdout, stderr)
				})
				.save(thumbnail_path)
		}
	})
}

module.exports = ExtractThumbnail

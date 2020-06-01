'use strict'

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const ffprobe = require('ffmpeg-probe')

const ENABLE_LOGGING = false

const PATH_PREVIEWS = '/public/temps/'
const PREVIEW_DURATION = 30 // s

const ExtractPreview = async (pInputFile, pName) => {
	const preview_path = `.${PATH_PREVIEWS}/${pName}.mkv`

	return new Promise(async (resolve, reject) => {
		// If the subtitle already exists, we don't need to reextract it
		if (fs.existsSync(preview_path)) resolve(preview_path)
		else {
			// start time in seconds, we want to read the input at 5%
			const metadata = await ffprobe(pInputFile)
			const start_time = (metadata.format.duration * 0.05).toFixed(1)

			ffmpeg(pInputFile)
				.setStartTime(start_time)
				.outputOption([
					'-s 640x360',
					'-r 24',
					`-vcodec h264`,
					`-t ${PREVIEW_DURATION}`,
				])
				.noAudio()
				.on('start', (command) => {
					if (ENABLE_LOGGING) console.log(command)
				})
				.on('end', (stdout, stderr) => {
					resolve(preview_path)
				})
				.on('error', (error, stdout, stderr) => {
					reject('Error: ', error.message, stdout, stderr)
				})
				.save(preview_path)
		}
	})
}

module.exports = ExtractPreview

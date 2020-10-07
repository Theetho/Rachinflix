'use strict'

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const ffprobe = require('ffmpeg-probe')
const logger = require('../../src/logger')
const { PATH_PREVIEWS } = require('./constants')

const PREVIEW_DURATION = 30 // s

const ExtractPreview = async (pInputFile, pName) => {
	const preview_path = `.${PATH_PREVIEWS}/${pName}.mkv`

	return new Promise(async (resolve, reject) => {
		// If the subtitle already exists, we don't need to reextract it
		if (fs.existsSync(preview_path))
			resolve({ generated: false, path: preview_path })
		else {
			// start time in seconds, we want to read the input at 5%
			const metadata = await ffprobe(pInputFile)

			const start_time = (metadata.format.duration * 0.05).toFixed(0)

			ffmpeg(pInputFile)
				.setStartTime(start_time)
				.outputOption([
					'-an',
					'-sn',
					`-vcodec h264`,
					`-t ${PREVIEW_DURATION}`,
					'-r 24',
					'-f matroska',
					'-s 640x360',
				])
				.noAudio()
				.on('start', (command) => {
					logger.Debug(command)
				})
				.on('progress', (progress) => {
					logger.Progress(progress.percent.toFixed(2))
				})
				.on('end', (stdout, stderr) => {
					resolve({ generated: true, path: preview_path })
				})
				.on('error', (error, stdout, stderr) => {
					reject(error.message, stdout, stderr)
				})
				.save(preview_path)
		}
	})
}

module.exports = ExtractPreview

'use strict'

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const ffprobe = require('ffmpeg-probe')
const logger = require('../../src/logger')
const { PATH_SUBTITLES } = require('./constants')

/**
 * @brief: Extract subtitles from a video (only one per language (forced excluded))
 *
 * @param {String} pInputFile: Path to the video
 * @param {String} pName: Path to video associated, with '_' instead of '/'
 *
 * @return {Array of Promise}: So we can await for every subtitle to be generated
 */
const ExtractSubtitles = async (pInputFile, pName) => {
	const data = await ffprobe(pInputFile)

	const subtitles = []
	// Strore the languages already processed
	const languages = {}

	for (const index in data.streams) {
		const stream = data.streams[index]

		const codec_type = stream['codec_type']
		// Ignore non subtitle streams
		if (codec_type !== 'subtitle') continue

		const codec_name = stream['codec_name']

		// if (!stream.tags || !stream.tags.language)
		// 	logger.Debug(stream.tags === undefined ? stream : stream.tags)

		let language = 'NS'

		if (stream.tags)
			language = stream.tags['language'] || stream.tags['LANGUAGE']

		// Separate forced subtitles from actual subtitles
		const title = stream.tags.title || ''
		if (
			title.includes('Forced') ||
			title.includes('Forcé') ||
			title.includes('Force')
		)
			language += '_forced'

		// Ignore subtitles when their is already one in the same language
		if (languages[language] !== undefined) continue

		subtitles.push({
			language: language,
			index: index,
			codec: codec_name === 'webvtt' ? 'copy' : 'webvtt',
		})
	}

	if (subtitles.length === 0) {
		logger.Info('	No subtitles in that file')
		return
	}

	const extract = async (subtitle_path, subtitle) => {
		return new Promise((resolve, reject) => {
			// If the subtitle already exists, we don't need to reextract it
			if (fs.existsSync(subtitle_path))
				resolve({ generated: false, message: '' })
			else {
				ffmpeg(pInputFile)
					.outputOption([`-map 0:${subtitle.index}`, `-c ${subtitle.codec}`])
					.on('start', (command) => {
						logger.Debug(command)
					})
					.on('end', (stdout, stderr) => {
						resolve({
							generated: true,
							message: `	Subtitle ${subtitle.language} generated`,
						})
					})
					.on('error', (error, stdout, stderr) => {
						reject(error.message)
					})
					.save(subtitle_path)
			}
		})
	}

	for (let index in subtitles) {
		const subtitle = subtitles[index]
		const subtitle_path = `.${PATH_SUBTITLES}/${pName}_${subtitle.language}.vtt`

		try {
			const result = await extract(subtitle_path, subtitle)
			if (result.generated) logger.Info(result.message)
		} catch (error) {
			logger.Error(error)
		}
	}
}

module.exports = ExtractSubtitles

'use strict'

const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const ffprobe = require('ffmpeg-probe')

const ENABLE_LOGGING = false

const PATH_SUBTITLES = '/public/temps/'

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
		let language = stream.tags.language

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

	if (subtitles.length === 0)
		return new Promise((resolve, reject) => {
			resolve('No subtitles in that file')
		})

	let result = subtitles.map((subtitle) => {
		const subtitle_path = `.${PATH_SUBTITLES}/${pName}_${subtitle.language}.vtt`

		return new Promise((resolve, reject) => {
			// If the subtitle already exists, we don't need to reextract it
			if (fs.existsSync(subtitle_path)) resolve('File already exists')
			else {
				ffmpeg(pInputFile)
					.outputOption([`-map 0:${subtitle.index}`, `-c ${subtitle.codec}`])
					.on('start', (command) => {
						if (ENABLE_LOGGING) console.log(command)
					})
					.on('end', (stdout, stderr) => {
						resolve(`${subtitle.language} VTT file created !`)
					})
					.on('error', (error, stdout, stderr) => {
						reject('Error: ', error.message)
					})
					.save(subtitle_path)
			}
		})
	})

	return Promise.all(result)
}

module.exports = ExtractSubtitles

'use strict'

const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const OUTPUT_DIR = './private/streams'
const OUTPUT_PREFIXE = 'CONVERTED_'

// Strores the transcoders stream
let stream = null

/**
 * @brief: Transcode the given file to a readable file, if
 * it isn't transcode already
 *
 * @param {String} pInputFile: Path to the file to transcode
 * @param {Object} pInfos: Info of the file (codecs, bitrates, ...). See 'extractInfo.js"
 */
const ConvertFile = (pInputFile, pInfos) => {
	let split = pInputFile.split('/')
	const file_name = split[split.length - 1].split('.')[0]

	const output_path = OUTPUT_DIR + '/' + OUTPUT_PREFIXE + file_name + '.mkv'

	// If their is already a conversion, then we send this file (no need to transcode again)
	if (fs.existsSync(output_path))
		return new Promise((resolve, reject) => {
			resolve(output_path)
		})

	// Stop the stream if it was active
	if (stream !== null) stream.kill()

	fs.writeFileSync(output_path)

	let output_options = [
		'-f matroska',
		'-s 1280x720',
		'-r 24',
		`-map 0:${pInfos.video.index}`,
		`-vcodec ${pInfos.video.codec}`,
		`-t ${pInfos.duration}`,
	]

	// Select the audio language with priorities
	// NS = Not specified

	const audio =
		pInfos.audio[pInfos.language] ||
		pInfos.audio['eng'] ||
		pInfos.audio['fre'] ||
		pInfos.audio['NS']

	output_options.push(`-map 0:${audio.index}`)
	output_options.push(`-acodec ${audio.codec}`)
	output_options.push(`-b:a ${audio.bitrate.toString().replace('000', 'k')}`)

	stream = ffmpeg(pInputFile)
		.outputOptions(output_options)
		.on('start', (commandLine) => {
			console.log(`Streaming ${pInputFile}. Executed ${commandLine}.`)
		})
		.on('end', (stdout, stderr) => {
			console.log(`Streaming is over`)
			stream = null
		})
		.on('progress', (progress) => {
			console.log('Processing: ' + progress.percent.toFixed(2) + '% done')
		})
		.on('error', (error, stdout, stderr) => {
			console.log('Error: ', error.message)
			console.log('Stdout: ', stdout)
			console.log('Stderr: ', stderr)
		})
		.save(output_path)

	// Send the file after a time, so the transcoding has some advance
	// over the streaming
	return new Promise((resolve, reject) => {
		setTimeout((_) => {
			console.log('Way-ing ay lilel')
			resolve(output_path)
		}, 5000)
	})
}

module.exports = ConvertFile

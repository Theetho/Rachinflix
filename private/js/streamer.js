'use strict'

const ffmpeg = require('fluent-ffmpeg')
const ffprobe = require('ffmpeg-probe')
const fs = require('fs')

const OUTPUT_DIR = '/private/streams'
const OUTPUT_PREFIXE = 'CONVERTED_'

/**
 * @brief: Class that handles all the converted files. It deals
 * with converting, deleting, and storring those converted files.
 */
class Streamer {
	constructor() {
		// Store ffmpeg process for every file being transcoded
		this.mStreams = {}
	}

	/**
	 * @brief: Transcode the given file to a readable file, if
	 * it isn't transcode already
	 *
	 * @param {String} pInputFile: Path to the file to transcode
	 * @param {Object} pInfos: Info of the file (codecs, bitrates, ...). See 'extractInfo.js"
	 */
	ConvertFile(pInputFile, pInfos) {
		const output_path = this._GetOutputPath(pInputFile)

		// If their is already a conversion, then we send this file (no need to transcode again)
		if (fs.existsSync(output_path))
			return new Promise((resolve, reject) => {
				resolve(output_path)
			})

		// Stop the stream if it was active
		if (
			this.mStreams[output_path] &&
			this.mStreams[output_path].stream !== null
		)
			this.mStreams[output_path].stream.kill()

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
		output_options.push(`-b:a ${audio.bitrate / 1000}k`)

		this.mStreams[output_path] = { stream: null, finished: false }

		this.mStreams[output_path].stream = ffmpeg(pInputFile)
			.outputOptions(output_options)
			.on('start', (commandLine) => {
				console.log(`Streaming ${pInputFile}. Executed ${commandLine}.`)
				this.mStreams[output_path].finished = false
			})
			.on('end', (stdout, stderr) => {
				console.log(`Streaming is over`)
				this.mStreams[output_path].finished = true
			})
			.on('progress', (progress) => {
				console.log('Processing: ' + progress.percent.toFixed(2) + '% done')
			})
			.on('error', (error, stdout, stderr) => {
				console.log('Error: ', error.message)
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

	/**
	 * @brief: Kill the ffmpeg process that is converting the input file and
	 * delete the converted file. Must be called when user closes the video
	 * before the end of transcoding so the incomplete file can be deleted.
	 *
	 * @param {String} pInputFile: Path to the file being streamed
	 */
	async StopConverting(pInputFile) {
		const output_path = this._GetOutputPath(pInputFile)

		// If the file wasn't being streamed
		if (this.mStreams[output_path] === undefined) return

		// If the file is fully converted, then we store it if needed before deleting it
		if (this.mStreams[output_path].finished)
			await this.StoreConvertedFile(pInputFile)

		// Stop the stream if it was active
		if (this.mStreams[output_path] !== null)
			this.mStreams[output_path].stream.kill()

		delete this.mStreams[output_path]
		setTimeout((_) => {
			const deleting_path = `.${OUTPUT_DIR}/${Math.random()}.mkv`
			fs.renameSync(output_path, deleting_path)
			fs.unlinkSync(deleting_path)
			console.log('File deleted')
		}, 1000)
	}

	async StoreConvertedFile(pInputFile) {
		const output_path = this._GetOutputPath(pInputFile)

		if (!this.mStreams[output_path].finished) return

		const input_stat = await ffprobe(pInputFile)
		const output_stat = await ffprobe(output_path)

		const CountUsefullStreams = (streams) => {
			let count = 0
			for (const index in streams) {
				const stream = streams[index]

				if (
					stream['codec_type'] !== 'video' &&
					stream['codec_type'] !== 'audio'
				)
					continue

				++count
			}

			return count
		}

		// File have same audio and video streams, except that output
		// is readable by browsers, so we override the input by the
		// output, so next time we don't have to transcode it.
		if (
			CountUsefullStreams(input_stat.streams) ===
			CountUsefullStreams(output_stat.streams)
		) {
			try {
				fs.copyFileSync(output_path, pInputFile)
			} catch (error) {
				console.log(`Error while overriding ${pInputFile}`)
			}

			console.log(`Overrided ${pInputFile} sucessfully !`)
		}
	}

	_GetOutputPath(pInputFile) {
		let split = pInputFile.split('/')
		const file_name = split[split.length - 1].split('.')[0]

		return `.${OUTPUT_DIR}/${OUTPUT_PREFIXE}${file_name}.mkv`
	}
}
module.exports = Streamer

'use strict'

const ffprobe = require('ffmpeg-probe')

/**
 * @brief: Extract info about the file's streams (codec, bitrate, ...)
 *
 * @param {String} pInputFile: Path to the file to extract info from
 */
const ExtractInfo = async (pInputFile) => {
	const data = await ffprobe(pInputFile)

	// Default constants
	const DEFAULT_AUDIO = 'aac'
	const DEFAULT_VIDEO = 'h264'
	const READABLE_VIDEO = ['h264', 'mjpeg']
	const MAXIMUM_BITRATE = 512000

	let info = {
		video: {
			index: -1,
			codec: DEFAULT_VIDEO,
		},
		audio: {},
		duration: data.format.duration,
		readable: true,
	}

	for (const index in data.streams) {
		const stream = data.streams[index]

		const codec_type = stream['codec_type']
		const codec_name = stream['codec_name']

		if (codec_type === 'video') {
			// Video stream already registered
			if (info.video.index >= 0) continue

			info.video.index = index

			// If the initial codec is not in READABLE_VIDEO, then the file can't be read
			// and needs to be transcoded.
			if (
				codec_name !== READABLE_VIDEO[0] &&
				codec_name !== READABLE_VIDEO[1]
			) {
				info.readable = false
				continue
			}

			// Else we can just copy the video input (default is already set to DEFAULT_VIDEO otherwise)
			info.video.codec = 'copy'
		} else if (codec_type === 'audio') {
			const bitrate = stream['bit_rate'] || MAXIMUM_BITRATE
			// NS = Not specified
			const language =
				stream.tags && stream.tags.language ? stream.tags.language : 'NS'
			const codec = codec_name === DEFAULT_AUDIO ? 'copy' : DEFAULT_AUDIO

			// If their is not already audio for this language
			// or if this audio as a lower bitrate (faster to transcode)
			if (
				info.audio[language] === undefined ||
				bitrate < Math.min(info.audio[language].bitrate, MAXIMUM_BITRATE)
			) {
				// Then we register this audio track
				info.audio[language] = {
					index: index,
					codec: codec,
					bitrate: Math.min(bitrate, MAXIMUM_BITRATE),
				}

				// If the audio cannot copied, then the file needs to be
				// transcoded
				if (codec !== 'copy') info.readable = false
			}
		}
	}

	return info
}

module.exports = ExtractInfo

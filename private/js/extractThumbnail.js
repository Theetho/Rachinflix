'use strict'

const fs = require('fs')
const ffprobe = require('ffmpeg-probe')
const extractFrames = require('ffmpeg-extract-frames')
const ffmpeg = require('fluent-ffmpeg')

const ENABLE_LOGGING = true
// const ROOT = 'E:/Site'
const ROOT = './data'
const OUTPUT_DIR = `./public/temps/`

const ReplaceAll = (pString, pSearchChar, pReplaceChar = '') => {
	let result = pString
	while (result.includes(pSearchChar)) {
		result = result.replace(pSearchChar, pReplaceChar)
	}

	return result
}

const ExploreDirectory = (pFolder = '', pPath = '') => {
	// Path to the folder, relative to the ROOT
	if (pFolder !== '' && pFolder[0] !== '/') pPath += '/'

	pPath += pFolder

	// So to read this folder, we need to concatenate the 'ROOT'
	fs.readdir(`${ROOT}/${pPath}`, (err, data) => {
		if (err) throw err
		// Then for each file/folder inside this folder
		data.forEach((file) => {
			// Remove the space in the route
			let route = `${pPath}/${file}`

			let route_without_spaces = ReplaceAll(route, ' ')

			let result = fs.statSync(`${ROOT}${route}`)

			// If it is a folder, we explore it
			if (result && result.isDirectory()) {
				ExploreDirectory(file, pPath)
				return
			}

			let route_without_spaces_with_underscores = ReplaceAll(
				route_without_spaces,
				'/',
				'_'
			)
			// And finally we create the route
			// The route doesn't include 'ROOT'

			const input_path = `${ROOT}${route}`
			const output_path = `${OUTPUT_DIR}${route_without_spaces_with_underscores}.jpg`

			if (fs.existsSync(output_path)) return

			ffmpeg.ffprobe(input_path, (err, metadata) => {
				if (err) throw err

				let duration = metadata.format.duration

				// Duration in seconds, offsets are in  milli-seconds, so
				// to take a snapshot at 10% of the file, we need to
				// multiply the duration by 100 (s * 0.1 * 1000 = ms)
				let offsets = [duration * 100]
				extractFrames({
					input: input_path,
					output: output_path,
					offsets: offsets,
				}).then(() => {
					if (ENABLE_LOGGING) {
						console.log(`Created ${output_path} from ${input_path}`)
						console.timeLog('time')
					}
				})
			})
		})
	})
}

const ExploreDirectorySync = async (pFolder = '', pPath = '') => {
	// Path to the folder, relative to the ROOT
	if (pFolder !== '' && pFolder[0] !== '/') pPath += '/'

	pPath += pFolder

	// So to read this folder, we need to concatenate the 'ROOT'
	const data = fs.readdirSync(`${ROOT}/${pPath}`)
	// Then for each file/folder inside this folder
	for (let file of data) {
		// Remove the space in the route
		let route = `${pPath}/${file}`

		let route_without_spaces = ReplaceAll(route, ' ')

		let result = fs.statSync(`${ROOT}${route}`)

		// If it is a folder, we explore it
		if (result && result.isDirectory()) {
			await ExploreDirectorySync(file, pPath)
			continue
		}

		let route_without_spaces_with_underscores = ReplaceAll(
			route_without_spaces,
			'/',
			'_'
		)
		// And finally we create the route
		// The route doesn't include 'ROOT'

		const input_path = `${ROOT}${route}`
		const output_path = `${OUTPUT_DIR}${route_without_spaces_with_underscores}.jpg`

		if (fs.existsSync(output_path)) continue

		try {
			const metadata = await ffprobe(input_path)

			let duration = metadata.format.duration

			// Duration in seconds, offsets are in  milli-seconds, so
			// to take a snapshot at 10% of the file, we need to
			// multiply the duration by 100 (s * 0.1 * 1000 = ms)
			let offsets = [duration * 100]
			await extractFrames({
				input: input_path,
				output: output_path,
				offsets: offsets,
			})

			if (ENABLE_LOGGING) {
				console.log(`Created ${output_path} from ${input_path}`)
				console.timeLog('time')
			}
		} catch (error) {
			console.log('File ', file, ' throws error')
			continue
		}
	}
}
if (ENABLE_LOGGING) {
	console.time('time')
}
// ExploreDirectory() // Might burst your PC ;)
ExploreDirectorySync()

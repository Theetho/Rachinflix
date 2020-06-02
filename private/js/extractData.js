'use strict'

const fs = require('fs')

const ENABLE_LOGGING = true

const ROOT = 'E:/Site'
// const ROOT = './data'

const { ReplaceChar, RemoveChar } = require('../../src/utils/removeChar')
const ExtractPreview = require('./extractPreview')
const ExtractThumbnail = require('./extractThumbnail')
const ExtractSubtitles = require('./extractSubtitles')

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

		let route_without_spaces = RemoveChar(route, ' ')

		let result = fs.statSync(`${ROOT}${route}`)

		// If it is a folder, we explore it
		if (result && result.isDirectory()) {
			await ExploreDirectorySync(file, pPath)
			// return
			continue
		}

		if (file.includes('.txt')) continue

		console.time('Time')
		if (ENABLE_LOGGING) console.log(`File ${file}:`)

		let route_without_spaces_with_underscores = ReplaceChar(
			route_without_spaces,
			'/',
			'_'
		)
		// And finally we create the route
		// The route doesn't include 'ROOT'

		const input_path = `${ROOT}${route}`

		try {
			let message = ''
			const preview_path = await ExtractPreview(
				input_path,
				route_without_spaces_with_underscores
			)
			if (ENABLE_LOGGING) console.log(`	Preview generated !`)
			message = await ExtractThumbnail(
				preview_path,
				route_without_spaces_with_underscores
			)
			if (ENABLE_LOGGING) console.log(`	${message}`)
			await ExtractSubtitles(input_path, route_without_spaces_with_underscores)
			console.timeEnd('Time')
			console.log('')
		} catch (error) {
			console.log(`Error: ${error}`)
			console.timeEnd('Time')
			continue
		}
	}
}

ExploreDirectorySync()

module.exports = ExtractPreview

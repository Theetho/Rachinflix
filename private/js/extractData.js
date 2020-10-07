'use strict'

const fs = require('fs')
const logger = require('../../src/logger')
const { ROOT } = require('./constants')

const { ReplaceChar, RemoveChar } = require('../../src/utils/removeChar')
const ExtractPreview = require('./extractPreview')
const ExtractThumbnail = require('./extractThumbnail')
const ExtractSubtitles = require('./extractSubtitles')

const ExtractData = async (pFolder = '', pPath = '') => {
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
			await ExtractData(file, pPath)
			// return
			continue
		}

		if (file.includes('.txt')) continue

		logger.Start('Time')
		logger.Info(`File ${file}:`)

		let route_without_spaces_with_underscores = ReplaceChar(
			route_without_spaces,
			'/',
			'_'
		)
		// And finally we create the route
		// The route doesn't include 'ROOT'

		const input_path = `${ROOT}${route}`

		try {
			const preview = await ExtractPreview(
				input_path,
				`${route_without_spaces_with_underscores}`
			)

			if (preview.generated) logger.Info(`	Preview generated !`)
			const thumbnail = await ExtractThumbnail(
				preview.path,
				`${route_without_spaces_with_underscores}`
			)

			if (thumbnail.generated) logger.Info(`	${thumbnail.message}`)
			await ExtractSubtitles(
				input_path,
				`${route_without_spaces_with_underscores}`
			)

			logger.Stop('Time')
			logger.NewLine()
		} catch (error) {
			logger.Error(error)
			logger.Stop('Time')
			continue
		}
	}
}

ExtractData()

module.exports = ExtractData

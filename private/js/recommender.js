'use strict'

const fs = require('fs')
const logger = require('../../src/logger')
const { RemoveChar } = require('../../src/utils/removeChar')

class Recommender {
	constructor(pData) {
		this.mPath = './private/recommendation/file.json'
		this.mData = pData
		this.mRecommendations = {}
		this._Load()
	}

	AddFile(pFullPath, pPath, pTime) {
		if (pPath.includes('Series') && pTime >= 90) {
			delete this.mRecommendations[pPath]
			pPath = this._FindNextEpisode(pFullPath, pPath)
			pTime = 0
		}

		this._RemovePreviousEpisodes(pPath)

		if (pPath != '' && pTime < 90) this.mRecommendations[pPath] = pTime

		this._Save()
	}

	_Load() {
		fs.readFile(this.mPath, (err, data) => {
			if (err) {
				logger.Error(err)
				return
			}
			this.mRecommendations = JSON.parse(data)
		})
	}

	_Save() {
		logger.Info(this.mRecommendations)
		logger.Info('Saving...')
		const data = JSON.stringify(this.mRecommendations)
		fs.writeFile(this.mPath, data, function (err) {
			if (err) {
				logger.Error(err)
			}
			logger.SameLine()
			logger.Info('Recommendation file saved!')
		})
	}

	_FindNextEpisode(pFullPath, pPath) {
		const path = pPath.split('/')
		const full_path = pFullPath.split('/')

		// Format: 'S${season}E${episode} - ${name}'
		const episode_as_str = path[path.length - 1].split('-')[0]

		const season = Number.parseInt(
			episode_as_str.replace(/S0*([0-9]+)E0*([0-9]+)/, '$1')
		)
		const episode = Number.parseInt(
			episode_as_str.replace(/S0*([0-9]+)E0*([0-9]+)/, '$2')
		)

		console.debug(path.length - 1, path)

		let actual_directory_path = pFullPath.replace(
			full_path[full_path.length - 1],
			''
		)
		let api_directory_path = pPath.replace(path[path.length - 1], '')

		let parent_directory = fs.readdirSync(actual_directory_path)

		// Find the next episode in the same season
		// 'episode' is 1-indexed and 'parent_directory' is 0-indexed
		if (parent_directory.length >= episode) {
			return `${api_directory_path}${RemoveChar(
				parent_directory[episode],
				' '
			)}`
		}
		// The current episode is the last of its season.
		else {
			actual_directory_path = actual_directory_path.replace(
				/Season ([0-9]+)/,
				`Season ${season + 1}`
			)

			try {
				parent_directory = fs.readdirSync(actual_directory_path)

				return `${api_directory_path}${RemoveChar(parent_directory[0], ' ')}`
			} catch (error) {
				logger.Error(`No more episode for this serie ! (${error})`)
				return ''
			}
		}
	}

	_RemovePreviousEpisodes(pPath) {
		const split = pPath.split('/')
		const directory_path = pPath.replace(split[split.length - 1], '')

		for (let key of Object.keys(this.mRecommendations)) {
			console.log(key, directory_path)
			if (key.includes(directory_path)) {
				delete this.mRecommendations[key]
			}
		}
	}
}

module.exports = Recommender

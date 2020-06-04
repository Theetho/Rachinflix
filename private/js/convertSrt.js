const INPUT_PATH = 'D:/Téléchargement/sub/SRT'
const OUTPUT_PATH = 'D:/Téléchargement/sub/VTT'
const PREFIXE = '_Series_Allamerican_Season1_'
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const logger = require('../../src/logger')

const RemoveChar = (str, char) => {
	const reducer = (accumulator, currentValue) => accumulator + currentValue
	let split = str.split(char)
	return split.reduce(reducer, '')
}

const Convert = (pPathToFile, pName) => {
	const output_path = `${OUTPUT_PATH}/${PREFIXE}${pName}.mkv_fre.vtt`

	return new Promise((resolve, reject) => {
		ffmpeg(pPathToFile)
			.outputOption([`-c webvtt`])
			.on('start', (commandLine) => {
				logger.Debug(commandLine)
			})
			.on('end', (stdout, stderr) => {
				resolve(`${output_path} created !`)
			})
			.on('error', (error, stdout, stderr) => {
				reject('Error: ', error.message, 'stderr: ', stderr, 'stdout: ', stdout)
			})
			.save(output_path)
	})
}

const Launch = async () => {
	const folder = fs.readdirSync(INPUT_PATH)
	for (let file of folder) {
		const file_name = RemoveChar(
			'S' + file.replace('All American - ', '').replace('x', 'E').split('.')[0],
			' '
		)

		const input_path = `${INPUT_PATH}/${file}`
		try {
			await Convert(input_path, file_name)
		} catch (error) {
			logger.Error(error)
		}
	}
}

Launch()

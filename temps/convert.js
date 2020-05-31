const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const ffprobe = require('ffmpeg-probe')

const ENABLE_LOGGING = true
const ROOT = 'E:/Site'
// const ROOT = './private/converts'
const OUTPUT_DIR = `./private/converts/`

let streaming_data = {}

const ReplaceAll = (pString, pSearchChar, pReplaceChar = '') => {
	let result = pString
	while (result.includes(pSearchChar)) {
		result = result.replace(pSearchChar, pReplaceChar)
	}

	return result
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

		await LogMetadata(input_path)
	}
}

const LogMetadata = async (pPath) => {
	const metadata = await ffprobe(pPath)

	for (let stream of metadata.streams) {
		if (streaming_data[stream['codec_type']] === undefined)
			streaming_data[stream['codec_type']] = {}
		if (
			streaming_data[stream['codec_type']][stream['codec_name']] === undefined
		)
			streaming_data[stream['codec_type']][stream['codec_name']] = {
				count: 0,
				files: [],
			}

		streaming_data[stream['codec_type']][stream['codec_name']].count += 1
		streaming_data[stream['codec_type']][stream['codec_name']].files.push(
			metadata.format.filename
		)
	}

	if (streaming_data['format'] === undefined) streaming_data['format'] = {}
	if (streaming_data['format'][metadata.format.format_name] === undefined)
		streaming_data['format'][metadata.format.format_name] = {
			count: 0,
			files: [],
		}
	streaming_data['format'][metadata.format.format_name].count += 1
	streaming_data['format'][metadata.format.format_name].files.push(
		metadata.format.filename
	)
}

const ConvertFileToAAC = async (pPath) => {
	const split = pPath.split('/')
	const file_name = split[split.length - 1]

	const output_path = OUTPUT_DIR + 'CONVERTED_' + file_name

	if (fs.existsSync(output_path))
		return new Promise((resolve, reject) => {
			resolve(`File ${pPath} has already been converted`)
		})

	return new Promise((resolve, reject) => {
		ffmpeg()
			.input(pPath)
			.outputOptions(['-c:v copy', '-c:a aac'])
			.on('start', (commandLine) => {
				console.log(`Converting ${pPath}.`)
			})
			.on('progress', (progress) => {
				console.log('Processing: ' + progress.percent.toFixed(2) + '% done')
			})
			.on('end', (stdout, stderr) => {
				resolve(`Created ${output_path}`)
			})
			.on('error', (error, stdout, stderr) => {
				reject('Error: ', error.message)
			})
			//.output(output_path)
			//.run()
			.save(output_path)
	})
}

const Launch = async () => {
	await ExploreDirectorySync()
	fs.writeFileSync('./logs/StreamingData.json', JSON.stringify(streaming_data))

	if (ENABLE_LOGGING)
		console.log("Created the file './logs/StreamingData.json'")

	// for (let index in streaming_data['audio']['ac3'].files) {
	// 	const file = streaming_data['audio']['ac3'].files[index]

	// 	try {
	// 		const status = await ConvertFileToAAC(file)
	// 		console.log(status)
	// 	} catch (error) {
	// 		console.log(error)
	// 	}
	// }
	// if (ENABLE_LOGGING) console.log('All the files were converted successfuly')
}

Launch()

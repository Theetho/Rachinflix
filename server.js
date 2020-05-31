'use strict'

// NPM imports
const express = require('express')
const fs = require('fs')
const ffprobe = require('ffmpeg-probe')
let app = express()

// Personnal imports
const { ReplaceChar, RemoveChar } = require('./src/utils/removeChar')
const ExtractSubtitles = require('./private/js/extractSubtitles')
const ExtractInfo = require('./private/js/extractInfo')
const ConvertFile = require('./private/js/convertFile')

// Constants
const ENABLE_LOGGING = true

const port = '8080'
const root = './data'
//const root = 'E:/Site'

app.set('views', './private/views')
app.set('view engine', 'ejs')

app.use('/public', express.static(__dirname + '/public'))

// Render the index on load
app.get('/', (req, res) => {
	res.render('index')
})

// Explore recursively the 'root' folder, and store every file and folder it contains
// into 'target', which is returned at the end. Also create two routes for every file:
// One for its thumbnail, one for the file itself.
const GetFolderData = (
	pTarget = {},
	pFolder = '',
	pPath = '',
	pParent = ''
) => {
	// Path to the folder is relative to the root
	if (pFolder !== '' && pFolder[0] !== '/') pPath += '/'

	pPath += pFolder

	// So to read this folder, we concatenate the 'root'
	let data = fs.readdirSync(`${root}${pPath}`)

	// Then for each file or folder inside this folder
	data.forEach((file) => {
		if (file.includes('.txt')) return

		pTarget[file] = {
			isDirectory: false,
			isFile: false,
			children: {},
			parent: pParent,
		}

		// We store the complete route to this file or folder
		let route = `${pPath}/${file}`

		let route_without_spaces = RemoveChar(route, ' ')
		let route_without_spaces_with_underscore = ReplaceChar(
			route_without_spaces,
			'/',
			'_'
		)
		let file_path = `${root}${route}`
		let file_stats = fs.statSync(file_path)

		// If it is a folder, we explore it
		if (file_stats && file_stats.isDirectory()) {
			pTarget[file].isDirectory = true
			// The files or folders inside of it will be stored as its children
			GetFolderData(pTarget[file].children, file, pPath, file)
			// Else we mark it as a file and create routes to it
		} else if (file_stats && file_stats.isFile()) {
			pTarget[file].isFile = true
			// Route for thumbnails
			app.get(`/thumbnail:${route_without_spaces}`, (req, res) => {
				if (ENABLE_LOGGING) {
					console.log(`Request for the thumbnail of ${route_without_spaces}`)
				}

				fs.readFile(
					`./public/temps/${route_without_spaces_with_underscore}.jpg`,
					(err, data) => {
						if (err) {
							console.log(err)
							return
						}
						res.writeHead(200, { 'Content-Type': 'image/jpeg' })
						res.end(data)
					}
				)
			})
			// Route for subtitles
			app.get(
				`/subtitles:${route_without_spaces}/:language`,
				async (req, res) => {
					await ExtractSubtitles(
						file_path,
						route_without_spaces_with_underscore
					)

					console.log('Request for subtitles: ' + req.params.language)

					const subtitles_path = `/public/subtitles/${route_without_spaces_with_underscore}_${req.params.language}.vtt`

					if (fs.existsSync('.' + subtitles_path)) {
						console.log('File exist. Sending it !')
						res.sendFile(__dirname + subtitles_path)
					} else {
						console.log('File does not exist !')
						res.writeHead(404)
						res.end()
					}
				}
			)

			// Route for videos
			app.get(
				[route_without_spaces, `${route_without_spaces}/:language`],
				async (req, res) => {
					// if (ENABLE_LOGGING) {
					// 	console.log(`Request for ${route_without_spaces}`)
					// }

					const language = req.params.language || 'eng'

					// From https://www.itechnoadvisor.com/video-streaming-in-nodejs/
					let file_path_copy = JSON.parse(JSON.stringify(file_path))
					let split = file_path_copy.split('.')
					const file_extension = split[split.length - 1]
					let file_size = fs.statSync(file_path).size

					const infos = await ExtractInfo(file_path)

					if (!infos.readable) {
						infos.language = language
						file_path_copy = await ConvertFile(file_path, infos)
					}

					const range = req.headers.range
					const converted_file_size = fs.statSync(file_path_copy).size
					// If the converted file is bigger than the original, then it becomes
					// the file size
					file_size = Math.max(file_size, converted_file_size)

					let head, status

					if (range) {
						const parts = range.replace(/bytes=/, '').split('-')
						const start = parseInt(parts[0], 10)

						// Converted file is lighter than original file. So the client
						// will continue asking for parts even after the converted file
						// is finished. In that case, we end the response
						if (converted_file_size === start) {
							res.status(200).end()
							return
						}

						const end = parts[1] ? parseInt(parts[1], 10) : file_size - 1
						const chunksize = end - start + 1
						head = {
							'Content-Range': `bytes ${start}-${end}/${file_size}`,
							'Accept-Ranges': 'bytes',
							'Content-Length': chunksize,
							'Content-Type': `video/${file_extension}`,
						}

						if (ENABLE_LOGGING) {
							console.log({
								request: { start: parts[0], end: parts[1] },
								response: { start: start, end: end },
								size: {
									initial: file_size,
									now: converted_file_size,
								},
							})
						}

						res.writeHead(206, head)
						fs.createReadStream(file_path_copy, { start, end }).pipe(res)
					} else {
						if (ENABLE_LOGGING) {
							console.log('Sending full info')
						}

						const head = {
							'Content-Length': file_size,
							'Content-Type': `video/${file_extension}`,
						}

						// const head = JSON.stringify({
						// 	'Access-Control-Allow-Origin': '*',
						// 	Connection: 'Keep-Alive',
						// 	'Content-Type': `video/${file_extension}`,
						// })

						res.writeHead(200, head)
						fs.createReadStream(file_path_copy).pipe(res)
					}
				}
			)
		}
	})

	return pTarget
}

let folderData = GetFolderData()

// Send the 'Root folder' hierarchie
app.get('/data', (req, res) => {
	res.send(JSON.stringify(folderData))
})

// app.get(['/pipe', '/pipe/:timestamp'], (req, res) => {
// 	const timestamp = req.params.timestamp || 0

// 	const input_path =
// 		//	'./data/Series/All american/Season 2/S02E02 - Speak Ya Clout.mkv'
// 		'./unused/GOT1.mkv'
// 	// 	'./data/Series/All american/Season 2/S02E04 - They Reminisce Over You.mkv'

// 	let split = input_path.split('/')
// 	const file_name = split[split.length - 1]
// 	split = file_name.split('.')
// 	const file_extension = split[split.length - 1]

// 	const output_path = './private/streams/CONVERTED_' + file_name

// 	const StreamVideo = () => {
// 		console.log(content_size)

// 		const stat_input = fs.statSync(input_path)
// 		const stat_ouput = fs.statSync(output_path)

// 		const file_size = Math.max(stat_input.size, stat_ouput.size)
// 		const range = req.headers.range

// 		if (range) {
// 			const parts = range.replace(/bytes=/, '').split('-')
// 			const start = parseInt(parts[0], 10)
// 			const end = parts[1]
// 				? parseInt(parts[1], 10)
// 				: content_size /* file_size */ - 1
// 			const chunksize = end - start + 1
// 			const file = fs.createReadStream(output_path, { start, end })
// 			const head = {
// 				'Content-Range': `bytes ${start}-${end}/${
// 					content_size /* file_size */
// 				}`,
// 				'Accept-Ranges': 'bytes',
// 				'Content-Length': chunksize,
// 				'Content-Type': `video/${file_extension}`,
// 			}

// 			console.log(
// 				`bytes ${start}-${end}/${content_size /* file_size */}`,
// 				chunksize
// 			)

// 			res.writeHead(206, head)
// 			file.pipe(res)
// 		} else {
// 			const head = {
// 				'Content-Length': file_size,
// 				'Content-Type': `video/${file_extension}`,
// 			}
// 			res.writeHead(200, head)
// 			fs.createReadStream(output_path).pipe(res)
// 		}
// 	}

// 	if (!fs.existsSync(output_path) /* || timestamp > 0 */) {
// 		console.log('Request, timeout')

// 		CreateFileToStream(input_path, output_path)

// 		setTimeout(() => {
// 			StreamVideo()
// 		}, 2000)
// 	} else {
// 		console.log('Request, NO timeout')

// 		StreamVideo()
// 	}
// })

// From https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
const os = require('os')
const ifaces = os.networkInterfaces()
let addresses = {}

for (let ifname of Object.keys(ifaces)) {
	let alias = 0

	for (let iface of ifaces[ifname]) {
		if ('IPv4' !== iface.family || iface.internal !== false) {
			// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
			continue
		}

		if (alias >= 1) {
			// this single interface has multiple ipv4 addresses
			addresses[ifname + ':' + alias] = iface.address
		} else {
			// this interface has only one ipv4 adress
			addresses[ifname] = iface.address
		}

		++alias
	}
}

app.listen(port, () => {
	console.log(`Site lancé sur '${addresses['Ethernet']}:${port}'`)
})

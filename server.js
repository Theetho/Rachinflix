'use strict'

// NPM imports
const express = require('express')
const fs = require('fs')
let app = express()

// Personnal imports
const { ReplaceChar, RemoveChar } = require('./src/utils/removeChar')
const ExtractInfo = require('./private/js/extractInfo')
const Streamer = require('./private/js/streamer')

// Constants
const ENABLE_LOGGING = false
const PATH_TO_THUMBNAILS = '/public/thumbnails' // temps'
const PATH_TO_SUBTITLES = '/public/subtitles' // temps'
const PATH_TO_PREVIEWS = '/public/previews' // temps'

const port = '8080'
//const root = './data'
const root = 'E:/Site'
const streamer = new Streamer()

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
					`.${PATH_TO_THUMBNAILS}/${route_without_spaces_with_underscore}.jpg`,
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
					// await ExtractSubtitles(
					// 	file_path,
					// 	route_without_spaces_with_underscore
					// )

					console.log('Request for subtitles: ' + req.params.language)

					const subtitles_path = `${PATH_TO_SUBTITLES}/${route_without_spaces_with_underscore}_${req.params.language}.vtt`

					console.log(subtitles_path)

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
			app.get(`/preview:${route_without_spaces}`, (req, res) => {
				if (ENABLE_LOGGING) {
					console.log(`Request for the preview of ${route_without_spaces}`)
				}

				fs.readFile(
					`.${PATH_TO_PREVIEWS}/${route_without_spaces_with_underscore}.mkv`,
					(err, data) => {
						if (err) {
							console.log(err)
							return
						}
						res.writeHead(200, { 'Content-Type': 'video/mkv' })
						res.end(data)
					}
				)
			})
			// Route for previews
			// Route for videos
			app.get(
				[route_without_spaces, `${route_without_spaces}/:language`],
				async (req, res) => {
					if (ENABLE_LOGGING) {
						console.log(`Request for ${route_without_spaces}`)
					}

					const language = req.params.language || 'eng'

					// From https://www.itechnoadvisor.com/video-streaming-in-nodejs/
					let file_path_copy = JSON.parse(JSON.stringify(file_path))
					let split = file_path_copy.split('.')
					const file_extension = split[split.length - 1]
					let file_size = fs.statSync(file_path).size

					const infos = await ExtractInfo(file_path)

					if (!infos.readable) {
						infos.language = language
						file_path_copy = await streamer.ConvertFile(file_path, infos)
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
						fs.createReadStream(file_path_copy, { start, end })
							.pipe(res)
							.on('drain', () => {
								console.log('FS1: draining the stream')
							})
							.on('pipe', () => {
								console.log('FS1: piping the stream')
							})
							.on('close', () => {
								console.log('FS1: closing the stream')
							})
							.on('unpipe', () => {
								console.log('FS1: unpiping the stream')
							})
							.on('finish', () => {
								console.log('FS1: finish the stream')
							})
							.on('error', () => {
								console.log('FS1: error the stream')
							})
					} else {
						if (ENABLE_LOGGING) {
							console.log('Sending full info')
						}

						const head = {
							'Content-Length': file_size,
							'Content-Type': `video/${file_extension}`,
						}

						res.writeHead(200, head)
						fs.createReadStream(file_path_copy)
							.pipe(res)
							.on('drain', () => {
								console.log('FS2: draining the stream')
							})
							.on('pipe', () => {
								console.log('FS2: piping the stream')
							})
							.on('close', () => {
								console.log('FS2: closing the stream')
							})
							.on('unpipe', () => {
								console.log('FS2: unpiping the stream')
							})
							.on('finish', () => {
								console.log('FS2: finish the stream')
							})
							.on('error', () => {
								console.log('FS2: error the stream')
							})
					}
				}
			)
			// Notify the server when a video is stoped/closed
			app.get(`${route_without_spaces}/:language/end`, (req, res) => {
				streamer.StopConverting(file_path)
			})
		}
	})

	return pTarget
}

let folderData = GetFolderData()

// Send the 'Root folder' hierarchie
app.get('/data', (req, res) => {
	res.send(JSON.stringify(folderData))
})

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

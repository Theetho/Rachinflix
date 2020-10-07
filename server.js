'use strict'

// NPM imports
const express = require('express')
const fs = require('fs')
let app = express()

// Personnal imports
const { ReplaceChar, RemoveChar } = require('./src/utils/removeChar')
const ExtractInfo = require('./private/js/extractInfo')
const Streamer = require('./private/js/streamer')
const Recommender = require('./private/js/recommender')
const logger = require('./src/logger')
logger.SetLevel(3)

// Constants
const {
	ROOT,
	PATH_THUMBNAILS,
	PATH_SUBTITLES,
	PATH_PREVIEWS,
} = require('./private/js/constants')

const port = '8080'

const streamer = new Streamer()
let recommender = {}

app.set('views', './private/views')
app.set('view engine', 'ejs')

app.use('/public', express.static(__dirname + '/public'))

// Render the index on load
app.get('/', (req, res) => {
	res.render('index')
})

app.get('/test', (req, res) => {
	res.render('test')
})

// Explore recursively the 'ROOT' folder, and store every file and folder it contains
// into 'target', which is returned at the end. Also create two routes for every file:
// One for its thumbnail, one for the file itself.
const GetFolderData = (
	pTarget = {},
	pFolder = '',
	pPath = '',
	pParent = ''
) => {
	// Path to the folder is relative to the ROOT
	if (pFolder !== '' && pFolder[0] !== '/') pPath += '/'

	pPath += pFolder

	// So to read this folder, we concatenate the 'ROOT'
	let data = fs.readdirSync(`${ROOT}${pPath}`)

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
		let file_path = `${ROOT}${route}`
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
				logger.Debug(`Request for the thumbnail of ${route_without_spaces}`)

				fs.readFile(
					`.${PATH_THUMBNAILS}/${route_without_spaces_with_underscore}.jpg`,
					(err, data) => {
						if (err) {
							logger.Error(err)
							fs.readFile(`./public/res/error.png`, (error, placeholder) => {
								if (error) {
									logger.Error(error)
								}
								res.writeHead(200, { 'Content-Type': 'image/png' })
								res.end(placeholder)
							})
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
					logger.Info('Request for subtitles: ' + req.params.language)

					const subtitles_path = `${PATH_SUBTITLES}/${route_without_spaces_with_underscore}_${req.params.language}.vtt`

					if (fs.existsSync('.' + subtitles_path)) {
						logger.Info('File exists. Sending it !')
						res.sendFile(__dirname + subtitles_path)
					} else {
						logger.Info('File does not exist !')
						res.writeHead(404)
						res.end()
					}
				}
			)
			// Route for previews
			app.get(`/preview:${route_without_spaces}`, (req, res) => {
				logger.Debug(`Request for the preview of ${route_without_spaces}`)

				fs.readFile(
					`.${PATH_PREVIEWS}/${route_without_spaces_with_underscore}.mkv`,
					(err, data) => {
						if (err) {
							logger.Error(err)
							return
						}
						res.writeHead(200, { 'Content-Type': 'video/mkv' })
						res.end(data)
					}
				)
			})
			// Route for videos
			app.get(
				[route_without_spaces, `${route_without_spaces}/:language`],
				async (req, res) => {
					logger.Debug(`Request for ${route_without_spaces}`)

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
					let converted_file_size = 0

					try {
						converted_file_size = fs.statSync(file_path_copy).size
					} catch (error) {
						logger.Error(error)
						res.status(404).end()
						return
					}
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

						logger.Debug({
							request: { start: parts[0], end: parts[1] },
							response: { start: start, end: end },
							size: {
								initial: file_size,
								now: converted_file_size,
							},
						})

						res.writeHead(206, head)
						fs.createReadStream(file_path_copy, { start, end }).pipe(res)
					} else {
						const head = {
							'Content-Length': file_size,
							'Content-Type': `video/${file_extension}`,
						}

						res.writeHead(200, head)
						fs.createReadStream(file_path_copy).pipe(res)
					}
				}
			)
			// Notify the server when a video is stoped/closed
			app.get(`${route_without_spaces}/:language/end/:progress`, (req, res) => {
				streamer.StopConverting(file_path)
				// We consider the file entirely watched when the user
				// has seen more than 90%. So we store the next one
				recommender.AddFile(
					file_path,
					route_without_spaces,
					req.params.progress
				)
			})
		}
	})

	return pTarget
}

let folderData = GetFolderData()
recommender = new Recommender(folderData)

// Send the 'ROOT folder' hierarchie
app.get('/data', (req, res) => {
	res.send(JSON.stringify(folderData))
})

app.get('/recommendation', (req, res) => {
	res.send(JSON.stringify(recommender.mRecommendations))
})

// app.get('/user-disconnected', (req, res) => {
// 	recommender.Save()
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

app.listen(port, addresses['Ethernet'], () => {
	logger.Info(`Site lancé sur '${addresses['Ethernet']}:${port}'`)
})

// app.listen(port, '127.0.0.1', () => {
// 	logger.Info(`Site lancé sur 127.0.0.1:${port}'`)
// })

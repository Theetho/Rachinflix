// NPM imports
const fs = require('fs')
const express = require('express')
const session = require('express-session')
const app = express()
const path = require('path')
const body_parser = require('body-parser')
const json_parser = body_parser.json({ limit: '50mb' })
const uuidv4 = require('uuid').v4

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
)

const { ROOT_SPRITES, ROOT_SUBTITLES, ROOT_THUMBNAILS, ROOT_TRAILERS } = require('./src/constantsServer')

const { Streamer } = require('./src/streamer')
const streamer = new Streamer()

const logger = require('./src/logger')
logger.SetLevel(3)

const JSONDataBase = require('./src/bdd/JsonDB/JsonDB')
const JSONdatabase = new JSONDataBase()

const { USER_DB, User } = require('./src/User')
const users = []

// From https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
const os = require('os')
const ifaces = os.networkInterfaces()
let addresses = {}
const port = '8080'

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
//app.listen('3080', 'localhost', () => {
//  console.log(`Serveur lancé sur 'localhost:3080'`)
//})

app.use(express.static(path.join(__dirname, './dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/index.html'))
})

app.post('/api/login', json_parser, (req, res) => {
  const user_id = req.body.userid

  const index = USER_DB.getIndex(`/users`, user_id)

  if (index == -1) {
    logger.Info(`User id '${user_id}' n'existe pas`)
    response
      .head(404)
      .send(`User id '${user_id}' n'existe pas`)
      .end()
  }

  users[user_id] = new User(user_id, JSONdatabase)
  req.session.userid = user_id

  res.writeHead(200).end()
})
app.get('/api/logout', (req, res) => {
  const user_id = req.session.userid

  delete users[user_id]

  res.writeHead(200).end()
})
app.post('/api/user/create', json_parser, (req, res) => {
  const user = Object.assign(
    {
      id: uuidv4(),
      registry: {
        films: [],
        series: [],
      },
    },
    req.body.user
  )

  USER_DB.push('/users[]', user)

  res.send(`User ${user.name} created !`)
})
app.post('/api/user/:userid', json_parser, (req, res) => {
  const user_id = req.params.userid
  const user = req.body.user

  const user_db = USER_DB.getData(`/users[${USER_DB.getIndex('/users', user_id)}]`)

  Object.assign(user_db, user)
  users[user_id] = user_db

  USER_DB.save()

  res.send(user_db)
})
app.get('/api/users', (req, res) => {
  res.send(USER_DB.getData('/users'))
})
app.get('/api/sprite/count', (req, res) => {
  res.send({ count: 258 })
})
app.get('/api/sprite/:id', (req, res) => {
  const id = Number.parseInt(req.params.id)

  const path = `${ROOT_SPRITES}/${id < 100 ? (id < 10 ? '00' : '0') : ''}${id}.png`

  fs.readFile(path, (err, data) => {
    if (err) {
      logger.Error(err)
      res.send({})
      return
    }
    res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(data)
  })
})

app.get('/api/collections/:language', (req, res) => {
  const language = req.params.language

  const films = JSONdatabase.GetAllFilms(language)
  const series = JSONdatabase.GetAllSeries(language)

  const collections = {
    Films: [],
    Series: [],
  }

  for (let film of films) {
    const univers = film.image.split('/').filter((e) => {
      return e != '' && e != 'Films' && !e.includes('.jpg')
    })

    const main_univers = univers[0]

    let saved_univers = collections.Films.find((e) => {
      return e.title == main_univers
    })

    if (!saved_univers) {
      saved_univers = collections.Films[collections.Films.push({ title: main_univers, items: [] }) - 1]
    }

    saved_univers.items.push({ title: film.title, univers: univers })
  }

  for (let serie of series) {
    collections.Series.push(serie.title)
  }

  res.send(collections)
})
/**
 * @brief Send the number of file in the database.
 */
app.get('/api/count', (req, res) => {
  const count = JSONdatabase.GetFilmCount() + JSONdatabase.GetSerieCount()

  res.send({ count })
})
/**
 * @brief Send the informations (name, univers) of a file.
 */
app.get('/api/info/:id/:language', (req, res) => {
  let id = Number.parseInt(req.params.id)
  let language = req.params.language
  const user_id = req.session.userid

  let { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)

  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const type = id >= JSONdatabase.GetFilmCount() ? 'serie' : 'film'

  if (type == 'film') {
    const film = JSONdatabase.GetFilm(language, id)
    const title = film.title
    res.send({ title, type })
  } else if (type == 'serie') {
    const { serie, episode } = JSONdatabase.GetEpisode(language, id, season_number, episode_number)
    const univers = serie.title
    const title = episode.title
    res.send({ univers, title, type, episode: episode_number || episode.number, season: season_number || episode.season_number })
  }
})
app.get('/api/type/:id', (req, res) => {
  let id = Number.parseInt(req.params.id)

  res.send({ type: id >= JSONdatabase.GetFilmCount() ? 'serie' : 'film' })
})
app.get('/api/browse/film/:id/:language', (req, res) => {
  let id = Number.parseInt(req.params.id)
  let language = req.params.language

  const element = JSONdatabase.GetFilm(language, id)

  const title = element.title
  const date = element.release_date.split('/')[2] || element.release_date.split('-')[0]
  const genres = JSONdatabase.GetGenres(language, element.genres)
  const overview = element.overview

  res.send({ title, date, genres, overview, season: null })
})
app.get('/api/browse/serie/:id/:language', (req, res) => {
  let id = Number.parseInt(req.params.id)
  let language = req.params.language
  const user_id = req.session.userid

  let { season_number } = _GetSeasonAndEpisode(id, user_id)

  season_number = req.query.season || season_number

  const { serie, season } = JSONdatabase.GetSeason(language, id, season_number)

  const title = serie.title
  const date = season.release_date.split('/')[2]
  const genres = JSONdatabase.GetGenres(language, serie.genres)
  const overview = season.overview || serie.overview
  const seasons_available = serie.seasons.map((e) => {
    return { number: e.number, episode_count: JSONdatabase.GetSeason(language, id, e.number).season.episode_count }
  })
  season.episodes = season.episodes
    .map((e) => {
      let episode = JSONdatabase.GetEpisode(language, id, season.number, e.number).episode

      if (episode.overview == '') {
        episode = JSONdatabase.GetEpisode(language == 'eng-US' ? 'fre-FR' : 'eng-US', id, season.number, e.number).episode
      }

      return Object.assign(episode, { duration: JSONdatabase.GetFile(episode.id).duration })
    })
    .sort((e1, e2) => {
      return e1.number < e2.number ? -1 : 1
    })

  res.send({ title, date, genres, overview, seasons_available, season })
})
/**
 * @brief Send the thumbnail of an episode.
 */
app.get('/api/thumbnail/:id/:season/:episode', (req, res) => {
  const id = Number.parseInt(req.params.id)
  const season_number = Number.parseInt(req.params.season)
  const episode_number = Number.parseInt(req.params.episode)
  let language = 'eng-US'

  const { episode } = JSONdatabase.GetEpisode(language, id, season_number, episode_number)

  let path = `${ROOT_THUMBNAILS}${episode.image}`

  fs.readFile(path, (err, data) => {
    if (err) {
      logger.Error(err)
      res.send({})
      return
    }
    res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(data)
  })
})
/**
 * @brief Send the poster of a serie or film.
 */
app.get('/api/poster/:id/:language', (req, res) => {
  const id = Number.parseInt(req.params.id)
  let language = req.params.language
  const user_id = req.session.userid

  let { season_number } = _GetSeasonAndEpisode(id, user_id)

  const file = JSONdatabase.GetFilm(language, id) || JSONdatabase.GetSerie(language, id)

  if (!file) {
    res.send({})
    return
  }

  let path = `${ROOT_THUMBNAILS}${file.image}`
  if (!fs.existsSync(path)) {
    let { season } = JSONdatabase.GetSeason(language, id, season_number)
    path = `${ROOT_THUMBNAILS}${season.image}`
  }

  fs.readFile(path, (err, data) => {
    if (err) {
      logger.Info(`No poster for the id '${id}'`)
      res.send({})
      return
    }
    res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(data)
  })
})
/**
 * @brief Send the trailer of a serie or film.
 */
app.get('/api/trailer/:id/:language', (req, res) => {
  const id = Number.parseInt(req.params.id)
  let language = req.params.language
  const user_id = req.session.userid

  let { season_number } = _GetSeasonAndEpisode(id, user_id)

  season_number = req.query.season || season_number

  let file = JSONdatabase.GetFilm(language, id) || JSONdatabase.GetSerie(language, id)

  if (!file) {
    res.writeHead(404).end()
    return
  }

  let path = `${ROOT_TRAILERS}${file.video}`
  if (!fs.existsSync(path)) {
    let { season } = JSONdatabase.GetSeason(language, id, season_number)
    path = `${ROOT_TRAILERS}${season.video}`
  }

  fs.readFile(path, (err, data) => {
    if (err) {
      logger.Failure(`No trailer for the id '${id}'`)
      res.writeHead(404).end()
      return
    }
    res.writeHead(200, { 'Content-Type': 'video/mkv' }).end(data)
  })
})
/**
 * @brief Send to the client every subtitle language
 *        available for a file.
 */
app.get('/api/subtitles/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id)
  const user_id = req.session.userid
  const language = 'eng-US'

  let { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)
  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const file = JSONdatabase.GetFile((JSONdatabase.GetFilm(language, id) || JSONdatabase.GetEpisode(language, id, season_number, episode_number).episode).id)

  res.send(file.subtitles)
})
/**
 * @brief Send to the client every audio language
 *        available for a file.
 */
app.get('/api/languages/:id', async (req, res) => {
  const id = Number.parseInt(req.params.id)
  const user_id = req.session.userid
  const language = 'eng-US'

  let { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)
  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const file = JSONdatabase.GetFile((JSONdatabase.GetFilm(language, id) || JSONdatabase.GetEpisode(language, id, season_number, episode_number).episode).id)

  res.send(file.audio)
})
/**
 * @brief Send the subtitle with the correct language (if exists)
 */
app.get('/api/subtitle/:id/:index', (req, res) => {
  const id = Number.parseInt(req.params.id)
  const index = Number.parseInt(req.params.index)
  const user_id = req.session.userid
  const language = 'eng-US'

  let { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)
  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const file = JSONdatabase.GetFile((JSONdatabase.GetFilm(language, id) || JSONdatabase.GetEpisode(language, id, season_number, episode_number).episode).id)

  if (!file) {
    logger.Info('the requested file does not exist !')
    res.writeHead(404)
    res.end()
    return
  }

  const path = `${ROOT_SUBTITLES}${file.paths.local.replace('.mkv', `_${index}.vtt`)}`

  if (fs.existsSync(path)) {
    logger.Info('File exists. Sending it !')
    res.sendFile(path)
  } else {
    logger.Info('File does not exist !')
    res.send([])
  }
})
/**
 * @brief Send the actual file (video).
 */
app.get('/api/file/:id/:language', async (req, res) => {
  const language = req.params.language
  const id = Number.parseInt(req.params.id)
  const user_id = req.session.userid

  let { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)
  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  // With only want the file path, so we don't need to use the requested language to get it.
  const file = JSONdatabase.GetFile((JSONdatabase.GetFilm('eng-US', id) || JSONdatabase.GetEpisode('eng-US', id, season_number, episode_number).episode).id)
  let path = file.paths.absolute

  let size = fs.statSync(path).size

  let converted_file = { completed: false }
  // If the file can't be read by the naviguator
  if (file.audio.length > 1 || file.video.needs_transcoding || file.audio[0].needs_transcoding) {
    // We have to convert it
    converted_file = await streamer.ConvertFile(file, language)
    path = converted_file.path
  }

  const range = req.headers.range

  try {
    var converted_size = fs.statSync(path).size
  } catch (error) {
    logger.Error(error)
    res.status(404).end()
    return
  }
  // If the converted file is bigger than the original, then it becomes
  // the file size
  // if (converted_file && converted_file.completed) size = converted_size
  // else
  size = converted_file.completed ? converted_size : Math.max(size, converted_size)

  let head

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)

    // Converted file is lighter than original file. So the client
    // will continue asking for parts even after the converted file
    // is finished. In that case, we end the response
    if (converted_size === start) {
      res.status(200).end()
      return
    }

    const end = parts[1] ? parseInt(parts[1], 10) : size - 1
    const chunksize = end - start + 1
    head = {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': `video/mkv`,
    }

    res.writeHead(206, head)
    fs.createReadStream(path, { start, end }).pipe(res)
  } else {
    const head = {
      'Content-Length': size,
      'Content-Type': `video/mkv`,
    }

    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})
/**
 * @brief Send the time where the client stopped last time.
 */
app.get('/api/beginning/:id', (req, res) => {
  const id = Number.parseInt(req.params.id)
  const user_id = req.session.userid

  let { episode_number, season_number, user } = _GetSeasonAndEpisode(id, user_id)

  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const language = 'eng-US'

  let time = 0

  const type = id >= JSONdatabase.GetFilmCount() ? 'serie' : 'film'
  if (type == 'serie') {
    const episode = user.GetEpisode(JSONdatabase.GetSerie(language, id).id)
    if (episode && episode.season == season_number && episode.episode == episode_number) time = episode.time
  } else if (type == 'film') {
    const film = user.GetFilm(JSONdatabase.GetFilm(language, id).id)
    if (film) time = film.time
  }

  res.send({ time })
})
/**
 * @brief Update the profil's saver with the current progress for the file.
 */
app.get('/api/progress/:id/:progress', (req, res) => {
  const id = Number.parseInt(req.params.id)
  const progress = req.params.progress
  const user_id = req.session.userid
  const language = 'eng-US'

  let { episode_number, season_number, user } = _GetSeasonAndEpisode(id, user_id)

  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const type = id >= JSONdatabase.GetFilmCount() ? 'serie' : 'film'

  if (type == 'serie') {
    const { serie, season, episode } = JSONdatabase.GetEpisode(language, id, season_number, episode_number)
    const download_next = user.RegisterSerie(id, serie, season, episode, progress)

    if (download_next) _DownloadNextEpisode(id, user_id)
  } else if (type == 'film') {
    const film = JSONdatabase.GetFilm(language, id)
    user.RegisterFilm(film, progress)
  } else {
    logger.Error(`This file has no supported type. Type = ${type}`)
  }

  res.end()
})
/**
 * @brief Stop the streaming for the file.
 */
app.get('/api/end/:id', async (req, res) => {
  let id = Number.parseInt(req.params.id)
  const user_id = req.session.userid

  let { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)

  season_number = req.query.season || season_number
  episode_number = req.query.episode || episode_number

  const language = 'eng-US'

  const file = JSONdatabase.GetFile((JSONdatabase.GetFilm(language, id) || JSONdatabase.GetEpisode(language, id, season_number, episode_number).episode).id)

  streamer.StopConverting(file)
})
/**
 * @brief Send the file registered for the user.
 */
app.get('/api/profil/continue', (req, res) => {
  const user_id = req.session.userid
  const user = users[user_id]

  res.send(user.GetIndexesOfRegisteredFiles())
})

function _GetSeasonAndEpisode(id, user_id) {
  const type = id >= JSONdatabase.GetFilmCount() ? 'serie' : 'film'
  const language = 'eng-US'
  const user = users[user_id]

  if (type != 'serie') return { episode_number: null, season_number: null, user }

  const serie = JSONdatabase.GetSerie(language, id)

  if (!serie) return { episode_number: null, season_number: null, user }

  const serie_registered = user.GetEpisode(serie.id)

  if (!serie_registered) return { episode_number: null, season_number: null, user }

  return { episode_number: serie_registered.episode, season_number: serie_registered.season, user }
}

function _DownloadNextEpisode(id, user_id) {
  const { episode_number, season_number } = _GetSeasonAndEpisode(id, user_id)
  const language = 'eng-US'

  const file = JSONdatabase.GetFile((JSONdatabase.GetFilm(language, id) || JSONdatabase.GetEpisode(language, id, season_number, episode_number).episode).id)

  // If the file can't be read by the naviguator
  if (file.audio.length > 1 || file.video.needs_transcoding || file.audio[0].needs_transcoding) {
    // We have to convert it
    streamer.ConvertFile(file, language)
  }

  // Else we do nothing
}

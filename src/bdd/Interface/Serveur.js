const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const express = require('express')
const app = express()
const router = express.Router()
const body_parser = require('body-parser')
const json_parser = body_parser.json({ limit: '50mb' })
const port = '6080'

const LANGAGES = ['en-US', 'fr-FR']
const LANGAGES_DB = { 'en-US': 'eng-US', 'fr-FR': 'fre-FR' }

const JSONDataBase = require('../JsonDB/JsonDB')
const db = new JSONDataBase()._db

const { ExtractFromFiles } = require('../../ExtractFromFiles')

const Fichier = require('../Fichier')
const Film = require('../Film')
const Serie = require('../Serie')
const Saison = require('../Saison')
const Episode = require('../Episode')
const Image = require('../Image')
const Video = require('../Video')
const TMDB = require('../../../tmdb/TMDB')
const logger = require('../../logger')

var nouveaux_pour_le_serveur = { episodes: [], saisons: {} }

app.use('/', router)

const MakeBackup = require('./MakeBackup')

MakeBackup(db).then(() => {
  app.listen(port, 'localhost', () => {
    console.log(`Interface lancée sur 'localhost:${port}'`)
  })
})

router.get('/', (requete, reponse) => {
  reponse.sendFile(path.join(__dirname + '/index.html'))
})
router.get('/style', (requete, reponse) => {
  reponse.sendFile(path.join(__dirname + '/style.css'))
})
router.get('/news', (requete, reponse) => {
  reponse.sendFile(path.join(__dirname + '/nouveau_fichier.html'))
})
router.get('/nouveau_fichier_js', (requete, reponse) => {
  reponse.sendFile(path.join(__dirname + '/nouveau_fichier.js'))
})
router.post('/ajout/fichier', json_parser, (req, res) => {
  const fichier = req.body.fichier

  const added = Fichier.EnregistrerUnFichier(db, fichier)

  if (!added) {
    res.send(`Fichier déjà dans la base de donnée.`)
    return
  }

  res.send(`Fichier '${fichier.title}' a bien été ajouté à la base de donnée !`)
})
router.post('/ajout/film', json_parser, async (req, res) => {
  const fichier = req.body.fichier
  const resultat = req.body.resultat
  const langue = LANGAGES_DB[req.body.langue]

  const added = Film.EnregisterUnFilm(db, fichier, resultat, langue)

  if (!added) {
    res.send(`Film déjà dans la base de donnée.`)
    return
  }

  await Video.TelechargerUneBandeAnnonce(
    resultat.trailer_path,
    fichier.paths.local
      .split('/')
      .filter((element) => {
        return !element.includes('.mkv')
      })
      .join('/'),
    fichier.title.replace('.mkv', ''),
    langue
  )
  await Image.TelechargerLaMiniature(
    resultat.poster_path,
    fichier.paths.local
      .split('/')
      .filter((element) => {
        return !element.includes('.mkv')
      })
      .join('/'),
    fichier.title.replace('.mkv', ''),
    langue
  )

  res.send(`Film '${fichier.title}' (${langue}) a bien été ajouté à la base de donnée !`)
})
router.post('/ajout/serie', json_parser, async (req, res) => {
  const fichier = req.body.fichier
  const resultat = req.body.resultat
  const langue = LANGAGES_DB[req.body.langue]

  const added = Serie.EnregisterUneSerie(db, fichier, resultat, langue)

  if (!added) {
    res.send(`Série déjà dans la base de donnée.`)
    return
  }

  // await Video.TelechargerUneBandeAnnonce(resultat.trailer_path, `/Series/${fichier.title}`, 'Trailer', langue)
  await Image.TelechargerLaMiniature(resultat.poster_path, `/Series/${fichier.title}`, 'Poster', langue)

  res.send(`Serie '${fichier.title}' (${langue}) a bien été ajouté à la base de donnée !`)
})

let nouveaux_fichiers = null
router.get('/nouveaux', async (requete, reponse) => {
  nouveaux_fichiers = await Fichier.LancerAnalyseDesNouveauxFichiers(db)

  if (!nouveaux_fichiers) {
    reponse.send({ aucun_nouveaux: true })
    return
  }

  reponse.send(AjouterSeriesEtSaisons(nouveaux_fichiers))
})

router.get('/ajouts-termines', async (req, res) => {
  for (const saison of Object.values(nouveaux_pour_le_serveur.saisons)) {
    const informations = await ObtenirLesInformationsDuneSaison(db, saison)

    if (!informations) continue

    for (let langue of Object.keys(informations)) {
      const db_langue = LANGAGES_DB[langue]

      let trailer_path = informations[langue].videos.length ? `https://www.youtube.com/watch?v=${informations[langue].videos[0].key}` : null
      if (!trailer_path) {
        const serie_info = (await GetInformationsForASerie(saison.serie_title))[langue]
        trailer_path = `https://www.youtube.com/watch?v=${serie_info[0].videos[0].key}`
      }

      informations[langue].trailer_path = trailer_path

      const saison_enregistree = Saison.EnregisterUneSaison(db, saison, informations[langue], db_langue)

      if (!saison_enregistree) {
        console.log(`Saison déjà dans la base de donnée.`)
        continue
      }
      Serie.AjouterUneSaison(db, saison_enregistree, db_langue)

      await Video.TelechargerUneBandeAnnonce(
        informations[langue].trailer_path,
        `/Series/${saison_enregistree.serie_title}/Season ${saison_enregistree.number}`,
        'Trailer',
        db_langue
      )

      await Image.TelechargerLaMiniature(
        informations[langue].poster_path,
        `/Series/${saison_enregistree.serie_title}/Season ${saison_enregistree.number}`,
        'Poster',
        db_langue
      )
    }
  }
  for (const episode of nouveaux_pour_le_serveur.episodes) {
    const informations = await ObtenirLesInformationsDunEpisode(db, episode)

    if (!informations) continue

    for (let langue of Object.keys(informations)) {
      const db_langue = LANGAGES_DB[langue]
      const episode_enregistre = Episode.EnregisterUnEpisode(db, episode, informations[langue], db_langue)

      if (!episode) {
        console.log(`Épisode déjà dans la base de donnée.`)
        continue
      }

      Saison.AjouterUnEpisode(db, episode_enregistre, db_langue)

      Serie.AjouterUnEpisode(db, episode_enregistre, db_langue)

      await Image.TelechargerLaMiniature(
        informations[langue].still_path,
        episode.paths.local
          .split('/')
          .filter((e) => {
            return !e.includes('.mkv')
          })
          .join('/'),
        episode.title.replace('.mkv', '')
      )
    }
  }
  res.writeHead(200).end()
  ExtractFromFiles(nouveaux_fichiers).then(() => {
    logger.Info(`\nAjouts terminés.`)
  })
})

router.get('/informations/film/:title', async (requete, reponse) => {
  const title = encodeURIComponent(requete.params.title)

  const resultats = {}

  for (let langage of LANGAGES) {
    const recherche = await TMDB.SearchMovie(title, langage)

    if (recherche.success == false) {
      reponse.send({ film_nexiste_pas: true })
      return
    }

    resultats[langage] = recherche

    for (let indice in resultats[langage]) {
      const film = resultats[langage][indice]
      film.posters = resultats[LANGAGES[0]][indice].posters || (await TMDB.GetPosters['Film'](film.id))
      film.videos = NeGarderQueLesTrailersUneFois(((await TMDB.GetVideos['Film'](film.id, langage)) || []).concat(await TMDB.GetVideos['Film'](film.id)))
    }
  }
  reponse.send(resultats)
})
const GetInformationsForASerie = async (raw_title) => {
  const title = encodeURIComponent(raw_title)

  const resultats = {}

  for (let langage of LANGAGES) {
    const recherche = await TMDB.SearchSerie(title, langage)

    if (recherche.success == false) {
      reponse.send({ serie_nexiste_pas: true })
      return
    }

    resultats[langage] = recherche

    for (let indice in resultats[langage]) {
      const serie = resultats[langage][indice]

      serie.posters = resultats[LANGAGES[0]][indice].posters || (await TMDB.GetPosters['Serie'](serie.id))
      serie.videos = NeGarderQueLesTrailersUneFois(((await TMDB.GetVideos['Serie'](serie.id, langage)) || []).concat(await TMDB.GetVideos['Serie'](serie.id)))
    }
  }

  return resultats
}
router.get('/informations/serie/:title', async (requete, reponse) => {
  const id = Fichier.GenererHashUnique(`/Series/${requete.params.title}`)

  if (db.getIndex(`/eng-US/series`, id) != -1) {
    reponse.send({ serie_deja_dans_base: true })
    return
  }

  reponse.send(await GetInformationsForASerie(requete.params.title))
})
router.get('/informations/serie/:title/saison/:saison', async (requete, reponse) => {
  const saison = requete.params.saison

  const id = Fichier.GenererHashUnique(`/Series/${requete.params.title}/Season ${saison}`)

  if (db.getIndex(`/eng-US/seasons`, id) != -1) {
    reponse.send({ saison_deja_dans_base: true })
    return
  }

  const id_serie = Fichier.GenererHashUnique(`/Series/${requete.params.title}`)
  const tmdb_id = db.getData(`/eng-US/series[${db.getIndex('/eng-US/series', id_serie)}]`).tmdb_id

  const resultats = {}

  for (let langage of LANGAGES) {
    const recherche = await TMDB.SearchSeason(tmdb_id, saison, langage)

    if (recherche.success == false) {
      reponse.send({ saison_nexiste_pas: true })
      return
    }

    resultats[langage] = recherche

    resultats[langage].videos = NeGarderQueLesTrailersUneFois(
      ((await TMDB.GetVideos['Saison'](id_serie, saison, langage)) || []).concat(await TMDB.GetVideos['Saison'](id_serie, saison))
    )
  }

  reponse.send(resultats)
})
router.get('/informations/serie/:title/saison/:saison/episode/:episode', async (requete, reponse) => {
  const title = requete.params.title
  const saison = requete.params.saison
  const episode = requete.params.episode

  const id_serie = Fichier.GenererHashUnique(`/Series/${title}`)
  const tmdb_id = db.getData(`/eng-US/series[${db.getIndex('/eng-US/series', id_serie)}]`).tmdb_id

  const resultats = {}

  for (let langage of LANGAGES) {
    const recherche = await TMDB.SearchEpisode(tmdb_id, saison, episode, langage)

    if (recherche.success == false) {
      reponse.send({ episode_nexiste_pas: true })
      return
    }

    resultats[langage] = recherche

    resultats[langage].videos = NeGarderQueLesTrailersUneFois(
      ((await TMDB.GetVideos['Episode'](id_serie, saison, episode, langage)) || []).concat(await TMDB.GetVideos['Episode'](id_serie, saison, episode))
    )
  }

  reponse.send(resultats)
})

function AjouterSeriesEtSaisons(nouveaux_fichiers) {
  let nouveaux_elements = { films: [], series: {}, saisons: {}, episodes: [] }

  for (let fichier of Object.values(nouveaux_fichiers)) {
    Fichier.EnregistrerUnFichier(db, fichier)

    const est_un_episode = fichier.paths.local.includes('/Series/')

    if (!est_un_episode) {
      nouveaux_elements['films'].push(fichier)
      continue
    }

    const serie_title = fichier.paths.local.split('/').filter((element) => {
      return element != ''
    })[1]

    const saison = Number.parseInt(fichier.title.replace(/S([0-9]+)E([0-9]+) - .+/, '$1')).toString()

    let chemin = fichier.paths.local.split('/')
    chemin.pop()
    const id_saison = Fichier.GenererHashUnique(chemin.join('/'))
    chemin.pop()
    const id_serie = Fichier.GenererHashUnique(chemin.join('/'))

    nouveaux_pour_le_serveur['episodes'].push(Object.assign({ serie_title }, fichier))

    // La saison a déjà été enregistré
    if (nouveaux_pour_le_serveur['saisons'][id_saison]) continue

    nouveaux_pour_le_serveur['saisons'][id_saison] = {
      serie_title,
      number: saison,
      hash: id_saison,
    }

    if (nouveaux_elements['series'][id_serie]) continue

    nouveaux_elements['series'][id_serie] = {
      title: serie_title,
      hash: id_serie,
    }
  }

  return nouveaux_elements
}
function NeGarderQueLesTrailersUneFois(videos) {
  if (!videos || !videos.length || !videos[0]) return []

  const cles = []
  const resultat = []

  for (let video of videos) {
    if (video.type != 'Trailer') continue
    if (cles.includes(video.key)) continue

    cles.push(video.key)
    resultat.push(video)
  }

  return resultat
}

async function ObtenirLesInformationsDuneSaison(db, saison) {
  const serie_title = saison.serie_title
  const number = saison.number

  const id_serie = Fichier.GenererHashUnique(`/Series/${serie_title}`)

  const tmdb_id = db.getData(`/eng-US/series[${db.getIndex('/eng-US/series', id_serie)}]`).tmdb_id
  const resultats = {}

  for (let langage of LANGAGES) {
    const recherche = await TMDB.SearchSeason(tmdb_id, number, langage)

    if (recherche.success == false) {
      console.log(`Pas d'informations pour la saison ${number} de la série '${serie_title}'`)
      return null
    }

    resultats[langage] = recherche

    let videos = (await TMDB.GetVideos['Saison'](tmdb_id, number, langage)) || []
    if (!videos.length) videos = await TMDB.GetVideos['Saison'](tmdb_id, number)

    resultats[langage].videos = NeGarderQueLesTrailersUneFois(videos)
  }

  return resultats
}

async function ObtenirLesInformationsDunEpisode(db, episode) {
  const serie_title = episode.paths.local.split('/').filter((e) => {
    return e != ''
  })[1]
  const nombre_saison = episode.title.replace(/S0*([0-9]+)E0*([0-9]+) - .*/, '$1')
  const nombre_episode = episode.title.replace(/S0*([0-9]+)E0*([0-9]+) - .*/, '$2')

  const id_serie = Fichier.GenererHashUnique(`/Series/${serie_title}`)
  const tmdb_id = db.getData(`/eng-US/series[${db.getIndex('/eng-US/series', id_serie)}]`).tmdb_id

  const resultats = {}

  for (let langage of LANGAGES) {
    const recherche = await TMDB.SearchEpisode(tmdb_id, nombre_saison, nombre_episode, langage)

    if (recherche.success == false) {
      console.log(`Pas d'informations pour l'épisode ${nombre_episode} de la saison ${nombre_saison} de la série '${serie_title}'`)
      return null
    }

    resultats[langage] = recherche
  }

  return resultats
}

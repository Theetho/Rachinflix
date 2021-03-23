const fs = require('fs')
const path = require('path')
const { GenererHashUnique } = require('./Fichier')

function TransformerDate(date) {
  return date
    .split('-')
    .reverse()
    .join('/')
}

function EnregisterUneSaison(db, fichier, resultat, langue) {
  if (db.getIndex(`/${langue}/seasons`, fichier.hash) != -1) return null

  const saison = {
    id: fichier.hash,
    tmdb_id: resultat.id,
    serie_title: fichier.serie_title,
    number: resultat.season_number,
    episode_count: 0,
    episodes: [],
    overview: resultat.overview,
    image: `/Series/${fichier.serie_title}/Season ${resultat.season_number}/Poster_${langue}.jpg`,
    video: `/Series/${fichier.serie_title}/Season ${resultat.season_number}/Trailer_${langue}.mkv`,
    release_date: TransformerDate(resultat.air_date),
  }

  db.push(`/${langue}/seasons[]`, saison)

  console.log(`Ajout de la saison ${saison.number} de la série '${saison.serie_title}' dans la base de donnée !`)

  return saison
}

function AjouterUnEpisode(db, episode, langue) {
  const id_saison = GenererHashUnique(`/Series/${episode.serie_title}/Season ${episode.season_number}`)

  const saison = db.getData(`/${langue}/seasons[${db.getIndex(`/${langue}/seasons`, id_saison)}]`)

  saison.episode_count += 1
  saison.episodes.push({ number: episode.number, id: episode.id })

  db.save()
}

module.exports = {
  EnregisterUneSaison,
  AjouterUnEpisode,
}

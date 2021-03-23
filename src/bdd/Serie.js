const fs = require('fs')
const path = require('path')
const { GenererHashUnique } = require('./Fichier')

function EnregisterUneSerie(db, fichier, resultat, langue) {
  if (db.getIndex(`/${langue}/series`, fichier.hash) != -1) return false

  const serie = {
    id: fichier.hash,
    tmdb_id: resultat.id,
    genres: resultat.genre_ids,
    title: resultat.name,
    original_title: resultat.original_title,
    season_count: 0,
    episode_count: 0,
    seasons: [],
    overview: resultat.overview,
    image: `/Series/${fichier.title}/Poster_${langue}.jpg`,
    video: resultat.trailer_path ? `/Series/${fichier.title}/Trailer_${langue}.mkv` : null,
    release_date: resultat.release_date,
    average_vote: resultat.vote_average,
    vote_count: resultat.vote_count,
  }

  db.push(`/${langue}/series[]`, serie)

  console.log(`Ajout de la série '${serie.title}' dans la base de donnée !`)

  return true
}

function AjouterUneSaison(db, saison, langue) {
  const id_serie = GenererHashUnique(`/Series/${saison.serie_title}`)

  const serie = db.getData(`/${langue}/series[${db.getIndex(`/${langue}/series`, id_serie)}]`)

  serie.season_count += 1
  serie.seasons.push({ number: saison.number, id: saison.id })

  db.save()
}

function AjouterUnEpisode(db, episode, langue) {
  const id_serie = GenererHashUnique(`/Series/${episode.serie_title}`)

  const serie = db.getData(`/${langue}/series[${db.getIndex(`/${langue}/series`, id_serie)}]`)

  serie.episode_count += 1

  db.save()
}

module.exports = {
  EnregisterUneSerie,
  AjouterUneSaison,
  AjouterUnEpisode,
}

const fs = require('fs')
const path = require('path')

function TransformerDate(date) {
  return date
    .split('-')
    .reverse()
    .join('/')
}

function EnregisterUnEpisode(db, fichier, resultat, langue) {
  if (db.getIndex(`/${langue}/episodes`, fichier.id) != -1) return null

  const episode = {
    id: fichier.id,
    tmdb_id: resultat.id,
    title: resultat.name,
    serie_title: fichier.serie_title,
    overview: resultat.overview,
    image: `${fichier.paths.local.replace('.mkv', '')}.jpg`,
    number: resultat.episode_number,
    season_number: resultat.season_number,
    release_date: TransformerDate(resultat.air_date),
    average_vote: resultat.vote_average,
    vote_count: resultat.vote_count,
  }

  db.push(`/${langue}/episodes[]`, episode)

  console.log(
    `Ajout de l'épisode ${episode.number} (${langue}) de la saison ${episode.season_number} de la série '${episode.serie_title}' dans la base de donnée !`
  )

  return episode
}

module.exports = {
  EnregisterUnEpisode,
}

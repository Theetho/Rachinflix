const fs = require('fs')
const path = require('path')

function TransformerDate(date) {
  return date
    .split('-')
    .reverse()
    .join('/')
}

function EnregisterUnFilm(db, fichier, resultat, langue) {
  if (db.getIndex(`/${langue}/films`, fichier.id) != -1) return false

  const film = {
    // Correspond aussi a l'id du fichier pour ce film.
    id: fichier.id,
    tmdb_id: resultat.id,
    genres: resultat.genre_ids,
    title: resultat.title,
    original_title: resultat.original_title,
    overview: resultat.overview,
    image: `${fichier.paths.local.replace('.mkv', '')}_${langue}.jpg`,
    video: resultat.trailer_path ? `${fichier.paths.local.replace('.mkv', '')}_${langue}.mkv` : null,
    release_date: TransformerDate(resultat.release_date),
    average_vote: resultat.vote_average,
    vote_count: resultat.vote_count,
  }

  db.push(`/${langue}/films[]`, film)

  console.log(`Ajout du film '${film.title}' dans la base de donnée !`)

  return true
}

module.exports = {
  EnregisterUnFilm,
}

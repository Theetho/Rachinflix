const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const path = require('path')

class JSONDataBase {
  constructor() {
    this._db = new JsonDB(new Config(path.resolve(__dirname + '/DB'), true, true, '/'))
  }
  GetFilmCount() {
    return this._db.count('/eng-US/films')
  }
  GetSerieCount() {
    return this._db.count('/eng-US/series')
  }
  GetAllFilms(language) {
    return this._db.getData(`/${language}/films`)
  }
  GetAllSeries(language) {
    return this._db.getData(`/${language}/series`)
  }
  GetFilm(language, index) {
    if (index >= this._db.count(`/${language}/films`)) return null

    return this._db.getData(`/${language}/films[${index}]`)
  }
  GetFile(id) {
    return this._db.getData(`/files[${this._db.getIndex(`/files`, id)}]`)
  }
  GetSerie(language, index) {
    // We first try to substract the number of films
    if (index >= this._db.count(`/${language}/series`)) index -= this._db.count(`/${language}/films`)
    if (index >= this._db.count(`/${language}/series`)) return null

    return this._db.getData(`/${language}/series[${index}]`)
  }
  GetSeason(language, serie_index, season_number = null) {
    if (!season_number) return this._GetFirstSeason(language, serie_index)

    const serie = this.GetSerie(language, serie_index)

    if (!serie) return { serie: null, season: null }

    const season_id = serie.seasons.find((e) => {
      return e.number == season_number
    }).id

    const season = this._db.getData(`/${language}/seasons[${this._db.getIndex(`/${language}/seasons`, season_id)}]`)

    return { serie, season }
  }
  GetEpisode(language, serie_index, season_number = null, episode_number = null) {
    if (!season_number || !episode_number) return this._GetFirstEpisode(language, serie_index, season_number)

    const { serie, season } = this.GetSeason(language, serie_index, season_number)

    if (!season) return { serie: null, season: null, episode: null }

    const episode_id = season.episodes.find((e) => {
      return e.number == episode_number
    }).id

    const episode = this._db.getData(`/${language}/episodes[${this._db.getIndex(`/${language}/episodes`, episode_id)}]`)

    return { serie, season, episode }
  }
  GetGenres(language, genres_ids) {
    return genres_ids.map((e) => {
      return this._db.getData(`/${language}/genres[${this._db.getIndex(`/${language}/genres`, e.toString())}]`).name
    })
  }
  _GetFirstSeason(language, serie_index) {
    const serie = this.GetSerie(language, serie_index)

    if (!serie) return { serie: null, season: null }

    const season_id = serie.seasons.sort((e1, e2) => {
      return e1.number < e2.number ? -1 : 1
    })[0].id

    const season = this._db.getData(`/${language}/seasons[${this._db.getIndex(`/${language}/seasons`, season_id)}]`)

    return { serie, season }
  }
  _GetFirstEpisode(language, serie_index, season_number = null) {
    if (!season_number) var { serie, season } = this._GetFirstSeason(language, serie_index)
    else var { serie, season } = this.GetSeason(language, serie_index, season_number)

    if (!season) return { serie: null, season: null, episode: null }

    const episode_id = season.episodes.sort((e1, e2) => {
      return e1.number < e2.number ? -1 : 1
    })[0].id

    const episode = this._db.getData(`/${language}/episodes[${this._db.getIndex(`/${language}/episodes`, episode_id)}]`)

    return { serie, season, episode }
  }
}

// const db = new JsonDB(new Config(path.resolve(__dirname + '/DB'), true, true, '/'))

// for (let langue of ['fr-FR', 'eng-US']) {
//   const episodes = db.getData(`/${langue}/episodes`)

//   for (let episode of episodes) {
//     episode.image = episode.image.replace(`_${langue}`, '')
//   }
// }

// db.save()

/* EXAMPLE 
const language = 'fr-FR'

const film_index = 156
const serie_index = 322
const season_number = 2
const episode_number = 3

const db = new JSONDataBase()

const film = db.GetFilm(language, film_index)
const film_file = db.GetFile(film.id)

const { serie, season, episode } = db.GetEpisode(language, serie_index, season_number, episode_number)
const episode_file = db.GetFile(episode.id)
*/

module.exports = JSONDataBase

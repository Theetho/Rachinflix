const fs = require('fs')
const logger = require('./logger')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const { ROOT_USERS, ROOT_STREAMS } = require('./constantsServer')

const MILLISECONDS_IN_DAY = 86400000
// Time limit for which a file is valid (in days)
// So here we keep the file for 10 days
const LIMIT_OF_DAY = 10

const USER_DB = new JsonDB(new Config(`${ROOT_USERS}/users`, true, true, '/'))
DeletePreviousStreams()

function DeletePreviousStreams() {
  const users = USER_DB.getData('/users')

  const files_registered = []

  for (let user of users) {
    for (let film of user.registry.films) {
      files_registered.push(film.id)
    }
    for (let serie of user.registry.series) {
      files_registered.push(serie.file_id)
    }
  }

  // We look at the files in the stream folder
  const directory = fs.readdirSync(ROOT_STREAMS)

  // For every file inside
  directory.forEach((file_to_delete) => {
    const file_id = Number.parseInt(file_to_delete.replace(/(-*[0-9]+)_.*/, '$1'))

    if (files_registered.includes(file_id)) return

    // Create a new temporary name for the file that is going to be deleted
    const _path = `${ROOT_STREAMS}/${Math.random()}.mkv`
    // Rename it
    fs.renameSync(`${ROOT_STREAMS}/${file_to_delete}`, _path)
    // Delete it
    fs.unlinkSync(_path)
  })
}

class User {
  constructor(user_id, database) {
    this.database = database
    this.user_index = USER_DB.getIndex('/users', user_id)
    this.path_to_registry = `/users[${this.user_index}]/registry`
    this.today = this._GetToday()

    this._RemoveOldElement()

    logger.Info(`${USER_DB.getData(`/users[${this.user_index}]`).name}'s profil loaded`)
  }
  // A REFACTO EN PETITE FONCTION
  RegisterSerie(serie_index, serie, season, episode, progress) {
    const index = USER_DB.getIndex(`${this.path_to_registry}/series`, serie.id)

    // New serie
    if (index == -1) {
      USER_DB.push(`${this.path_to_registry}/series[]`, {
        id: serie.id,
        file_id: episode.id,
        episode: episode.number,
        season: episode.season_number,
        time: progress,
        date: this.today,
      })
      return false
    }

    const registered_serie = USER_DB.getData(`${this.path_to_registry}/series[${index}]`)
    // Registering progress on the same episode
    if (registered_serie.episode == episode.number && registered_serie.season == episode.season_number) {
      // The episode is not finished, we register the new time
      if (progress < 90) {
        registered_serie.time = progress
        USER_DB.save()
        return false
      }

      // The episode is considered finished, so we will find the next one, if it exists
      Object.assign(registered_serie, { time: 0, date: this.today })

      const last_episode_of_this_season = season.episodes
        .map((e) => {
          return e.number
        })
        .reduce((acc, cur) => {
          return acc < cur ? cur : acc
        })

      // Is there an episode after this one in the same season ?
      if (last_episode_of_this_season > registered_serie.episode) {
        // Find the next episode
        const next_episode = season.episodes
          .sort((e1, e2) => {
            return e1.number < e2.number ? -1 : 1
          })
          .find((e) => {
            return e.number > registered_serie.episode
          })

        Object.assign(registered_serie, { file_id: next_episode.id, episode: next_episode.number })
        // Else is there another season after this one ?
      } else {
        const last_season_of_this_serie = serie.seasons
          .map((e) => {
            return e.number
          })
          .reduce((acc, cur) => {
            return acc < cur ? cur : acc
          })

        // Is this season the last one ?
        if (last_season_of_this_serie > registered_serie.season) {
          // If not:
          // Find the next season
          registered_serie.season = serie.seasons
            .sort((e1, e2) => {
              return e1.number < e2.number ? -1 : 1
            })
            .find((e) => {
              return e.number > registered_serie.season
            }).number

          // Find the first episode of this new season
          const new_episode = this.database.GetSeason('eng-US', serie_index, registered_serie.season).season.episodes.sort((e1, e2) => {
            return e1.number < e2.number ? -1 : 1
          })[0]
          Object.assign(registered_serie, { file_id: new_episode.id, episode: new_episode.number })
        } else {
          // Else it was the last episode of the serie
          USER_DB.delete(`${this.path_to_registry}/series[${index}]`)
        }
      }
    } else {
      // We have a different episode for this serie
      if (registered_serie.season > episode.season_number || (registered_serie.season == episode.season_number && registered_serie.episode > episode.number))
        return false

      Object.assign(registered_serie, { season: episode.season_number, episode: episode.number, time: progress, date: this.today })
    }

    USER_DB.save()
    return true
  }
  GetEpisode(serie_id) {
    const index = USER_DB.getIndex(`${this.path_to_registry}/series`, serie_id)

    if (index == -1) return null

    return USER_DB.getData(`${this.path_to_registry}/series[${index}]`)
  }
  RegisterFilm(film, progress) {
    const index = USER_DB.getIndex(`${this.path_to_registry}/films`, film.id)

    // The film is new
    if (index == -1) {
      USER_DB.push(`${this.path_to_registry}/films[]`, {
        id: film.id,
        time: progress,
        date: this.today,
      })
      return
    }

    // The film is finished
    if (progress >= 90) {
      logger.Info('This is the end for this film :(')
      USER_DB.delete(`${this.path_to_registry}/films[${index}]`)
    } else {
      const registered_film = USER_DB.getData(`${this.path_to_registry}/films[${index}]`)
      Object.assign(registered_film, { time: progress, date: this.today })
      USER_DB.save()
    }
  }
  GetFilm(film_id) {
    const index = USER_DB.getIndex(`${this.path_to_registry}/films`, film_id)

    if (index == -1) return null

    return USER_DB.getData(`${this.path_to_registry}/films[${index}]`)
  }
  GetIndexesOfRegisteredFiles() {
    const result = []

    const films = USER_DB.getData(`${this.path_to_registry}/films`)
    for (let film of films) {
      result.push(this.database._db.getIndex('/eng-US/films', film.id))
    }

    const series = USER_DB.getData(`${this.path_to_registry}/series`)
    for (let serie of series) {
      result.push(this.database.GetFilmCount() + this.database._db.getIndex('/eng-US/series', serie.id))
    }

    return result
  }
  /**
   * @brief - Get the day at 00:00:00.
   *
   * @return {Number} - The day in seconds.
   */
  _GetToday() {
    let date = new Date()

    // Today in milliseconds at 00:00:00 the morning
    const today = Date.parse(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`)

    return today
  }
  _RemoveOldElement() {
    const Check = (element, index, type) => {
      const days = (this.today - element.date) / MILLISECONDS_IN_DAY

      if (days < LIMIT_OF_DAY) return

      this._DeleteOldFiles(element.file_id)
      USER_DB.delete(`${this.path_to_registry}/${type}[${index}]`)
      logger.Info(`Removed ${type} '${element.id}' (too old)`)
    }

    const films = USER_DB.getData(`${this.path_to_registry}/films`)
    for (let index in films) {
      Check(films[index], index, 'films')
    }
    const series = USER_DB.getData(`${this.path_to_registry}/series`)
    for (let index in series) {
      Check(series[index], index, 'series')
    }
  }
  _DeleteOldFiles(id) {
    const folder = fs.readdirSync(ROOT_STREAMS)

    // For every file inside
    folder.forEach((file_to_delete) => {
      const file_id = Number.parseInt(file_to_delete.replace(/(-*[0-9]+)_.*/, '$1'))
      if (file_id != id) return

      // Create a new temporary name for the file that is going to be deleted
      const _path = `${ROOT_STREAMS}/${Math.random()}.mkv`
      // Rename it
      fs.renameSync(`${ROOT_STREAMS}/${file_to_delete}`, _path)
      // Delete it
      fs.unlinkSync(_path)
    })
  }
}

module.exports = { USER_DB, User }

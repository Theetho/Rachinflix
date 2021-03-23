const fetch = require('node-fetch')

const apikey = ''
const tmdb_root = 'https://api.themoviedb.org/3'

function SearchMovie(query, language = 'en-US') {
  return new Promise((resolve, reject) => {
    fetch(`${tmdb_root}/search/movie?api_key=${apikey}&query=${query}&language=${language}`)
      .then((result) => {
        return result.json()
      })
      .then((result) => {
        resolve(result.results)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function SearchSerie(query, language = 'en-US') {
  return new Promise((resolve, reject) => {
    fetch(`${tmdb_root}/search/tv?api_key=${apikey}&query=${query}&language=${language}`)
      .then((result) => {
        return result.json()
      })
      .then((result) => {
        resolve(result.results)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function SearchSeason(serie_id, season, language = 'en-US') {
  return new Promise((resolve, reject) => {
    fetch(`${tmdb_root}/tv/${serie_id}/season/${season}?api_key=${apikey}&language=${language}`)
      .then((result) => {
        return result.json()
      })
      .then((result) => {
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function SearchEpisode(serie_id, season, episode, language = 'en-US') {
  return new Promise((resolve, reject) => {
    fetch(`${tmdb_root}/tv/${serie_id}/season/${season}/episode/${episode}?api_key=${apikey}&language=${language}`)
      .then((result) => {
        return result.json()
      })
      .then((result) => {
        resolve(result)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

const GetPosters = {
  Film(film_id) {
    return new Promise((resolve, reject) => {
      fetch(`${tmdb_root}/movie/${film_id}/images?api_key=${apikey}`)
        .then((result) => {
          return result.json()
        })
        .then((result) => {
          resolve(result.posters)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  Serie(serie_id) {
    return new Promise((resolve, reject) => {
      fetch(`${tmdb_root}/tv/${serie_id}/images?api_key=${apikey}`)
        .then((result) => {
          return result.json()
        })
        .then((result) => {
          resolve(result.posters)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}

const GetVideos = {
  Film(film_id, language = null) {
    return new Promise((resolve, reject) => {
      fetch(`${tmdb_root}/movie/${film_id}/videos?api_key=${apikey}${language ? `&language=${language}` : ''}`)
        .then((result) => {
          return result.json()
        })
        .then((result) => {
          resolve(result.results)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  Serie(serie_id, language = null) {
    return new Promise((resolve, reject) => {
      fetch(`${tmdb_root}/tv/${serie_id}/videos?api_key=${apikey}${language ? `&language=${language}` : ''}`)
        .then((result) => {
          return result.json()
        })
        .then((result) => {
          resolve(result.results)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  Saison(serie_id, season_number, language = null) {
    return new Promise((resolve, reject) => {
      fetch(`${tmdb_root}/tv/${serie_id}/season/${season_number}/videos?api_key=${apikey}${language ? `&language=${language}` : ''}`)
        .then((result) => {
          return result.json()
        })
        .then((result) => {
          resolve(result.results)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  Episode(serie_id, season_number, episode_number, language = null) {
    return new Promise((resolve, reject) => {
      fetch(`${tmdb_root}/tv/${serie_id}/season/${season_number}/episode/${episode_number}/videos?api_key=${apikey}${language ? `&language=${language}` : ''}`)
        .then((result) => {
          return result.json()
        })
        .then((result) => {
          resolve(result.results)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
}

module.exports = {
  SearchMovie,
  SearchSerie,
  SearchSeason,
  SearchEpisode,
  GetPosters,
  GetVideos,
}

import fetch from 'node-fetch'
import { APIKEY_TMDB, ROOT_TMDB } from './config'
import {
  TMDBFilm,
  TMDBSearchFilmResults,
  TMDBSearchImagesResult,
  TMDBSearchVideosResults,
  TMDBVideo
} from './interface'
import { Language_639_1 } from './language'

export function searchFilm(title: string, language: Language_639_1): Promise<TMDBFilm[]> {
  if (title.includes(' ')) {
    title = encodeURIComponent(title)
  }

  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/search/movie?api_key=${APIKEY_TMDB}&query=${title}&language=${language}`)
      .then(result => result.json())
      .then((result: TMDBSearchFilmResults) => resolve(result.results))
      .catch(reject)
  })
}

export function searchFilmImages(
  tmdb_id: number,
  languages?: Language_639_1[]
): Promise<Omit<Omit<TMDBSearchImagesResult, 'id'>, 'logos'>> {
  let includelanguages = '&include_image_language=null'
  languages?.forEach(language => (includelanguages += `,${language}`))

  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/movie/${tmdb_id}/images?api_key=${APIKEY_TMDB}${includelanguages}`)
      .then(result => result.json())
      .then((result: TMDBSearchImagesResult) =>
        resolve({ posters: result.posters, backdrops: result.backdrops })
      )
      .catch(reject)
  })
}

export function searchFilmVideos(
  tmdb_id: number,
  languages?: Language_639_1[]
): Promise<TMDBVideo[]> {
  let includelanguages = '&include_video_language=null'
  languages?.forEach(language => (includelanguages += `,${language}`))

  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/movie/${tmdb_id}/videos?api_key=${APIKEY_TMDB}${includelanguages}`)
      .then(result => result.json())
      .then((result: TMDBSearchVideosResults) => resolve(result.results))
      .catch(reject)
  })
}

export function getFilmDetails(tmdb_id: number, language: Language_639_1): Promise<TMDBFilm> {
  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/movie/${tmdb_id}?api_key=${APIKEY_TMDB}&language=${language}`)
      .then(result => result.json())
      .then(resolve)
      .catch(reject)
  })
}

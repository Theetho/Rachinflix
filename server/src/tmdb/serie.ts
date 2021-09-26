import fetch from 'node-fetch'
import { APIKEY_TMDB, ROOT_TMDB } from './config'
import {
  TMDBSearchImagesResult,
  TMDBSearchSerieResults,
  TMDBSearchVideosResults,
  TMDBSerie,
  TMDBVideo
} from './interface'
import { Language_639_1 } from './language'

export function searchSerie(title: string, language: Language_639_1): Promise<TMDBSerie[]> {
  if (title.includes(' ')) {
    title = encodeURIComponent(title)
  }

  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/search/tv?api_key=${APIKEY_TMDB}&query=${title}&language=${language}`)
      .then(result => result.json())
      .then((result: TMDBSearchSerieResults) => resolve(result.results))
      .catch(reject)
  })
}

export function searchSerieImages(
  tmdb_id: number,
  languages?: Language_639_1[]
): Promise<Omit<Omit<TMDBSearchImagesResult, 'id'>, 'logos'>> {
  let includelanguages = '&include_image_language=null'
  languages?.forEach(language => (includelanguages += `,${language}`))

  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/tv/${tmdb_id}/images?api_key=${APIKEY_TMDB}${includelanguages}`)
      .then(result => result.json())
      .then((result: TMDBSearchImagesResult) =>
        resolve({ posters: result.posters, backdrops: result.backdrops })
      )
      .catch(reject)
  })
}

export function searchSerieVideos(
  tmdb_id: number,
  languages?: Language_639_1[]
): Promise<TMDBVideo[]> {
  let includelanguages = '&include_video_language=null'
  languages?.forEach(language => (includelanguages += `,${language}`))

  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/tv/${tmdb_id}/videos?api_key=${APIKEY_TMDB}${includelanguages}`)
      .then(result => result.json())
      .then((result: TMDBSearchVideosResults) => resolve(result.results))
      .catch(reject)
  })
}

export function getSerieDetails(tmdb_id: number, language: Language_639_1): Promise<TMDBSerie> {
  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/tv/${tmdb_id}?api_key=${APIKEY_TMDB}&language=${language}`)
      .then(result => result.json())
      .then(resolve)
      .catch(reject)
  })
}

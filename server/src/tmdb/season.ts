import fetch from 'node-fetch'
import { APIKEY_TMDB, ROOT_TMDB } from './config'
import {
  TMDBImage,
  TMDBSearchImagesResult,
  TMDBSearchVideosResults,
  TMDBSeason,
  TMDBVideo
} from './interface'
import { Language_639_1 } from './language'

export function getSeasonDetails(
  tmdb_id: number,
  number: number,
  language: Language_639_1
): Promise<TMDBSeason> {
  return new Promise((resolve, reject) => {
    fetch(`${ROOT_TMDB}/tv/${tmdb_id}/season/${number}?api_key=${APIKEY_TMDB}&language=${language}`)
      .then(result => result.json())
      .then(resolve)
      .catch(reject)
  })
}

export function searchSeasonImages(
  tmdb_id: number,
  number: number,
  languages?: Language_639_1[]
): Promise<{ posters: TMDBImage[] }> {
  let includelanguages = '&include_image_language=null'
  languages?.forEach(language => (includelanguages += `,${language}`))

  return new Promise((resolve, reject) => {
    fetch(
      `${ROOT_TMDB}/tv/${tmdb_id}/season/${number}/images?api_key=${APIKEY_TMDB}${includelanguages}`
    )
      .then(result => result.json())
      .then((result: TMDBSearchImagesResult) => resolve({ posters: result.posters }))
      .catch(reject)
  })
}

export function searchSeasonVideos(
  tmdb_id: number,
  number: number,
  languages?: Language_639_1[]
): Promise<TMDBVideo[]> {
  let includelanguages = '&include_video_language=null'
  languages?.forEach(language => (includelanguages += `,${language}`))

  return new Promise((resolve, reject) => {
    fetch(
      `${ROOT_TMDB}/tv/${tmdb_id}/season/${number}/videos?api_key=${APIKEY_TMDB}${includelanguages}`
    )
      .then(result => result.json())
      .then((result: TMDBSearchVideosResults) => resolve(result.results))
      .catch(reject)
  })
}

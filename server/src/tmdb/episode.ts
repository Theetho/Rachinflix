import fetch from 'node-fetch'
import { APIKEY_TMDB, ROOT_TMDB } from './config'
import { TMDBEpisode } from './interface'
import { Language_639_1 } from './language'

export function searchEpisode(
  tmdb_id: number,
  season_number: number,
  number: number,
  language: Language_639_1
): Promise<TMDBEpisode> {
  return new Promise((resolve, reject) => {
    fetch(
      `${ROOT_TMDB}/tv/${tmdb_id}/season/${season_number}/episode/${number}?api_key=${APIKEY_TMDB}&language=${language}`
    )
      .then(result => result.json())
      .then(resolve)
      .catch(reject)
  })
}

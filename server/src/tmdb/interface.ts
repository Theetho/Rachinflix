import { NewMedia } from 'src/interface/common/management'
import { Language_3166_1, Language_639_1 } from './language'

export type TMDBFilm = {
  adult?: boolean
  backdrop_path?: string /*`/${string}.jpg`*/ | null
  genres?: { id: number; name: string }[]
  id?: number
  original_language?: Language_639_1
  original_title?: string
  overview?: string
  popularity?: number
  poster_path?: string /*`/${string}.jpg`*/ | null
  release_date?: `${number}-${number}-${number}` // YYYY-mm-dd
  title?: string
  video?: boolean
  vote_average?: number
  vote_count?: number
}
export type TMDBSearchFilmResults = {
  page: number
  results: TMDBFilm[]
  total_results: number
  total_pages: number
}

export type TMDBSerie = {
  backdrop_path: string /*`/${string}.jpg`*/ | null
  first_air_date: `${number}-${number}-${number}` // YYYY-mm-dd
  genres: { id: number; name: string }[]
  id: number
  name: string
  origin_country: Language_3166_1[]
  original_language: Language_639_1
  original_name: string
  overview: string
  popularity: number
  poster_path: string /*`/${string}.jpg`*/ | null
  vote_average: number
  vote_count: number
}
export type TMDBSearchSerieResults = {
  page: number
  results: TMDBSerie[]
  total_results: number
  total_pages: number
}

export type TMDBSeason = {
  _id: string
  air_date: `${number}-${number}-${number}` // YYYY-mm-dd
  episodes: TMDBEpisode[]
  name: string
  overview: string
  id: number
  poster_path: string /*`/${string}.jpg`*/ | null
  season_number: number
}

export type TMDBEpisode = {
  air_date: `${number}-${number}-${number}` // YYYY-mm-dd
  episode_number: number
  crew: {
    job: string
    department: string
    credit_id: string
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string /*`/${string}.jpg`*/ | null
  }[]
  guest_stars: {
    character: string
    credit_id: string
    order: number
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string /*`/${string}.jpg`*/ | null
  }[]
  id: number
  name: string
  overview: string
  production_code: string
  season_number: number
  still_path: string /*`/${string}.jpg`*/ | null
  vote_average: number
  vote_count: number
}

export type TMDBImage = {
  aspect_ratio: number
  height: number
  iso_639_1: Language_639_1 | null
  file_path: string /*`/${string}.jpg`*/
  vote_average: number
  vote_count: number
  width: number
}
export type TMDBSearchImagesResult = {
  backdrops: TMDBImage[]
  id: number
  logos: any[]
  posters: TMDBImage[]
}

export type TMDBVideo = {
  iso_639_1: Language_639_1
  iso_3166_1: Language_3166_1 // Only what is after the - sometimes
  name: string
  key: string
  published_at: `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z` // YYYY-mm-ddThh:mm:ss.SSSZ (format iso)
  site: string
  size: number
  type: 'Trailer' | 'Teaser' | 'Behind the Scenes' | 'Bloopers'
  official: boolean
  id: string
}
export type TMDBSearchVideosResults = {
  id: number
  results: TMDBVideo[]
}

export type SearchItem = {
  title: string
  _links: {
    getInformations: {
      href: string /*`/management/film/${string}` | `/management/serie/${string}` */
    }
  }
  _actions: {
    addMedia: {
      href: string //`/management/film/${string}` | `/management/serie/${string}`
      method: 'POST'
      body: NewMedia | undefined
    }
  }
}
export type SearchFilmResult = Partial<Record<Language_639_1, TMDBFilm[]>> & {
  backdrops: TMDBImage[][]
  posters: TMDBImage[][]
  videos: TMDBVideo[][]
}
export type SearchSerieResult = Partial<Record<Language_639_1, TMDBSerie[]>> & {
  backdrops: TMDBImage[][]
  posters: TMDBImage[][]
  videos: TMDBVideo[][]
}

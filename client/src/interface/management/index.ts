import { TypeSupportedLanguages_3166, TypeSupportedLanguages_639 } from './language'

export type Result = {
  tmdb_id: number
} & {
  [language in TypeSupportedLanguages_639]: {
    title: string
    overview: string
  }
}

export interface NewMedia {
  tmdb_id: number
  backdrop: string | null
  posters: Record<TypeSupportedLanguages_3166, string | null>
  trailers: Record<TypeSupportedLanguages_3166, string | null>
}

export interface Research {
  results: Result[] | null
  backdrops: string[][]
  posters: string[][]
  trailers: string[][] | null
  type: 'films' | 'series' | 'seasons'
  _links:
    | {
        continue: { href: `/management?index=${number}` }
      }
    | undefined
  _actions: {
    register: {
      method: 'POST'
      href:
        | `/management/film/${string}` // string => file_id
        | `/management/serie/${string}` // string => serie_id
        | `/management/season/${string}/${number}` // string => season_id
      body: NewMedia | undefined
    }
  }
}

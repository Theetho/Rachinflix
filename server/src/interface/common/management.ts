import { TypeSupportedLanguages_3166, TypeSupportedLanguages_639 } from 'src/tmdb/language'

// export type SearchedFilm = {
//   films: {
//     [language in TypeSupportedLanguages_639]: {
//       title: string
//       overview: string
//       tmdb_id: number
//       backdrop_path: string
//       poster_path: string
//     }[]
//   }
//   backdrops: { height: number; width: number; file_path: string }[][]
//   posters: { height: number; width: number; file_path: string }[][]
//   videos: { language: TypeSupportedLanguages_639 | null; file_path: string }[][]
//   _links: {
//     continue: {
//       href: '/management/series'
//     }
//   }
// }

// export type PostFilm = { tmdb_id: number; backdrop: string | undefined } & Partial<
//   Record<
//     TypeSupportedLanguages_3166,
//     {
//       title: string | undefined
//       overview: string | undefined
//       poster: string | undefined
//       trailer: string | undefined
//     }
//   >
// >

export type SearchedSerie = {
  series: {
    [language in TypeSupportedLanguages_639]: {
      title: string
      overview: string
      tmdb_id: number
      poster_path: string
    }[]
  }
  _links: {
    continue: {
      href: '/management/seasons'
    }
  }
}

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
        continue: {
          href: `/management?type=${'films' | 'series' | 'seasons'}` | `/management/episodes`
        }
      }
    | undefined
  _actions: {
    register: {
      method: 'POST'
      href:
        | `/management/film/${string}` // string => file_id
        | `/management/serie/${string}` // string => serie_id
        | `/management/season/${string}` // string => season_id
      body: NewMedia | undefined
    }
  }
}

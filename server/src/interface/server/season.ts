import { Language, TMDB } from 'src/interface'

export type Season = TMDB & {
  id: string
  number: number
  episode_count: number
  episodes: {
    number: number
    id: string
  }[]
  backdrop: string
  path: string
} & Partial<
    Record<
      Language,
      {
        overview: string
        poster: string
        trailer: string
      }
    >
  >

import { Language, TMDB } from 'src/interface'

export type Serie = TMDB & {
  id: string
  genres: number[]
  season_count: number
  episode_count: number
  seasons: {
    number: number
    id: string
  }[]
  path: string
} & Partial<
    Record<
      Language,
      {
        title: string
        overview: string
      }
    >
  >

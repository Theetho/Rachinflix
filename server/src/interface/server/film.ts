import { Language, TMDB } from 'src/interface'

export type Film = TMDB & {
  id: string
  genres: number[]
  original_title: string
  file_id: string
  backdrop: string
} & Partial<
    Record<
      Language,
      {
        title: string
        overview: string
        poster: string
        trailer: string
      }
    >
  >

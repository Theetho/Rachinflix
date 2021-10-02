import { Language, TMDB } from 'src/interface'

export type Episode = TMDB & {
  id: string
  number: number
  season_number: number
  file_id: string
  thumbnail: string
} & Partial<Record<Language, { title: string; overview: string }>>

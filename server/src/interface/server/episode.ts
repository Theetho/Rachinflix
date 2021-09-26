import { Language, TMDB } from 'src/interface'

export type Episode = TMDB & {
  id: string
  serie_title: string
  number: number
  season_number: number
  file_id: string
  thumbnail: string
} & Record<Language, { title: string; overview: string }>

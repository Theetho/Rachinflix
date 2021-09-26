import { Language } from '..'

export type Registry = {
  films: { id: string; time: number; date: number; delete: boolean }[]
  series: {
    id: string
    episode: number
    season: number
    time: number
    date: number
    delete: boolean
  }[]
}

export type User = {
  id: string
  registry: Registry
  name: string
  languages: {
    text: Language
    audio: Language
  }
  sprite: number
}

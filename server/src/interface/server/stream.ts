import { Language } from 'src/interface'

export type Stream = {
  start?: number
  streams: Partial<Record<Language, any>>
}

export type Remux = { path: string | undefined; done: boolean; progress: number }

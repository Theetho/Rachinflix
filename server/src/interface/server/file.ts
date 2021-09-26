import { Duration, Language } from 'src/interface'

export type File = {
  id: string
  video: {
    codec: string
    needs_transcoding: boolean
    stream_index: number
  }
  audio: {
    codec: string
    needs_transcoding: boolean
    language?: Language
    title: string
    index: number
    stream_index: number
  }[]
  subtitles: {
    language?: Language
    title: string
    is_forced: boolean
    index: number
    path: string
  }[]
  duration: Duration
  path: string
}

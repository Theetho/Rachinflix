import { Language } from '..'

export type AudioHateoas = {
  title: string
  language: Language
  _links: {
    getAudio: { href: `/file/${string}/audio/${number}` }
  }
}

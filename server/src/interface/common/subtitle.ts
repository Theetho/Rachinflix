import { Language } from '..'

export type SubtitleHateoas = {
  title: string
  language: Language
  _links: {
    getSubtitle: { href: `/file/${string}/subtitle/${number}` }
  }
}

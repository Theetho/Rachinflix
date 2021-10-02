import { Language, TMDB } from '..'

export type EpisodeHateoas = TMDB & {
  number: number
  season_number: number
  title: string
  overview: string
  time: number
  _links: {
    getThumbnail: { href: `/episode/${string}/thumbnail` }
    getFile: { href: `/file/${string}?language=${Language}` }
  }
}

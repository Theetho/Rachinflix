import { Language, TMDB } from '..'

export type SeasonHateoas = TMDB & {
  number: number
  episode_count: number
  overview: string
  _links: {
    getPoster: { href: `/season/${string}/poster?language=${Language}` }
    getBackdrop: { href: `/season/${string}/backdrop` }
    getTrailer: { href: `/season/${string}/trailer?language=${Language}` }
    getCurrentEpisode: { href: `/episode/${string}?language=${Language}` }
    getOtherEpisodes: { href: `/episode/${string}?language=${Language}` }[]
  }
}

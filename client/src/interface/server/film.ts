import { Language, TMDB } from '..'

export type FilmHateoas = TMDB & {
  genres: number[]
  title: string
  overview: string
  collection: string[]
  time: number
  _links: {
    getPoster: { href: `/film/${string}/poster?language=${Language}` }
    getBackdrop: { href: `/film/${string}/backdrop` }
    getTrailer: { href: `/film/${string}/trailer?language=${Language}` }
    getFile: { href: `/file/${string}?language=${Language}` }
  }
  _actions: {
    registerProgress: {
      href: `/film/${string}/progress`
      method: 'POST'
      body: any
    }
  }
}

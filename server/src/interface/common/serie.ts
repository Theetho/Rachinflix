import { Language, TMDB } from '..'

export type SerieHateoas = TMDB & {
  genres: number[]
  season_count: number
  episode_count: number
  title: string
  overview: string
  collection: string[]
  _links: {
    getCurrentSeason: {
      href:
        | `/season/${string}?language=${Language}`
        | `/season/${string}?language=${Language}&episode=${number}`
    }
    getOtherSeasons: { href: `/season/${string}?language=${Language}` }[]
  }
  _actions: {
    registerProgress: {
      href: `/serie/${string}/progress`
      method: 'POST'
      body: number | undefined
    }
    requestCustomEpisode: {
      href: `/serie/${string}?language=${Language}`
      method: 'POST'
      body: { season: number | undefined; episode: number | undefined }
    }
  }
}

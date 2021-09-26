import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { Language, SeasonHateoas } from 'src/interface'

@Injectable()
export class SeasonService {
  getSeasonDetailsWithCustomEpisode(
    id: string,
    userId: string,
    language: Language,
    episode: number
  ) {
    const { episodes, number } = Repositories.getSeasonRepository().getById(id)
    const requestedEpisode = episodes.find(({ number }) => number === episode).id
    const { text } = Repositories.getUserRepository().getById(userId).languages

    let details = this.getSeasonDetails(id, userId, language)

    details._links.getCurrentEpisode.href = `/episode/${requestedEpisode}?language=${text}`

    return details
  }

  getSeasonDetails(id: string, userId: string, language: Language): SeasonHateoas {
    const {
      tmdb_id,
      number,
      release_date,
      average_vote,
      vote_count,
      episode_count,
      episodes,
      ...season
    } = Repositories.getSeasonRepository().getById(id)

    const { overview } = season[language]
    const { registry, languages } = Repositories.getUserRepository().getById(userId)
    const { text, audio } = languages

    let episode = episodes[0]
    // We look if the season is in the user profile
    // if so, we set the current episode to the correct value
    for (let i = 0; i < registry.series.length; ++i) {
      const registered = registry.series[i]

      if (registered.delete) continue

      if (
        !Repositories.getSerieRepository()
          .getById(registered.id)
          .seasons.some(season => season.id === id)
      )
        continue

      episode = episodes.find(({ number }) => number === registered.episode)
      break
    }

    return {
      tmdb_id,
      number,
      release_date,
      average_vote,
      vote_count,
      episode_count,
      overview,
      _links: {
        getPoster: { href: `/season/${id}/poster?language=${text}` },
        getTrailer: { href: `/season/${id}/trailer?language=${audio}` },
        getBackdrop: { href: `/season/${id}/backdrop` },
        getCurrentEpisode: { href: `/episode/${episode.id}?language=${text}` },
        getOtherEpisodes: episodes
          .filter(({ id }) => id !== episode.id)
          .map(({ id }) => ({
            href: `/episode/${id}?language=${text}`
          }))
      }
    }
  }
}

import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { EpisodeHateoas, Language } from 'src/interface'

@Injectable()
export class EpisodeService {
  getEpisodeDetails(id: string, userId: string, language: Language): EpisodeHateoas {
    const {
      tmdb_id,
      number,
      season_number,
      release_date,
      average_vote,
      file_id,
      vote_count,
      ...others
    } = Repositories.getEpisodeRepository().getById(id)

    const { title, overview } = others[language]
    const { languages, registry } = Repositories.getUserRepository().getById(userId)
    const { audio } = languages

    let time = 0
    // We look if the episode is in the user profile
    // if so, we set the time to the correct value
    for (let i = 0; i < registry.series.length; ++i) {
      const registered = registry.series[i]

      if (registered.delete) continue

      const seasonId = Repositories.getSerieRepository()
        .getById(registered.id)
        .seasons.find(({ number }) => number === registered.season)?.id

      if (!seasonId) continue

      const episode = Repositories.getSeasonRepository()
        .getById(seasonId)
        .episodes.find(episode => episode.id === id)

      if (!episode) continue

      time = registered.time
      break
    }

    return {
      tmdb_id,
      number,
      release_date,
      season_number,
      average_vote,
      vote_count,
      title,
      overview,
      time,
      _links: {
        getThumbnail: { href: `/episode/${id}/thumbnail` },
        getFile: { href: `/file/${file_id}?language=${audio}` }
      }
    }
  }
}

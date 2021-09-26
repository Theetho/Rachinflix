import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { Language, Serie, SerieHateoas } from 'src/interface'

@Injectable()
export class SerieService {
  getAllSeriesDetails(userId: string, language: Language): SerieHateoas[] {
    return Repositories.getSerieRepository()
      .getAll()
      .map(({ id }) => this.getSerieDetails(id, userId, language))
  }

  getSerieDetailsWithCustomSeasonAndEpisode(
    id: string,
    userId: string,
    language: Language,
    season: number,
    episode: number
  ) {
    const { seasons } = Repositories.getSerieRepository().getById(id)
    const requestedSeason = seasons.find(({ number }) => number === season).id
    const { text } = Repositories.getUserRepository().getById(userId).languages

    let details = this.getSerieDetails(id, userId, language)

    details._links.getCurrentSeason.href = `/season/${requestedSeason}?language=${text}&episode=${episode}`

    return details
  }

  getSerieDetails(id: string, userId: string, language: Language): SerieHateoas {
    const {
      tmdb_id,
      release_date,
      average_vote,
      vote_count,
      genres,
      episode_count,
      season_count,
      seasons,
      ...other
    } = Repositories.getSerieRepository().getById(id)

    const { title, overview } = other[language]
    const { registry, languages } = Repositories.getUserRepository().getById(userId)
    const registered = registry.series.find(serie => serie.id === id && !serie.delete)
    const { text } = languages

    const season = seasons.find(season => season.number === registered?.season) ?? seasons[0]

    return {
      tmdb_id,
      release_date,
      average_vote,
      vote_count,
      genres,
      episode_count,
      season_count,
      title,
      overview,
      collection: Repositories.getSeasonRepository()
        .getById(season.id)
        ['eng-US'].trailer.split('/')
        .slice(2)
        .reverse()
        .slice(2)
        .reverse()
        .concat(other['eng-US'].title)
        .concat(other['fre-FR'].title)
        .reduce(
          (result, current) => (result.includes(current) ? result : [...result, current]),
          []
        ),
      _links: {
        getCurrentSeason: {
          href: `/season/${season.id}?language=${text}`
        },
        getOtherSeasons: seasons
          .filter(({ id }) => id !== season.id)
          .map(({ id }) => {
            return { href: `/season/${id}?language=${text}` }
          })
      },
      _actions: {
        registerProgress: {
          href: `/serie/${id}/progress`,
          method: 'POST',
          body: undefined
        },
        requestCustomEpisode: {
          href: `/serie/${id}?language=${text}`,
          method: 'POST',
          body: { season: undefined, episode: undefined }
        }
      }
    }
  }

  registerSerieProgress(
    id: string,
    userId: string,
    body: { time: number; episode: number; season: number; delete: boolean | undefined }
  ) {
    const user = Repositories.getUserRepository().getById(userId)

    const registeredSerie = user.registry.series.find(serie => serie.id === id && !serie.delete)
    const serie = Repositories.getSerieRepository().getById(id)
    // The serie is registered
    if (registeredSerie) {
      // But its an other episode
      if (registeredSerie.season != body.season || registeredSerie.episode != body.episode) {
        // we delete the previous one
        registeredSerie.delete = true
        // and add the new
        user.registry.series.push({
          id,
          date: Date.now(),
          time: body.time,
          delete: body.delete ?? false,
          episode: body.episode,
          season: body.season
        })
      } else {
        // We update time and delete
        registeredSerie.time = body.time
        registeredSerie.delete = body.delete ?? false

        // And if it is complete, then we register the next one (or not
        // if there is none)
        if (body.delete) {
          const next = this.getNextEpisode(registeredSerie, serie)
          if (next) {
            const { episode, season } = next
            user.registry.series.push({
              id,
              time: 0,
              date: Date.now(),
              delete: false,
              episode,
              season
            })
          }
        }
      }
    } else {
      user.registry.series.push({
        id,
        time: body.time,
        date: Date.now(),
        // Default true so we don't register it unless client wants it
        delete: body.delete ?? true,
        episode: body.episode,
        season: body.season
      })
    }
    Repositories.getUserRepository().save()
  }

  private getNextEpisode(
    registeredSerie: {
      id: string
      episode: number
      season: number
      time: number
      date: number
      delete: boolean
    },
    serie: Serie
  ): { episode: number; season: number } | undefined {
    const season = Repositories.getSeasonRepository().getById(
      serie.seasons.find(({ number }) => number === registeredSerie.season).id
    )
    const isLastSeason = season.number === serie.seasons[serie.seasons.length - 1].number

    const episode = Repositories.getEpisodeRepository().getById(
      season.episodes.find(({ number }) => number === registeredSerie.episode).id
    )
    const isLastEpisode = episode.number === season.episodes[season.episodes.length - 1].number

    // If this is last season and last episode, then nothing to register
    if (isLastSeason && isLastEpisode) {
      return undefined
      // Else if it is the last episode of this season, we find the first episode
      // of the next season
    } else if (isLastEpisode) {
      const nextSeason = serie.seasons.find(({ number }) => number > season.number)
      const nextEpisode = Repositories.getSeasonRepository().getById(nextSeason.id).episodes[0]

      return { season: nextSeason.number, episode: nextEpisode.number }
      // Else, we just find the next episode in this season
    } else {
      const nextEpisode = Repositories.getSeasonRepository()
        .getById(season.id)
        .episodes.find(({ number }) => number > episode.number)

      return { season: season.number, episode: nextEpisode.number }
    }
  }
}

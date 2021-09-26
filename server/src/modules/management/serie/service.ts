import { Injectable } from '@nestjs/common'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { Serie } from 'src/interface'
import { NewMedia, Research, Result } from 'src/interface/common/management'
import { ROOT_IMAGES_TMDB_500, ROOT_IMAGES_TMDB_ORIGINAL } from 'src/tmdb/config'
import { TMDBSerie } from 'src/tmdb/interface'
import { From3166To639, SupportedLanguages_3166, SupportedLanguages_639 } from 'src/tmdb/language'
import { getSerieDetails, searchSerie } from 'src/tmdb/serie'

@Injectable()
export class SerieManagementService extends UseLogger {
  constructor() {
    super()
  }

  async searchSerie(id: string): Promise<Research> {
    const { path } = Repositories.getNewFilesRepository()
      .getSeries()
      .find(serie => serie.id === id)

    const title = path.split('/').pop().toLocaleLowerCase()

    const result: Research = {
      results: [],
      backdrops: [],
      posters: [],
      trailers: null,
      type: 'series',
      _links: {
        continue: {
          href: '/management?type=seasons'
        }
      },
      _actions: {
        register: {
          body: undefined,
          method: 'POST',
          href: `/management/serie/${id}`
        }
      }
    }

    for (let language_639_1 of SupportedLanguages_639) {
      // Searching the movie for each language
      const results = await searchSerie(title, language_639_1)

      if (result.results.length < results.length) {
        result.results = results.map(({ id, name, overview, backdrop_path, poster_path }) => {
          result.backdrops.push([
            backdrop_path ? `${ROOT_IMAGES_TMDB_ORIGINAL}${backdrop_path}` : ''
          ])
          result.posters.push([poster_path ? `${ROOT_IMAGES_TMDB_500}${poster_path}` : ''])

          return {
            tmdb_id: id,
            [language_639_1]: { title: name, overview }
          } as Result
        })
        // Else just add the infos of this language
      } else {
        results.forEach(({ name, overview }, index) => {
          result.results[index][language_639_1] = { title: name, overview }
        })
      }
    }

    return result
  }

  async addSerie(id: string, body: NewMedia) {
    const { path } = Repositories.getNewFilesRepository()
      .getSeries()
      .find(serie => serie.id === id)

    let TMDBSeries: TMDBSerie[] = []
    for (const language of SupportedLanguages_3166) {
      TMDBSeries.push(await getSerieDetails(body.tmdb_id, From3166To639(language)))
    }

    const serie: Serie = {
      id,
      average_vote: TMDBSeries[0].vote_average,
      genres: TMDBSeries[0].genres.map(({ id }) => id),
      release_date: TMDBSeries[0].first_air_date
        .split('-')
        .reverse()
        .join('/') as `${number}/${number}/${number}`,
      tmdb_id: TMDBSeries[0].id,
      vote_count: TMDBSeries[0].vote_count,
      season_count: 0,
      episode_count: 0,
      seasons: [],
      path
    }

    for (const index in SupportedLanguages_3166) {
      const language = SupportedLanguages_3166[index]
      serie[language] = {
        title: TMDBSeries[index].name,
        overview: TMDBSeries[index].overview
      }
    }
    Repositories.getSerieRepository().add(serie)
    Repositories.getNewFilesRepository().remove('series', id)
  }
}

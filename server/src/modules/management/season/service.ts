import { Injectable } from '@nestjs/common'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { sortByNumber } from 'src/helpers/sort'
import { Season } from 'src/interface'
import { NewMedia, Research, Result } from 'src/interface/common/management'
import { ROOT_IMAGES_TMDB_500, ROOT_IMAGES_TMDB_ORIGINAL } from 'src/tmdb/config'
import { TMDBSeason } from 'src/tmdb/interface'
import { From3166To639, SupportedLanguages_3166, SupportedLanguages_639 } from 'src/tmdb/language'
import { getSeasonDetails } from 'src/tmdb/season'
import { searchSerieImages, searchSerieVideos } from 'src/tmdb/serie'

@Injectable()
export class SeasonManagementService extends UseLogger {
  constructor() {
    super()
  }

  async searchSeason(id: string) {
    const { serieId, path } = Repositories.getNewFilesRepository()
      .getSeasons()
      .find(season => season.id === id)

    const seasonNumber = Number.parseInt(
      path
        .split('/')
        .pop()
        .replace(/Season /, '')
    )

    const { tmdb_id } = Repositories.getSerieRepository().getById(serieId)

    const result: Research = {
      results: [],
      backdrops: [],
      posters: [],
      trailers: [],
      type: 'films',
      _links: {
        continue: {
          href: `/management?type=episodes`
        }
      },
      _actions: {
        register: {
          body: undefined,
          method: 'POST',
          href: `/management/season/${id}`
        }
      }
    }

    for (let language_639_1 of SupportedLanguages_639) {
      const season = await getSeasonDetails(tmdb_id, seasonNumber, language_639_1)

      // Initialize with id and the infos of the first language
      if (result.results.length === 0) {
        result.results.push({
          tmdb_id,
          [language_639_1]: { title: season.name, overview: season.overview }
        } as Result)
        // Else just add the infos of this language
      } else {
        result.results[0][language_639_1] = { title: season.name, overview: season.overview }
      }
    }

    // Adding the posters, backdrops and videos for this movie
    const { posters, backdrops } = await searchSerieImages(
      tmdb_id,
      Object.keys(SupportedLanguages_639).map(key => SupportedLanguages_639[key])
    )
    const trailers = await searchSerieVideos(
      tmdb_id,
      Object.keys(SupportedLanguages_639).map(key => SupportedLanguages_639[key])
    )

    result.posters.push(posters.map(image => `${ROOT_IMAGES_TMDB_500}${image.file_path}`))
    result.backdrops.push(backdrops.map(image => `${ROOT_IMAGES_TMDB_ORIGINAL}${image.file_path}`))
    result.trailers.push(trailers.map(video => `https://www.youtube.com/embed/${video.key}`))

    return result
  }

  async addSeason(id: string, body: NewMedia) {
    const { serieId, path } = Repositories.getNewFilesRepository()
      .getSeasons()
      .find(season => season.id === id)

    const seasonNumber = Number.parseInt(
      path
        .split('/')
        .pop()
        .replace(/Season /, '')
    )

    const serie = Repositories.getSerieRepository().getById(serieId)

    if (!serie) {
      throw new Error('No serie registered for this season.')
    }

    let TMDBSeasons: TMDBSeason[] = []
    for (const language of SupportedLanguages_3166) {
      TMDBSeasons.push(await getSeasonDetails(body.tmdb_id, seasonNumber, From3166To639(language)))
    }

    const season: Season = {
      id,
      number: seasonNumber,
      average_vote: 10, //serie.average_vote,
      release_date: '01/01/1970', //serie.release_date,
      tmdb_id: body.tmdb_id,
      vote_count: 10, //serie.vote_count,
      episode_count: 0,
      episodes: [],
      backdrop: path.concat('.jpg'), //body.backdrop,
      path
    }

    for (const index in SupportedLanguages_3166) {
      const language = SupportedLanguages_3166[index]
      season[language] = {
        overview: TMDBSeasons[index].overview,
        poster: path.concat(`/Poster_${language}.jpg`), //body.posters[language],
        trailer: path.concat(`/Trailer_${language}.mp4`) //body.trailers[language]
      }
    }

    serie.seasons = [...serie.seasons, { id: season.id, number: season.number }].sort(sortByNumber)
    serie.season_count += 1

    this.logger.log('Adding season: ')
    this.logger.log(season)
    // Repositories.getSeasonRepository().add(season)
    // Repositories.getNewFilesRepository().remove('seasons', id)
  }
}

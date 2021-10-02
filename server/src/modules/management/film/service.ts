import { Injectable } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { Film } from 'src/interface'
import { NewMedia, Research, Result } from 'src/interface/common/management'
import {
  ROOT_IMAGES_TMDB_500,
  ROOT_IMAGES_TMDB_ORIGINAL,
  ROOT_YTDL,
  ROOT_YTEMBED
} from 'src/tmdb/config'
import { getFilmDetails, searchFilm, searchFilmImages, searchFilmVideos } from 'src/tmdb/film'
import { TMDBFilm } from 'src/tmdb/interface'
import { From3166To639, SupportedLanguages_3166, SupportedLanguages_639 } from 'src/tmdb/language'

@Injectable()
export class FilmManagementService extends UseLogger {
  constructor() {
    super()
  }

  async searchFilm(id: string): Promise<Research> {
    const result: Research = {
      results: [],
      backdrops: [],
      posters: [],
      trailers: [],
      type: 'films',
      _links: {
        continue: {
          href: '/management?type=series'
        }
      },
      _actions: {
        register: {
          body: undefined,
          method: 'POST',
          href: `/management/film/${id}`
        }
      }
    }

    const { fileId } = Repositories.getNewFilesRepository()
      .getFilms()
      .find(film => film.id === id)
    const { path } = Repositories.getFileRepository().getById(fileId)
    const title = path
      .split('/')
      .pop()
      .replace(/^[0-9]+ - /, '')
      .replace('.mkv', '')
      .toLocaleLowerCase()

    for (let language_639_1 of SupportedLanguages_639) {
      const results = await searchFilm(title, language_639_1)

      // Initialize with id and the infos of the first language
      if (result.results.length < results.length) {
        result.results = results.map(
          ({ id, title, overview }) =>
            ({
              tmdb_id: id,
              [language_639_1]: { title, overview }
            } as Result)
        )
        // Else just add the infos of this language
      } else {
        results.forEach(({ title, overview }, index) => {
          result.results[index][language_639_1] = { title, overview }
        })
      }
    }

    // Adding the posters, backdrops and videos for this movie
    for (let { tmdb_id } of result.results) {
      const { posters, backdrops } = await searchFilmImages(
        tmdb_id,
        Object.keys(SupportedLanguages_639).map(key => SupportedLanguages_639[key])
      )
      const trailers = await searchFilmVideos(
        tmdb_id,
        Object.keys(SupportedLanguages_639).map(key => SupportedLanguages_639[key])
      )

      result.posters.push(posters.map(image => `${ROOT_IMAGES_TMDB_500}${image.file_path}`))
      result.backdrops.push(
        backdrops.map(image => `${ROOT_IMAGES_TMDB_ORIGINAL}${image.file_path}`)
      )
      result.trailers.push(trailers.map(video => `${ROOT_YTEMBED}${video.key}`))
    }

    return result
  }

  async addFilm(id: string, body: NewMedia) {
    const { fileId } = Repositories.getNewFilesRepository()
      .getFilms()
      .find(film => film.id === id)
    const { path } = Repositories.getFileRepository().getById(fileId)

    let TMDBfilms: TMDBFilm[] = []
    for (const language of SupportedLanguages_3166) {
      TMDBfilms.push(await getFilmDetails(body.tmdb_id, From3166To639(language)))
    }

    const film: Film = {
      id,
      file_id: fileId,
      backdrop: path.replace('.mkv', '.jpg'),
      average_vote: TMDBfilms[0].vote_average,
      genres: TMDBfilms[0].genres.map(({ id }) => id),
      original_title: TMDBfilms[0].original_title,
      release_date: TMDBfilms[0].release_date
        .split('-')
        .reverse()
        .join('/') as `${number}/${number}/${number}`,
      tmdb_id: TMDBfilms[0].id,
      vote_count: TMDBfilms[0].vote_count
    }

    for (const index in SupportedLanguages_3166) {
      const language = SupportedLanguages_3166[index]
      film[language] = {
        title: TMDBfilms[index].title,
        overview: TMDBfilms[index].overview,
        poster: path.replace('.mkv', `_${language}.jpg`),
        trailer: path.replace('.mkv', `_${language}.mp4`)
      }

      Repositories.getDownloadRepository().add('posters', {
        uri: body.posters[language],
        path: path.replace('.mkv', `_${language}.jpg`)
      })
      Repositories.getDownloadRepository().add('videos', {
        uri: body.trailers[language]?.replace(ROOT_YTEMBED, ROOT_YTDL),
        path: path.replace('.mkv', `_${language}.mp4`)
      })
    }

    Repositories.getDownloadRepository().add('backdrops', {
      uri: body.backdrop,
      path: path.replace('.mkv', '.jpg')
    })

    this.logger.debug(`Adding new film ${inline({ id })}`)
    Repositories.getFilmRepository().add(film)
    Repositories.getNewFilesRepository().remove('films', id)
  }
}

import { Injectable } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { sortByNumber } from 'src/helpers/sort'
import { Episode } from 'src/interface'
import { ROOT_IMAGES_TMDB_500 } from 'src/tmdb/config'
import { getEpisodeDetails } from 'src/tmdb/episode'
import { TMDBEpisode } from 'src/tmdb/interface'
import { From3166To639, SupportedLanguages_3166 } from 'src/tmdb/language'

@Injectable()
export class EpisodeManagementService extends UseLogger {
  constructor() {
    super()
  }

  async addEpisodes() {
    const episodes = Repositories.getNewFilesRepository().getEpisodes()

    for (const { fileId, id, seasonId } of episodes) {
      const { path } = Repositories.getFileRepository().getById(fileId)
      const season = Repositories.getSeasonRepository().getById(seasonId)
      const serie = Repositories.getSerieRepository()
        .getAll()
        .find(({ seasons }) => seasons.some(({ id }) => id === seasonId))

      const episodeNumber = Number.parseInt(
        path
          .split('/')
          .pop()
          .replace(/S[0-9]+E([0-9]+) - .*/, '$1')
      )

      let TMDBEpisodes: TMDBEpisode[] = []
      for (const language of SupportedLanguages_3166) {
        TMDBEpisodes.push(
          await getEpisodeDetails(
            serie.tmdb_id,
            season.number,
            episodeNumber,
            From3166To639(language)
          )
        )
      }

      const episode: Episode = {
        id,
        number: episodeNumber,
        average_vote: TMDBEpisodes[0].vote_average,
        release_date: TMDBEpisodes[0].air_date
          .split('-')
          .reverse()
          .join('/') as `${number}/${number}/${number}`,
        tmdb_id: TMDBEpisodes[0].id,
        vote_count: TMDBEpisodes[0].vote_count,
        file_id: fileId,
        thumbnail: path.replace('.mkv', '.jpg'),
        season_number: season.number
      }

      for (const index in SupportedLanguages_3166) {
        const language = SupportedLanguages_3166[index]
        episode[language] = {
          title: TMDBEpisodes[index].name,
          overview: TMDBEpisodes[index].overview
        }
      }

      Repositories.getDownloadRepository().add('thumbnails', {
        uri: `${ROOT_IMAGES_TMDB_500}${TMDBEpisodes[0].still_path}`,
        path: path.replace('.mkv', '.jpg')
      })

      season.episodes = [...season.episodes, { id: episode.id, number: episode.number }].sort(
        sortByNumber
      )
      season.episode_count += 1
      serie.episode_count += 1

      this.logger.debug(`Adding new episode for the serie ${inline({ id, serieId: serie.id })}`)
      Repositories.getEpisodeRepository().add(episode)
    }

    Repositories.getNewFilesRepository().clear('episodes')
  }
}

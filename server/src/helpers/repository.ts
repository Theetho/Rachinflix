import { NewFileRepository } from 'src/newfilesmanager/repository'
import { EpisodeRepository } from '../modules/episode/repository'
import { FileRepository } from '../modules/file/repository'
import { FilmRepository } from '../modules/film/repository'
import { SeasonRepository } from '../modules/season/repository'
import { SerieRepository } from '../modules/serie/repository'
import { UserRepository } from '../modules/user/repository'

class UseRepositories {
  static readonly filmRepository = new FilmRepository()
  static readonly fileRepository = new FileRepository()
  static readonly userRepository = new UserRepository()
  static readonly serieRepository = new SerieRepository()
  static readonly seasonRepository = new SeasonRepository()
  static readonly episodeRepository = new EpisodeRepository()
  static readonly newFilesRepository = new NewFileRepository()

  getFilmRepository() {
    return UseRepositories.filmRepository
  }
  getFileRepository() {
    return UseRepositories.fileRepository
  }
  getUserRepository() {
    return UseRepositories.userRepository
  }
  getSerieRepository() {
    return UseRepositories.serieRepository
  }
  getSeasonRepository() {
    return UseRepositories.seasonRepository
  }
  getEpisodeRepository() {
    return UseRepositories.episodeRepository
  }
  getNewFilesRepository() {
    return UseRepositories.newFilesRepository
  }
}

const Repositories = new UseRepositories()
export { Repositories }

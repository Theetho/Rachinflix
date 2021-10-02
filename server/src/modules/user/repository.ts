import { Injectable } from '@nestjs/common'
import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import { ROOT_DATABASE } from 'src/config/index'
import { deleteRemuxedFileIfExists } from 'src/helpers/file'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Language, User, UserModification } from 'src/interface'
import { v4 } from 'uuid'
import { EpisodeRepository } from '../episode/repository'
import { FilmRepository } from '../film/repository'
import { SeasonRepository } from '../season/repository'
import { SerieRepository } from '../serie/repository'
import { removeMediaFromDatabase } from './utils'

// Maximum time that a remuxed file is kept on disk
// in milliseconds
const LIMIT_OF_DAY = 10 * 86400000

@Injectable()
export class UserRepository extends UseLogger {
  private static database = new JsonDB(
    new Config(`${ROOT_DATABASE}/DB_USERS.json`, true, true, '/')
  )
  private readonly filmRepository = new FilmRepository()
  private readonly serieRepository = new SerieRepository()
  private readonly seasonRepository = new SeasonRepository()
  private readonly episodeRepository = new EpisodeRepository()
  private readonly root = '/users'

  constructor() {
    super()
  }

  initialize() {
    this.cleanUp('films')
    this.cleanUp('series')
    this.logger.log('Remuxed media cleaned up!')
  }

  getAll(): User[] {
    return UserRepository.database.getData(this.root)
  }

  getById(id: string): User {
    const index = UserRepository.database.getIndex(this.root, id)
    if (index === -1) {
      throw new Error(`There is no user with id ${id}`)
    }
    return UserRepository.database.getData(`${this.root}[${index}]`)
  }

  add(user: User) {
    UserRepository.database.push(`${this.root}[]`, user)
  }

  update(user: User, modification: UserModification) {
    const index = UserRepository.database.getIndex(this.root, user.id)
    if (index === -1) {
      throw new Error(`There is no user with id ${user.id}`)
    }
    UserRepository.database.push(`${this.root}[${index}]`, modification, false)
  }

  delete(id: string) {
    const index = UserRepository.database.getIndex(this.root, id)
    if (index === -1) {
      throw new Error(`There is no user with id ${id}`)
    }
    UserRepository.database.delete(`${this.root}[${index}]`)
  }

  save() {
    UserRepository.database.save()
    UserRepository.database = new JsonDB(
      new Config(`${ROOT_DATABASE}/DB_USERS.json`, true, true, '/')
    )
  }

  private cleanUp(type: 'series' | 'films') {
    this.logger.log(`Cleaning up the remuxed ${type}...`)

    const singular = type.substr(0, type.length - 1)

    let medias = this.getAll()
      .map(({ registry }, userIndex) => registry[type].map(media => ({ userIndex, ...media })))
      .reduce((result, array) => result.concat(array))

    const now = Date.now()
    medias.slice().forEach(media => {
      const time = now - media.date

      if (media.delete) {
        this.logger.log(
          `Removing ${singular} from user registry as it is finished ${inline({ id: media.id })}`
        )
        removeMediaFromDatabase(type, UserRepository.database, this.root, media)
      }

      if (media.delete || time > LIMIT_OF_DAY) {
        let elementToRemove
        if (type === 'series') {
          const serie = this.serieRepository.getById(media.id)
          const season = this.seasonRepository.getById(
            serie.seasons.find(({ number }) => number === media.season).id
          )
          elementToRemove = this.episodeRepository.getById(
            season.episodes.find(({ number }) => number === media.episode).id
          )
        } else if (type === 'films') {
          elementToRemove = this.filmRepository.getById(media.id)
        }

        const { file_id } = elementToRemove
        this.logger.log(`Deleting remuxed ${singular} ${inline({ id: file_id })}`)
        deleteRemuxedFileIfExists(file_id)
      }
    })
    this.save()
  }

  private populate() {
    this.add({
      id: v4(),
      registry: {
        films: [],
        series: []
      },
      name: 'Theetho',
      languages: {
        text: Language.ENG_US,
        audio: Language.ENG_US
      },
      sprite: 5
    })
    this.add({
      id: v4(),
      registry: {
        films: [],
        series: []
      },
      name: 'Hervé',
      languages: {
        text: Language.ENG_US,
        audio: Language.FRE_FR
      },
      sprite: 6
    })
  }
}

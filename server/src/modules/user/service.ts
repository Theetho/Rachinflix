import { Injectable } from '@nestjs/common'
import { ROOT_SPRITES } from 'src/config'
import { Repositories } from 'src/helpers/repository'
import { sortByDate } from 'src/helpers/sort'
import {
  FilmHateoas,
  Language,
  SerieHateoas,
  UserHateoas,
  UserModification,
  UserModifiedOrCreated
} from 'src/interface'
import { v4 } from 'uuid'
import { FilmService, SerieService } from '..'

@Injectable()
export class UserService {
  private readonly serieService = new SerieService()
  private readonly filmService = new FilmService()

  constructor() {}

  getAllUsers(): UserHateoas[] {
    return Repositories.getUserRepository()
      .getAll()
      .map(({ id }) => this.getUser(id))
  }

  addUser(user: UserModifiedOrCreated) {
    const id = v4()

    Repositories.getUserRepository().add({
      id,
      registry: {
        films: [],
        series: []
      },
      ...user
    })
  }

  getUser(id: string): UserHateoas {
    const { languages, sprite, name } = Repositories.getUserRepository().getById(id)

    return {
      id,
      languages,
      name,
      sprite,
      _links: {
        getSprite: { href: `/users/sprite/${sprite}` },
        getProfile: { href: `/user/${id}/profile` }
      },
      _actions: {
        updateUser: { href: `/user/${id}`, method: 'POST', body: undefined },
        deleteUser: { href: `/user/${id}`, method: 'DELETE', body: undefined }
      }
    }
  }

  updateUser(id: string, modification: UserModification) {
    let user = Repositories.getUserRepository().getById(id)

    Repositories.getUserRepository().update(user, modification)

    return this.getUser(id)
  }

  deleteUser(id: string) {
    Repositories.getUserRepository().delete(id)
  }

  getSprite(index: string) {
    const sprite = Number.parseInt(index)
    return `${ROOT_SPRITES}/${sprite < 100 ? (sprite < 10 ? '00' : '0') : ''}${sprite}.png`
  }

  getUserProfile(userId: string, language: Language): (FilmHateoas | SerieHateoas)[] {
    const { registry } = Repositories.getUserRepository().getById(userId)

    return registry.films
      .concat(registry.series)
      .filter(registered => !registered.delete)
      .sort(sortByDate)
      .map(registered =>
        (registered as any).episode
          ? this.getSerieDetails(userId, registered.id, language)
          : this.getFilmDetails(userId, registered.id, language)
      )
  }

  getFilmDetails(userId: string, filmId: string, language: Language): FilmHateoas {
    return this.filmService.getFilmDetails(filmId, userId, language)
  }

  getSerieDetails(userId: string, serieId: string, language: Language): SerieHateoas {
    return this.serieService.getSerieDetails(serieId, userId, language)
  }
}

import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { Language } from 'src/interface'

@Injectable()
export class PosterService {
  getFilmPoster(id: string, language: Language) {
    return Repositories.getFilmRepository().getById(id)[language].poster
  }

  getSeasonPoster(id: string, language: Language) {
    return Repositories.getSeasonRepository().getById(id)[language].poster
  }
}

import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { Language } from 'src/interface'

@Injectable()
export class TrailerService {
  getFilmTrailer(id: string, language: Language) {
    return Repositories.getFilmRepository().getById(id)[language].trailer
  }

  getSeasonTrailer(id: string, language: Language) {
    return Repositories.getSeasonRepository().getById(id)[language].trailer
  }
}

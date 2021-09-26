import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'

@Injectable()
export class BackdropService {
  getFilmBackdrop(id: string): string {
    return Repositories.getFilmRepository().getById(id).backdrop
  }

  getSeasonBackdrop(id: string): string {
    return Repositories.getSeasonRepository().getById(id).backdrop
  }
}

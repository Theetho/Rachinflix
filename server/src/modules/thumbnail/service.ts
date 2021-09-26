import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'

@Injectable()
export class ThumbnailService {
  getThumbnail(id: string): string {
    return Repositories.getEpisodeRepository().getById(id).thumbnail
  }
}

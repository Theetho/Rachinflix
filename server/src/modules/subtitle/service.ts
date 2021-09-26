import { Injectable } from '@nestjs/common'
import { ROOT_SUBTITLES } from 'src/config'
import { Repositories } from 'src/helpers/repository'

@Injectable()
export class SubtitleService {
  getSubtitle(id: string, index: number) {
    return `${ROOT_SUBTITLES}${
      Repositories.getFileRepository()
        .getById(id)
        .subtitles.find(subtitle => subtitle.index === index).path
    }`
  }
}

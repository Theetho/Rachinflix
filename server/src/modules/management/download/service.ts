import { Injectable } from '@nestjs/common'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { downloadBackdrop, downloadPoster, downloadThumbnail } from 'src/management/image'
import { extractSubtitles } from 'src/management/subtitles'
import { downloadTrailer } from 'src/management/video'
import { Database } from 'src/models/database'

@Injectable()
export class DownloadManagementService extends UseLogger {
  constructor() {
    super()
  }

  async downloads() {
    const { videos, backdrops, posters, thumbnails, subtitles } =
      Repositories.getDownloadRepository().getAll()

    for (const { uri, path } of videos) {
      await downloadTrailer(uri, path, this.logger)
    }
    for (const { uri, path } of backdrops) {
      await downloadBackdrop(uri, path)
    }
    for (const { uri, path } of posters) {
      await downloadPoster(uri, path)
    }
    for (const { uri, path } of thumbnails) {
      await downloadThumbnail(uri, path)
    }
    for (const { localFrom, localTo, index } of subtitles) {
      await extractSubtitles(localFrom, localTo, index)
    }

    Repositories.getDownloadRepository().clear()
    this.logger.log(`Downloads complete`)
    Database.database.reload()
  }
}

import { Controller, Get, Param, Query, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { ROOT_THUMBNAILS } from 'src/config'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Language } from 'src/interface'
import { PosterService } from './service'

@Controller()
export class PosterController extends UseLogger {
  constructor(private readonly service: PosterService) {
    super()
  }

  @Get('film/:id/poster')
  getFilmPoster(@Param('id') id: string, @Query('language') language: Language): StreamableFile {
    this.logger.debug(`Request to get the poster of film ${inline({ id })}`)

    const path = ROOT_THUMBNAILS + this.service.getFilmPoster(id, language)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening poster ${inline({ id, language, path })}`)
    })
    return new StreamableFile(stream)
  }

  @Get('season/:id/poster')
  getSeasonPoster(@Param('id') id: string, @Query('language') language: Language): StreamableFile {
    this.logger.debug(`Request to get the poster of episode ${inline({ id })}`)

    const path = ROOT_THUMBNAILS + this.service.getSeasonPoster(id, language)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening poster ${inline({ id, language, path })}`)
    })
    return new StreamableFile(stream)
  }
}

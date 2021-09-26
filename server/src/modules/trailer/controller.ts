import { Controller, Get, Param, Query, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { ROOT_TRAILERS } from 'src/config'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Language } from 'src/interface'
import { TrailerService } from './service'

@Controller()
export class TrailerController extends UseLogger {
  constructor(private readonly service: TrailerService) {
    super()
  }

  @Get('film/:id/trailer')
  getFilmTrailer(@Param('id') id: string, @Query('language') language: Language): StreamableFile {
    this.logger.debug(`Request to get the trailer of film ${inline({ id, language })}`)

    const path = ROOT_TRAILERS + this.service.getFilmTrailer(id, language)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening trailer ${inline({ id, language, path })}`)
    })
    return new StreamableFile(stream)
  }

  @Get('season/:id/trailer')
  getSeasonTrailer(@Param('id') id: string, @Query('language') language: Language): StreamableFile {
    this.logger.debug(`Request to get the trailer of season ${inline({ id, language })}`)

    const path = ROOT_TRAILERS + this.service.getSeasonTrailer(id, language)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening trailer ${inline({ id, language, path })}`)
    })
    return new StreamableFile(stream)
  }
}

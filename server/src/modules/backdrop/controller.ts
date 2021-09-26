import { Controller, Get, Param, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { ROOT_BACKDROPS } from 'src/config'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { BackdropService } from './service'

@Controller()
export class BackdropController extends UseLogger {
  constructor(private readonly service: BackdropService) {
    super()
  }

  @Get('film/:id/backdrop')
  getFilmPoster(@Param('id') id: string): StreamableFile {
    this.logger.debug(`Request to get the backdrop of film ${inline({ id })}`)

    const path = ROOT_BACKDROPS + this.service.getFilmBackdrop(id)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening backdrop ${inline({ id, path })}`)
    })
    return new StreamableFile(stream)
  }

  @Get('season/:id/backdrop')
  getSeasonPoster(@Param('id') id: string): StreamableFile {
    this.logger.debug(`Request to get the backdrop of episode ${inline({ id })}`)

    const path = ROOT_BACKDROPS + this.service.getSeasonBackdrop(id)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening backdrop ${inline({ id, path })}`)
    })
    return new StreamableFile(stream)
  }
}

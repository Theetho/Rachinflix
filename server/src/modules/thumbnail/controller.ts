import { Controller, Get, Param, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { ROOT_THUMBNAILS } from 'src/config'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { ThumbnailService } from './service'

@Controller('episode/:id/thumbnail')
export class ThumbnailController extends UseLogger {
  constructor(private readonly service: ThumbnailService) {
    super()
  }

  @Get()
  getThumbnail(@Param('id') id: string): StreamableFile {
    this.logger.debug(`Request to get thumbnail of episode ${inline({ id })}`)

    const path = ROOT_THUMBNAILS + this.service.getThumbnail(id)

    const stream = createReadStream(path).on('error', error => {
      this.logger.error(`Error while opening thumbnail ${inline({ id, path })}`)
    })
    return new StreamableFile(stream)
  }
}

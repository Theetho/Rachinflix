import { Controller, Get, Param, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { SubtitleService } from './service'

@Controller()
export class SubtitleController extends UseLogger {
  constructor(private readonly service: SubtitleService) {
    super()
  }

  @Get('/file/:id/subtitle/:index')
  getSubtitle(@Param('id') id: string, @Param('index') index: string) {
    this.logger.debug(`Request to get the subtitle of file ${inline({ id, index })}`)

    const path = this.service.getSubtitle(id, Number.parseInt(index))

    return new StreamableFile(
      createReadStream(path).on('error', () => {
        this.logger.error(`Error while opening subtitle ${inline({ path, id, index })}`)
      })
    )
  }
}

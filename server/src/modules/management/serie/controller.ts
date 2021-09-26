import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { NewMedia } from 'src/interface/common/management'
import { SerieManagementService } from './service'

@Controller()
export class SerieManagementController extends UseLogger {
  constructor(private readonly service: SerieManagementService) {
    super()
  }

  @Get('/management/serie/:id')
  async searchSerie(@Param('id') id: string) {
    this.logger.debug(`Request to search a serie ${inline({ id })}`)

    return await this.service.searchSerie(id)
  }

  @Post('/management/serie/:id')
  addSerie(@Param('id') id: string, @Body() body: NewMedia) {
    this.logger.debug(`Request to post a serie ${inline({ id })}`)

    this.service.addSerie(id, body)
  }
}

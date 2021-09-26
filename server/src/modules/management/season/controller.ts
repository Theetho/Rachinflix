import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { NewMedia } from 'src/interface/common/management'
import { SeasonManagementService } from './service'

@Controller()
export class SeasonManagementController extends UseLogger {
  constructor(private readonly service: SeasonManagementService) {
    super()
  }

  @Get('/management/season/:id')
  async searchSeason(@Param('id') id: string) {
    this.logger.debug(`Request to search a season ${inline({ id })}`)

    return await this.service.searchSeason(id)
  }

  @Post('/management/season/:id')
  addSeason(@Param('id') id: string, @Body() body: NewMedia): void {
    this.logger.debug(`Request to post a season ${inline({ id })}`)

    this.service.addSeason(id, body)
  }
}

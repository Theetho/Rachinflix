import { Controller, Get, Query } from '@nestjs/common'
import { UseLogger } from 'src/helpers/logger'
import { ManagementService } from './service'

@Controller()
export class ManagementController extends UseLogger {
  constructor(private readonly service: ManagementService) {
    super()
  }

  @Get('/management')
  async getNewFiles(@Query('type') type: 'films' | 'series' | 'seasons' | 'episodes' | undefined) {
    this.logger.debug(`Request to get the new files`)

    return await this.service.getNewFiles(type)
  }
}

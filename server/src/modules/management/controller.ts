import { Controller, Get, Query } from '@nestjs/common'
import { UseLogger } from 'src/helpers/logger'
import { DownloadManagementService } from './download/service'
import { EpisodeManagementService } from './episode/service'
import { ManagementService } from './service'

@Controller()
export class ManagementController extends UseLogger {
  constructor(
    private readonly service: ManagementService,
    private readonly episodeService: EpisodeManagementService,
    private readonly downloadService: DownloadManagementService
  ) {
    super()
  }

  @Get('/management')
  async getNewFiles(@Query('type') type: 'films' | 'series' | 'seasons' | undefined) {
    this.logger.debug(`Request to get the new files`)

    const newfiles = await this.service.getNewFiles(type)

    if (newfiles == null) {
      this.logger.debug(`Adding all new episodes`)

      this.episodeService.addEpisodes().then(() => {
        this.logger.debug(`Downloading everything`)
        this.downloadService.downloads()
      })
    }

    return newfiles
  }
}

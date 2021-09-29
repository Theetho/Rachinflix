import { Controller, Get } from '@nestjs/common'
import { UseLogger } from 'src/helpers/logger'
import { DownloadManagementService } from '../download/service'
import { EpisodeManagementService } from './service'

@Controller()
export class EpisodeManagementController extends UseLogger {
  constructor(
    private readonly service: EpisodeManagementService,
    private readonly downloadService: DownloadManagementService
  ) {
    super()
  }

  @Get('/management/episodes')
  addEpisodes(): Promise<void> {
    this.logger.debug(`Request to add all new episodes`)

    this.service.addEpisodes().then(() => {
      this.logger.debug(`Downloading everything`)
      this.downloadService.downloads()
    })

    return undefined
  }
}

import { Controller, Get, Param, Query } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { EpisodeHateoas, Language } from 'src/interface'
import { EpisodeService } from './service'

@Controller()
export class EpisodeController extends UseLogger {
  constructor(private readonly service: EpisodeService) {
    super()
  }

  @Get('/episode/:id')
  getEpisodeDetails(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('language') language: Language
  ): EpisodeHateoas {
    this.logger.debug(`Request to get the details of episode ${inline({ id, userId, language })}`)

    return this.service.getEpisodeDetails(id, userId, language)
  }
}

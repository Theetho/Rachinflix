import { Controller, Get, Param, Query } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Language, SeasonHateoas } from 'src/interface'
import { SeasonService } from './service'

@Controller()
export class SeasonController extends UseLogger {
  constructor(private readonly service: SeasonService) {
    super()
  }

  @Get('/season/:id')
  getSeasonDetails(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('language') language: Language,
    @Query('episode') episode: string
  ): SeasonHateoas {
    if (episode != null) {
      this.logger.debug(
        `Request to get the details of season with custom episode ${inline({
          id,
          userId,
          language,
          episode
        })}`
      )

      return this.service.getSeasonDetailsWithCustomEpisode(id, userId, language, Number(episode))
    }

    this.logger.debug(`Request to get the details of season ${inline({ id, userId, language })}`)

    return this.service.getSeasonDetails(id, userId, language)
  }
}

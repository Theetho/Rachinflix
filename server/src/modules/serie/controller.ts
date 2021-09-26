import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Language, SerieHateoas } from 'src/interface'
import { SerieService } from './service'

@Controller()
export class SerieController extends UseLogger {
  constructor(private readonly service: SerieService) {
    super()
  }

  @Get('/series')
  getAllSeriesDetails(
    @Query('userId') userId: string,
    @Query('language') language: Language
  ): SerieHateoas[] {
    this.logger.debug(`Request to get the details of all series ${inline({ userId, language })}`)

    return this.service.getAllSeriesDetails(userId, language)
  }

  @Get('/serie/:id')
  getSerieDetails(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('language') language: Language
  ): SerieHateoas {
    this.logger.debug(`Request to get the details of serie ${inline({ id, userId, language })}`)

    return this.service.getSerieDetails(id, userId, language)
  }

  @Post('/serie/:id')
  requestCustomEpisode(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('language') language: Language,
    @Body() { season, episode }: { season: number; episode: number }
  ): SerieHateoas {
    this.logger.debug(
      `Request to get the details of serie with customs season and episode ${inline({
        id,
        userId,
        language,
        season,
        episode
      })}`
    )

    return this.service.getSerieDetailsWithCustomSeasonAndEpisode(
      id,
      userId,
      language,
      Number(season),
      Number(episode)
    )
  }

  @Post('/serie/:id/progress')
  registerSerieProgress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() body: { time: number; episode: number; season: number; delete: boolean | undefined }
  ) {
    this.logger.debug(`Request to post the progress of film ${inline({ id, userId, body })}`)

    this.service.registerSerieProgress(id, userId, body)
  }
}

import { Controller, Get, Query } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { FilmHateoas, Language, SerieHateoas } from 'src/interface'
import { CarouselService } from './service'

@Controller()
export class CarouselController extends UseLogger {
  constructor(private readonly service: CarouselService) {
    super()
  }

  @Get('carousels')
  getCarousels(
    @Query('userId') userId: string,
    @Query('language') language: Language
  ): Array<FilmHateoas | SerieHateoas> {
    this.logger.debug(`Request to get all the carousels ${inline({ userId, language })}`)

    return this.service.getCarousels(userId, language)
  }
}

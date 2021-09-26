import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { FilmHateoas, Language } from 'src/interface'
import { FilmService } from './service'

@Controller()
export class FilmController extends UseLogger {
  constructor(private readonly service: FilmService) {
    super()
  }

  @Get('/films')
  getAllFilmsDetails(
    @Query('userId') userId: string,
    @Query('language') language: Language
  ): FilmHateoas[] {
    this.logger.debug(`Request to get the details of all films ${inline({ language, userId })}`)

    return this.service.getAllFilmsDetails(userId, language)
  }

  @Get('/film/:id')
  getFilmDetails(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Query('language') language: Language
  ): FilmHateoas {
    this.logger.debug(`Request to get the details of film ${inline({ id, userId, language })}`)

    return this.service.getFilmDetails(id, userId, language)
  }

  @Post('/film/:id/progress')
  registerFilmProgress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() body: { time: number; delete: boolean | undefined }
  ) {
    this.logger.debug(`Request to post the progress of film ${inline({ id, userId, body })}`)

    this.service.registerFilmProgress(id, userId, body)
  }
}

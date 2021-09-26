import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { NewMedia, Research } from 'src/interface/common/management'
import { FilmManagementService } from './service'

@Controller()
export class FilmManagementController extends UseLogger {
  constructor(private readonly service: FilmManagementService) {
    super()
  }

  @Get('/management/film/:id')
  async searchFilm(@Param('id') id: string): Promise<Research> {
    this.logger.debug(`Request to search a film ${inline({ id })}`)

    return await this.service.searchFilm(id)
  }

  @Post('/management/film/:id')
  addFilm(@Param('id') id: string, @Body() body: NewMedia): void {
    this.logger.debug(`Request to post a film ${inline({ id })}`)

    this.service.addFilm(id, body)
  }
}

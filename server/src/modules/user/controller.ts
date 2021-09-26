import { Body, Controller, Delete, Get, Param, Post, Query, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'fs'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import {
  FilmHateoas,
  Language,
  SerieHateoas,
  UserHateoas,
  UserModification,
  UserModifiedOrCreated
} from 'src/interface'
import { UserService } from './service'

@Controller()
export class UserController extends UseLogger {
  constructor(private readonly userService: UserService) {
    super()
  }

  @Get('/users')
  getAllUsers(): UserHateoas[] {
    this.logger.debug(`Request to get all users`)

    return this.userService.getAllUsers()
  }

  @Post('/users')
  addUser(@Body() user: UserModifiedOrCreated) {
    this.logger.debug(`Request to post a new user ${inline({ user })}`)

    this.userService.addUser(user)

    return {
      _links: {
        getUsers: { href: '/users' }
      }
    }
  }

  @Get('/users/sprite/:index')
  getSprite(@Param('index') index: string) {
    this.logger.debug(`Request to get the sprite of the user ${inline({ index })}`)

    const path = this.userService.getSprite(index)

    return new StreamableFile(
      createReadStream(path).on('error', () => {
        this.logger.error(`Error while opening the sprite ${inline({ index, path })}`)
      })
    )
  }

  @Post('/user/:id')
  updateUser(@Param('id') id: string, @Body() modification: UserModification) {
    this.logger.debug(`Request to update the user ${inline({ id })}`)

    return this.userService.updateUser(id, modification)
  }

  @Get('/user/:id')
  getUser(@Param('id') id: string): UserHateoas {
    this.logger.debug(`Request to get the user ${inline({ id })}`)

    return this.userService.getUser(id)
  }

  @Delete('/user/:id')
  deleteUser(@Param('id') id: string) {
    this.logger.debug(`Request to delete the user ${inline({ id })}`)

    return this.userService.deleteUser(id)
  }

  @Get('/user/:id/profile')
  getUserProfile(
    @Param('id') id: string,
    @Query('language') language: Language
  ): (FilmHateoas | SerieHateoas)[] {
    this.logger.debug(`Request to get the profile of the user ${inline({ id })}`)

    return this.userService.getUserProfile(id, language)
  }

  @Get('/user/:id/profile/film/:filmId')
  getFilmDetails(
    @Param('id') id: string,
    @Param('filmId') filmId: string,
    @Query('language') language: Language
  ): FilmHateoas {
    this.logger.debug(
      `Request to get the details of the film for the user ${inline({ filmId, id })}`
    )

    return this.userService.getFilmDetails(id, filmId, language)
  }

  @Get('/user/:id/profile/serie/:serieId')
  getSerieDetails(
    @Param('id') id: string,
    @Param('serieId') serieId: string,
    @Query('language') language: Language
  ): SerieHateoas {
    this.logger.debug(
      `Request to get the details of the serie for the user ${inline({ serieId, id })}`
    )

    return this.userService.getSerieDetails(id, serieId, language)
  }
}

import { Module } from '@nestjs/common'
import { ManagementController } from './controller'
import { DownloadManagementService } from './download/service'
import { EpisodeManagementController } from './episode/controller'
import { EpisodeManagementService } from './episode/service'
import { FilmManagementController } from './film/controller'
import { FilmManagementService } from './film/service'
import { SeasonManagementController } from './season/controller'
import { SeasonManagementService } from './season/service'
import { SerieManagementController } from './serie/controller'
import { SerieManagementService } from './serie/service'
import { ManagementService } from './service'

@Module({
  controllers: [
    ManagementController,
    FilmManagementController,
    SerieManagementController,
    SeasonManagementController,
    EpisodeManagementController
  ],
  exports: [
    ManagementService,
    FilmManagementService,
    SerieManagementService,
    SeasonManagementService,
    EpisodeManagementService,
    DownloadManagementService
  ],
  providers: [
    ManagementService,
    FilmManagementService,
    SerieManagementService,
    SeasonManagementService,
    EpisodeManagementService,
    DownloadManagementService
  ]
})
export class ManagementModule {}

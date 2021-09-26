import { Module } from '@nestjs/common'
import { ManagementController } from './controller'
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
    SeasonManagementController
  ],
  exports: [
    ManagementService,
    FilmManagementService,
    SerieManagementService,
    SeasonManagementService
  ],
  providers: [
    ManagementService,
    FilmManagementService,
    SerieManagementService,
    SeasonManagementService
  ]
})
export class ManagementModule {}

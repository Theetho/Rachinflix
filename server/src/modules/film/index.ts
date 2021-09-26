import { Module } from '@nestjs/common'
import { FilmController } from './controller'
import { FilmService } from './service'

@Module({
  providers: [FilmService],
  controllers: [FilmController],
  exports: [FilmService]
})
export class FilmModule {}

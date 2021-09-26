import { Module } from '@nestjs/common'
import { SerieController } from './controller'
import { SerieService } from './service'

@Module({
  providers: [SerieService],
  controllers: [SerieController],
  exports: [SerieService]
})
export class SerieModule {}

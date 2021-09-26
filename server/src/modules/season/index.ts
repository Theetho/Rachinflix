import { Module } from '@nestjs/common'
import { SeasonController } from './controller'
import { SeasonService } from './service'

@Module({
  providers: [SeasonService],
  controllers: [SeasonController],
  exports: [SeasonService]
})
export class SeasonModule {}

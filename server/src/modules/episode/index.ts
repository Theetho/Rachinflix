import { Module } from '@nestjs/common'
import { EpisodeController } from './controller'
import { EpisodeService } from './service'

@Module({
  providers: [EpisodeService],
  controllers: [EpisodeController],
  exports: [EpisodeService]
})
export class EpisodeModule {}

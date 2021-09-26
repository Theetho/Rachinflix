import { Module } from '@nestjs/common'
import { SubtitleController } from './controller'
import { SubtitleService } from './service'

@Module({
  providers: [SubtitleService],
  controllers: [SubtitleController],
  exports: [SubtitleService]
})
export class SubtitleModule {}

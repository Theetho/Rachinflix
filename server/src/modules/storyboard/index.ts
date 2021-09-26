import { Module } from '@nestjs/common'
import { StoryboardController } from './controller'
import { StoryboardService } from './service'

@Module({
  providers: [StoryboardService],
  controllers: [StoryboardController],
  exports: [StoryboardService]
})
export class StoryboardModule {}

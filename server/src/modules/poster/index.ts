import { Module } from '@nestjs/common'
import { PosterController } from './controller'
import { PosterService } from './service'

@Module({
  providers: [PosterService],
  controllers: [PosterController],
  exports: [PosterService]
})
export class PosterModule {}

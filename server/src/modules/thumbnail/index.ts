import { Module } from '@nestjs/common'
import { ThumbnailController } from './controller'
import { ThumbnailService } from './service'

@Module({
  providers: [ThumbnailService],
  controllers: [ThumbnailController],
  exports: [ThumbnailService]
})
export class ThumbnailModule {}

import { Module } from '@nestjs/common'
import { CarouselController } from './controller'
import { CarouselService } from './service'

@Module({
  providers: [CarouselService],
  controllers: [CarouselController],
  exports: [CarouselService]
})
export class CarouselModule {}

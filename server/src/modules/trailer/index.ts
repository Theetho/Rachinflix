import { Module } from '@nestjs/common'
import { TrailerController } from './controller'
import { TrailerService } from './service'

@Module({
  providers: [TrailerService],
  controllers: [TrailerController],
  exports: [TrailerService]
})
export class TrailerModule {}

import { Module } from '@nestjs/common'
import { BackdropController } from './controller'
import { BackdropService } from './service'

@Module({
  providers: [BackdropService],
  controllers: [BackdropController],
  exports: [BackdropService]
})
export class BackdropModule {}

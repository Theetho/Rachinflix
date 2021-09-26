import { Module } from '@nestjs/common'
import { ActorController } from './controller'
import { ActorService } from './service'

@Module({
  providers: [ActorService],
  controllers: [ActorController],
  exports: [ActorService]
})
export class ActorModule {}

import { Module } from '@nestjs/common'
import { FileController } from './controller'
import { FileService } from './service'

@Module({
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService]
})
export class FileModule {}

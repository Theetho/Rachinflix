// import { Logger } from '@nestjs/common'
import { Logger } from 'src/logger/logger'

export class UseLogger {
  logger: Logger
  constructor() {
    this.logger = new Logger(this.constructor.name)
  }
}

// import { Logger } from '@nestjs/common'
import { Language } from 'src/interface'
import { Logger } from 'src/logger/logger'

export class UseLogger {
  logger: Logger
  constructor() {
    this.logger = new Logger(this.constructor.name)
  }
}

class FileProgressLogger extends Logger {
  // The number of progress to log concurrently
  count: number = 0
  // Is this the first lines to log  ?
  first: boolean = false
  // The progress of each language
  buffer: Record<Language, number> = {} as Record<Language, number>

  constructor(context?: string) {
    super(context)
  }

  // Register the number of progress to log concurrently.
  // We can then clear ${count} lines before logging the new lines.
  register(count: number) {
    this.count = count
    this.first = true
  }

  // Reset the logger for the next file
  unregister() {
    this.count -= 1
    this.count = this.count < 0 ? 0 : this.count
  }

  private flush() {
    // If it is not the first lines, then we must
    // clear the previous ones to log the new ones
    if (!this.first) {
      for (let i = 0; i < this.count; ++i) {
        process.stdout.moveCursor(0, -1)
        process.stdout.clearLine(0)
      }
    }

    // Log the progresses
    Object.keys(this.buffer).forEach((language: Language) => {
      const progress = this.buffer[language]
      const ratio = Math.round((Math.round(progress) / 100) * 20)
      this.log(
        `[${language}]` +
          Array(ratio)
            .fill('#')
            .concat(Array(20 - ratio).fill('_'))
            .reduce((acc, cur) => acc + cur, '[') +
          `] (${progress}%)`
      )
    })

    // Reset the buffer for the next updates
    this.buffer = {} as Record<Language, number>
    // After the first flush, ${this.first} will always be false
    // for this file
    this.first = false
  }
}

export class UseLoggerProgress {
  logger: FileProgressLogger
  constructor() {
    this.logger = new FileProgressLogger(this.constructor.name)
  }
}

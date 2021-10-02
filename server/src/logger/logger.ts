import { Console } from './color'

type LoggingOptions = { foreground?: Console.Foreground; background?: Console.Background }
type LoggingLevel = 'progress' | 'working' | 'success' | 'debug' | 'log' | 'error'
export class Logger {
  // The size of the longest context, to fill the other with '.' and
  // have a uniform output
  private static LongestContext: number = 0
  private static LineCount: number = 0

  private Context: string

  constructor(context?: string) {
    this.Context = context ?? this.constructor.name

    if (context.length > Logger.LongestContext) {
      Logger.LongestContext = context.length
    }
  }

  error(message: any) {
    this.WriteToConsole(`${Console.Foreground.Red}`, 'error', message)
  }
  log(message: any) {
    this.WriteToConsole(`${Console.Foreground.Cyan}`, 'log', message)
  }
  debug(message: any) {
    this.WriteToConsole(`${Console.Foreground.Yellow}`, 'debug', message)
  }
  success(message: any) {
    this.WriteToConsole(`${Console.Effect.Bright}${Console.Foreground.Green}`, 'success', message)
  }
  colorize(messages: any[], options?: LoggingOptions[]) {
    this.Colorize(messages, options)
  }
  progress(percent: number, options?: LoggingOptions) {
    // Get the index of the line that will get updated
    const line = Logger.LineCount

    this.Colorize([this.FormatIntoProgressBar(percent)], [options], 'progress')

    return (percent: number) => {
      // Set the cursor position to the line
      console.log(`\x1b[${line};0H`)
      this.Colorize([this.FormatIntoProgressBar(percent)], [options], 'progress', false)
      // Reset the cursor position to the bottom
      console.log(`\x1b[${Logger.LineCount};0H`)
    }
  }
  updateable(message: any, options?: LoggingOptions) {
    // Get the index of the line that will get updated
    const line = Logger.LineCount

    this.Colorize([message], [options], 'progress')

    return (message: any) => {
      // Set the cursor position to the line
      console.log(`\x1b[${line};0H`)
      this.Colorize([message], [options], 'progress', false)
      // Reset the cursor position to the bottom
      console.log(`\x1b[${Logger.LineCount};0H`)
    }
  }
  working(message: any, options?: LoggingOptions) {
    const line = Logger.LineCount

    this.Colorize([message], [options], 'working')

    let dots = ''

    const interval = setInterval(() => {
      dots += '.'
      if (dots.length > 3) {
        dots = '.'
      }

      console.log(`\x1b[${line};0H`)
      this.Colorize([`${message}${dots}`], [options], 'working', false)
      console.log(`\x1b[${Logger.LineCount};0H`)
    }, 500)

    return () => {
      clearInterval(interval)
      // Set the cursor position to the line
      console.log(`\x1b[${line};0H`)
      this.Colorize([`${message}...`, 'done'], [options, { foreground: Console.Foreground.Green }], 'working', false)
      // Reset the cursor position to the bottom
      console.log(`\x1b[${Logger.LineCount};0H`)
    }
  }

  private Colorize(
    messages: any[],
    options?: LoggingOptions[],
    level: LoggingLevel = 'log',
    increment: boolean = true
  ) {
    this.WriteToConsole(
      Console.Foreground.White,
      level,
      messages
        .map((text, index) => `${options?.[index]?.foreground ?? ''}${options?.[index]?.background ?? ''}${text}`)
        .join(Console.Effect.Reset),
      increment
    )
  }

  private WriteToConsole(color: string, level: LoggingLevel, message: any, increment: boolean = true) {
    console.log(
      `\x1b[2K${color}[${this.FormatDate()}] ${level.toUpperCase()}${this.FillWithSpace(
        'progress'.length,
        level.length
      )} [${this.Context}${this.FillWithSpace(Logger.LongestContext, this.Context.length, '.')}] ${message}${
        Console.Effect.Reset
      }`
    )

    if (increment) {
      Logger.LineCount += 1
    }
  }

  private FormatDate() {
    const now = new Date(Date.now())
    return new RegExp(/([0-9]+:[0-9]+:[0-9]+)/).exec(now.toLocaleString())[1]
  }

  private FillWithSpace(max: number, current: number, filler: string = ' ') {
    return current === max
      ? ''
      : Array(max - current + 1)
          .fill('')
          .join(filler)
  }

  private FormatIntoProgressBar(percent: number) {
    return `[${Array(Math.floor(percent / 2))
      .fill('#')
      .join('')}${Array(50 - Math.floor(percent / 2))
      .fill('.')
      .join('')}] (${percent}%)`
  }
}

const logger = new Logger('ManagementController')
const logger2 = new Logger('FilmController')
const logger3 = new Logger('SerieController')
const logger4 = new Logger('EpisodeController')
const logger5 = new Logger('Controller')
logger.error('Une erreur')
logger2.log('Un log')
logger3.debug('Un debug')
const handle = logger.updateable('Cette ligne va ce mettre à jour')
const ondone = logger3.working('Je télécharge un fichier long')
logger4.success('Un success')
logger5.colorize(
  ['Testons', ' la coloration'],
  [{ foreground: Console.Foreground.Cyan }, { foreground: Console.Foreground.Yellow }]
)

setTimeout(() => {
  handle('Voilà une mise à jour')
}, 1000)
setTimeout(() => {
  handle("Et c'est bon plus de mise à jour")
}, 2000)

setTimeout(ondone, 3000)
setTimeout(() => logger5.success('Le programme est terminé!'), 5000)

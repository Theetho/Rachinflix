import { Console } from './color'

type LoggingOptions = { foreground?: Console.Foreground; background?: Console.Background }
type LoggingLevel = 'progress' | 'working' | 'success' | 'debug' | 'log' | 'error'

export class Logger {
  // The size of the longest context, to fill the other with '.' and
  // have a uniform output
  private static LongestContext: number = 0
  private static LineCount: number = 0
  private static FirstCall: boolean = false

  private Context: string

  constructor(context?: string) {
    if (!Logger.FirstCall) {
      // Clear the screen on first call
      process.stdout.write(`\x1b[0;0\x1b[2J\x1b[0;0H`)
      Logger.FirstCall = true
    }

    this.Context = context ?? this.constructor.name

    if (this.Context.length > Logger.LongestContext) {
      Logger.LongestContext = this.Context.length
    }
  }

  setContext(context: string) {
    this.Context = context
  }
  clear() {
    process.stdout.write(`\x1b[0;0\x1b[2J\x1b[0;0H`)
  }
  error(message: any) {
    this.WriteToConsole(`${Console.Foreground.Red}`, 'error', message)
  }
  log(message: any) {
    this.WriteToConsole(`${Console.Effect.Bright}${Console.Foreground.Green}`, 'log', message)
  }
  debug(message: any) {
    this.WriteToConsole(`${Console.Foreground.Magenta}`, 'debug', message)
  }
  colorize(messages: any[], options?: LoggingOptions[]) {
    this.Colorize(messages, options)
  }
  progress(percent: number, options?: LoggingOptions) {
    this.Colorize(
      [this.FormatIntoProgressBar(percent)],
      [options],
      Console.Foreground.Yellow,
      'progress'
    )

    // Get the index of the line that will get updated
    const line = Logger.LineCount

    return (percent: number) => {
      // Set the cursor position to the line
      process.stdout.write(`\x1b[${line};0H`)
      this.Colorize(
        [this.FormatIntoProgressBar(percent)],
        [options ?? { foreground: Console.Foreground.Yellow }],
        Console.Foreground.Yellow,
        'progress',
        false
      )
      // Reset the cursor position to the bottom
      process.stdout.write(`\x1b[${Logger.LineCount};0H\n`)
    }
  }
  updateable(message: any, options?: LoggingOptions) {
    this.Colorize([message], [options], Console.Foreground.Cyan, 'progress')

    // Get the index of the line that will get updated
    const line = Logger.LineCount

    return (message: any) => {
      // Set the cursor position to the line
      process.stdout.write(`\x1b[${line};0H`)
      this.Colorize([message], [options], Console.Foreground.Cyan, 'progress', false)
      // Reset the cursor position to the bottom
      process.stdout.write(`\x1b[${Logger.LineCount};0H\n`)
    }
  }
  working(message: any, options?: LoggingOptions) {
    this.Colorize([message], [options], Console.Foreground.White, 'working')

    const line = Logger.LineCount

    let dots = ''

    const interval = setInterval(() => {
      dots += '.'
      if (dots.length > 3) {
        dots = '.'
      }

      process.stdout.write(`\x1b[${line};0H`)
      this.Colorize([`${message}${dots}`], [options], Console.Foreground.White, 'working', false)
      process.stdout.write(`\x1b[${Logger.LineCount};0H\n`)
    }, 500)

    return (success: boolean = true) => {
      clearInterval(interval)
      // Set the cursor position to the line
      process.stdout.write(`\x1b[${line};0H`)
      this.Colorize(
        [`${message}...`, success ? 'done' : 'failed'],
        [options, { foreground: success ? Console.Foreground.Green : Console.Foreground.Red }],
        Console.Foreground.White,
        'working',
        false
      )
      // Reset the cursor position to the bottom
      process.stdout.write(`\x1b[${Logger.LineCount};0H\n`)
    }
  }

  private Colorize(
    messages: any[],
    options?: LoggingOptions[],
    maincolor: string = Console.Foreground.White,
    level: LoggingLevel = 'log',
    increment: boolean = true
  ) {
    this.WriteToConsole(
      maincolor,
      level,
      messages
        .map(
          (text, index) =>
            `${options?.[index]?.foreground ?? ''}${options?.[index]?.background ?? ''}${text}`
        )
        .join(Console.Foreground.White),
      increment
    )
  }

  private WriteToConsole(
    color: string,
    level: LoggingLevel,
    message: any,
    increment: boolean = true
  ) {
    process.stdout.write(
      `\x1b[2K${color}[${this.FormatDate()}] ${level.toUpperCase()}${this.FillWithSpace(
        'progress'.length,
        level.length
      )} [${this.Context}${this.FillWithSpace(
        Logger.LongestContext,
        this.Context.length,
        '.'
      )}] ${message}\n${Console.Effect.Reset}`
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
    return `${Array(Math.floor(percent / 2))
      .fill('\u25A0')
      .join('')}${Console.Effect.Bright}${Console.Foreground.Black}${Array(
      50 - Math.floor(percent / 2)
    )
      .fill('\u25A0')
      .join('')}${Console.Foreground.White} (${percent}%)${Console.Effect.Reset}`
  }
}

const clc = require('cli-color')

const OFF = { level: 0, color: clc.white, prefixe: '' }
const ERROR = { level: 1, color: clc.redBright, prefixe: 'Error: ' }
const WARN = { level: 2, color: clc.yellowBright, prefixe: 'Warning: ' }
const INFO = { level: 3, color: clc.xterm(14), prefixe: '' }
const SUCCESS = { level: 3, color: clc.xterm(10), prefixe: '' }
const FAILURE = { level: 3, color: clc.xterm(9), prefixe: '' }
const DEBUG = { level: 4, color: clc.green, prefixe: '' }

class Logger {
  constructor() {
    this._level = DEBUG
    this._progressing = {
      currently: false,
      ids: {},
    }
    this._last = ''
  }
  /**
   * @brief - Set the level of the logger
   *          OFF: 0,
   *          ERROR: 1,
   *          WARN: 2,
   *          INFO: 3,
   *          DEBUG: 4
   *
   * @param {Number} level - The desired level.
   */
  SetLevel(level) {
    if (level < OFF.level || level > DEBUG.level) return

    this._level = level
  }
  /**
   * @brief - Clear the console
   */
  Clear() {
    console.log(clc.reset)
  }
  /**
   * @brief - Add a blanck line
   */
  NewLine() {
    console.log('')
  }
  /**
   * @brief - Move the cursor up the amount of line.
   *
   * @param {Number} line - The number of line to go up.
   * @param {Boolean} predicate - A predicate to move up.
   */
  MoveUp(line = 1, predicate = true) {
    if (!predicate) return

    process.stdout.write(clc.move.up(line))
    process.stdout.write(clc.erase.line)
  }
  /**
   * @brief - Move the cursor up depending on the previous line.
   *
   * @param {String} line - The value of the line to check.
   */
  MoveUpIfLastLineEqual(line) {
    this.MoveUp(this._last == line)
  }
  /**
   * @brief - Start a timer.
   *
   * @param {String} label - Label of the timer.
   */
  Start(label) {
    console.time(label)
  }
  /**
   * @brief - Get the current of the timer.
   *
   * @param {String} label - Label of the timer.
   */
  Tick(label) {
    console.timeLog(label)
  }
  /**
   * @brief - Stop the timer.
   *
   * @param {String} label - Label of the timer.
   */
  Stop(label) {
    console.timeEnd(label)
  }
  Debug(message, ...optionalParams) {
    this._Log(DEBUG, console.log, message, optionalParams)
  }
  Info(message, ...optionalParams) {
    this._Log(INFO, console.log, message, optionalParams)
  }
  Success(message, ...optionalParams) {
    this._Log(SUCCESS, console.log, message, optionalParams)
  }
  Failure(message, ...optionalParams) {
    this._Log(FAILURE, console.log, message, optionalParams)
  }
  Warn(message, ...optionalParams) {
    this._Log(WARN, console.log, message, optionalParams)
  }
  Error(message, ...optionalParams) {
    this._Trace(ERROR, console.log, message, optionalParams)
  }
  /**
   * @brief - Print a the progression of a something (loading for example).
   *
   * @param {Number} percent - The percentage of the download.
   * @param {Number} id - The id of the loading that is to be printed. it allows
   *                   to print several loading on their own line.
   * @param {Any} label - A label to print with the progression.
   */
  Progress(percent, id, label = '') {
    if (Number.isNaN(Number.parseInt(id))) {
      this.Error('Id must be an integer')
    }

    // Store every different id, with their options
    if (!this._progressing.ids[id])
      this._progressing.ids[id] = {
        label: label,
        percent: percent,
      }
    // Else we print every id we stored, so that we can move up the correct
    // amount of line in the console
    else {
      // We have to be sure we were processing, otherwise we could override
      // important lines in the console
      if (this._progressing.currently)
        // Move up the number of progress to print
        this.MoveUp(Object.keys(this._progressing.ids).length)

      // And print them
      for (let progress in this._progressing.ids) {
        const _label = this._progressing.ids[progress].label
        const _percent = this._progressing.ids[progress].percent

        let message = `Processing ${_label}: `

        let number = Number.parseInt(_percent / 2)
        // Display some kind of loading bar
        for (let i = 0; i < number; ++i) message += '#'
        for (let i = 0; i < 50 - number; ++i) message += '.'

        message += ` (${_percent}%)`
        console.log(clc.xterm(7)(message))
      }
      // Remove all id to register them later.
      this._progressing.ids = {}
      // Set that we are processing, so that next time we can replace the previous lines
      this._progressing.currently = true
    }
  }

  _Log(state, logger, messages, ...optionalParams) {
    if (this._level < state.level) return

    if (!Array.isArray(messages)) {
      messages = [messages]
    }

    for (let index in messages) {
      const message = messages[index]
      logger(state.color(state.prefixe + message + optionalParams))
      this._last = message
    }

    this._progressing.currently = false
  }

  _Trace(state, messages, ...optionalParams) {
    this._Log(state, console.trace, messages, optionalParams)
  }
}

if (module) {
  module.exports = new Logger()
}

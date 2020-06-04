'use strict'

if (!module) {
	exports = new Logger()
}

const clc = require('cli-color')

const OFF = { level: 0, color: clc.white, prefixe: '' }
const ERROR = { level: 1, color: clc.redBright, prefixe: 'Error: ' }
const WARN = { level: 2, color: clc.yellowBright, prefixe: 'Warning: ' }
const INFO = { level: 3, color: clc.xterm(3), prefixe: '' }
const DEBUG = { level: 4, color: clc.green, prefixe: '' }

class Logger {
	constructor() {
		this._level = DEBUG
		this._progressing = false
	}
	/**
	 * @brief: Set the level of the logger
	 *
	 * OFF: 0,
	 * ERROR: 1,
	 * WARN: 2,
	 * INFO: 3,
	 * DEBUG: 4
	 *
	 * @param {Number} level
	 */
	SetLevel(level) {
		if (level < OFF || level > DEBUG) return

		this._level = level
	}
	Clear() {
		console.log(clc.reset)
	}
	NewLine() {
		console.log('')
	}
	Start(label) {
		console.time(label)
	}
	Tick(label) {
		console.timeLog(label)
	}
	Stop(label) {
		console.timeEnd(label)
	}
	Debug(message) {
		this._Log(DEBUG, message)
	}
	Info(message) {
		this._Log(INFO, message)
	}
	Warn(message) {
		this._Log(WARN, message)
	}
	Error(message) {
		this._Trace(ERROR, message)
	}
	Progress(percent) {
		if (this._progressing) {
			process.stdout.write(clc.move.up(1))
			process.stdout.write(clc.erase.line)
		}
		console.log(clc.xterm(7)(`Processing: ${percent}%`))

		this._progressing = true
	}

	_Log(state, messages, log = console.log) {
		if (this._level < state.level) return

		if (!Array.isArray(messages)) {
			messages = [messages]
		}

		for (let index in messages) {
			const message = messages[index]
			log(state.color(state.prefixe + message))
		}

		this._progressing = false
	}

	_Trace(state, messages) {
		this._Log(state, messages, console.trace)
	}
}

if (module) {
	module.exports = new Logger()
}

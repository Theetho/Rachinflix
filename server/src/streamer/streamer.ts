import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { ROOT_FILES, ROOT_STREAMS } from 'src/config'
import { createEmptyFile } from 'src/helpers/file'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
// import { UseLoggerProgress } from 'src/helpers/logger'
import { NvidiaCard } from 'src/helpers/nvidia'
import { Duration, File, Language, Remux } from 'src/interface'

export class Streamer extends UseLogger {
  private graphics: NvidiaCard
  private remuxes: Record<string, Omit<Remux, 'path'>>

  constructor() {
    super()
    this.graphics = new NvidiaCard()
    this.remuxes = {}
  }

  /**
   * Remux the input file into several files (one per audio stream)
   *
   * @param file The file to remux
   * @param language The desired language of the audio
   * @returns Remux
   */
  async remux(file: File, language: Language): Promise<Remux> {
    const input = `${ROOT_FILES}${file.path}`
    const outputdir = `${ROOT_STREAMS}/${file.id}`

    // Check if the remuxed has already began or is already done
    const exists = file.audio.some(audio => audio.language === language)
    const path = `${outputdir}/${exists ? language : file.audio[0].language}.mp4`
    if (this.remuxes[file.id]?.done) {
      delete this.remuxes[file.id]
      return { path, done: true, progress: 100 }
    } else if (this.remuxes[file.id]?.done === false) {
      return { path: undefined, ...this.remuxes[file.id] }
    } else if (existsSync(path)) {
      return { path, done: true, progress: 100 }
    }

    let outputoptions = ''

    file.audio.forEach(track => {
      const output = `${outputdir}/${track.language}.mp4`
      createEmptyFile(output)
      outputoptions += ` -y -map 0:v -map 0:${track.stream_index} -c copy -f mp4 "${output}"`
    })

    this.logger.debug(`Preparing the remuxing of file ${inline({ id: file.id })}...`)

    this.remuxes[file.id] = { done: false, progress: 0 }

    const progress = this.logger.progress(this.remuxes[file.id].progress)

    // Start the remuxing
    new Promise((resolve, reject) => {
      this.logger.debug(
        `Executing command: ffmpeg.exe -i "${input}" -loglevel fatal -hide_banner -stats ${outputoptions}`
      )
      // Add blanck line
      console.log()

      const command = spawn('powershell.exe', [
        `-Command`,
        `ffmpeg.exe -i "${input}" -loglevel fatal -hide_banner -stats ${outputoptions}`
      ])
        .on('message', (message, sendHandle) => {
          console.log(message)
        })
        .on('close', (code, signal) => {
          this.remuxes[file.id].done = true
          this.logger.log(`File ${inline({ id: file.id })} remuxed and ready to be served.`)
          resolve(undefined)
        })

      command.stdout.on('data', chunk => {
        this.parse(chunk, file)
        progress(this.remuxes[file.id].progress)
      })
      command.stderr.on('data', chunk => {
        this.parse(chunk, file)
        progress(this.remuxes[file.id].progress)
      })
    })
    return { path: undefined, done: false, progress: 0 }
  }

  // Transform a duration in seconds
  private duration(input: Duration): number {
    const [hours, minutes, seconds] = input.split(':').map(number => Number.parseInt(number))
    return hours * 3600 + minutes * 60 + seconds
  }

  // Parse the ffmpeg line to extract duration, and update the progress
  private parse(chunk: any, file: File) {
    const parsed = new RegExp(/time=([0-9]*:[0-9]*:[0-9]*)/).exec(chunk.toString())
    if (!parsed) return

    const fileDuration = this.duration(file.duration)
    const currentDuration = this.duration(parsed[1] as Duration)

    this.remuxes[file.id].progress = (currentDuration / fileDuration) * 100
  }
}

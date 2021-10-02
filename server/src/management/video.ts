// import { Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import * as Draftlog from 'draftlog'
import * as fs from 'fs'
import { ROOT_TRAILERS, ROOT_YTDLEXE } from 'src/config'
import { Logger } from 'src/logger/logger'

Draftlog(console)

export function createEmptyFile(path: string) {
  const directory = path.split('/').reverse().slice(1).reverse().join('/')
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
  fs.closeSync(fs.openSync(path, 'w'))
}

export async function downloadTrailer(
  trailerUri: string | undefined,
  localPath: string,
  logger: Logger
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${ROOT_TRAILERS}${localPath}`

    const windowsPath = path.replace(/\//g, '\\')

    console.log(`${ROOT_YTDLEXE} -o "${windowsPath}" ${trailerUri}`)

    if (!trailerUri) {
      throw new Error("Rajoute la génération d'un trailer si inexistant")
    }

    const ytdl = spawn('powershell.exe', [
      `-Command`,
      `${ROOT_YTDLEXE} -o "${windowsPath}" ${trailerUri}`
    ])
    const update = console.draft(`Downloading trailer in ${path}...`)
    let text = ''

    ytdl
      .on('error', err => {
        logger.error(err)
        resolve(localPath)
      })
      .on('close', (code, signal) => {
        if (code === 0) {
          update(`Trailer downloaded in ${path}!`)
        }
        resolve(localPath)
      })

    ytdl.stderr.addListener('data', chunk => {
      let newchunk: string = chunk.toString()
      if (newchunk.includes('\r')) {
        const [start, end] = newchunk.split('\r')
        text += start
        logger.error(text)
        text = end
      } else {
        text += newchunk
      }
    })
    ytdl.stdout.addListener('data', chunk => {
      let newchunk: string = chunk.toString()
      if (newchunk.includes('\r')) {
        const [start, end] = newchunk.split('\r')
        text += start
        update(text)
        text = end
      } else {
        text += newchunk
      }
    })
  })
}

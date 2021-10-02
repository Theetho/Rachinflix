// import { Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import * as ffprobe from 'ffmpeg-probe'
import * as Ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'
import { ROOT_TRAILERS, ROOT_YTDLEXE } from 'src/config'
import { Logger } from 'src/logger/logger'

export async function downloadTrailer(
  trailerUri: string | undefined,
  localPath: string
): Promise<string> {
  const logger = new Logger('Downloading')
  const path = `${ROOT_TRAILERS}${localPath}`
  const update = logger.working(`${localPath}`)
  await new Promise<boolean>((resolve, reject) => {
    const windowsPath = path.replace(/\//g, '\\')

    if (!trailerUri) {
      update(false)
      return
    }

    const ytdl = spawn('powershell.exe', [
      `-Command`,
      `${ROOT_YTDLEXE} -o "${windowsPath}" ${trailerUri}`
    ])
    // let text = ''

    ytdl
      .on('error', err => {
        logger.error(err)
        resolve(false)
      })
      .on('close', (code, signal) => {
        if (code === 0) {
          update(true)
        }
        resolve(true)
      })

    // ytdl.stderr.addListener('data', chunk => {
    //   let newchunk: string = chunk.toString()
    //   if (newchunk.includes('\r') || newchunk.includes('\n')) {
    //     const chunks = newchunk.split(/\r|\n/).reverse()
    //     text += chunks.pop()
    //     while (chunks.length > 0) {
    //       update(text)
    //       text = chunks.pop()
    //     }
    //   } else {
    //     text += newchunk
    //   }
    // })
    // ytdl.stdout.addListener('data', chunk => {
    //   let newchunk: string = chunk.toString()
    //   if (newchunk.includes('\r') || newchunk.includes('\n')) {
    //     const chunks = newchunk.split(/\r|\n/).reverse()
    //     text += chunks.pop()
    //     while (chunks.length > 0) {
    //       update(text)
    //       text = chunks.pop()
    //     }
    //   } else {
    //     text += newchunk
    //   }
    // })
  })

  return setAspectRatio(localPath, 640, 360, logger, update)
}

async function setAspectRatio(
  localPath: string,
  width: number,
  height: number,
  logger: Logger,
  update: (success: boolean) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const path = `${ROOT_TRAILERS}${localPath}`

    if (!fs.existsSync(path)) {
      resolve(localPath)
      return
    }

    const probe = await ffprobe(path)

    if (probe.width === width && probe.height === height) {
      resolve(localPath)
      return
    }

    logger.setContext(`Resizing`)
    const output = path.replace('.mp4', '_.mp4')

    Ffmpeg(path)
      .outputOptions([
        `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad='${width}:${height}:(ow-iw)/2:(oh-ih)/2',setsar=1`
      ])
      .save(output)
      .on('end', () => {
        resolve(localPath)
        fs.unlinkSync(path)
        fs.renameSync(output, path)
        update(true)
      })
  })
}

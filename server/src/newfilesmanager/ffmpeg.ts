import { Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import * as Draftlog from 'draftlog'
import * as EventEmitter from 'events'
import { renameSync } from 'fs'
import * as rimraf from 'rimraf'
import { Ffprobe } from './ffprobe'

Draftlog(console)

export async function Ffmpeg(path: string, emitter: EventEmitter, logger: Logger) {
  const output = path.replace(/([\/\\].+)+[\/\\](.+\.mkv)/, '$1/___VALID___$2')

  const [videos, audios] = await Ffprobe(path)
  if (videos == null || audios == null) {
    logger.error(`Can't probe the file ${path}`)
  }

  let needvideo = false
  videos.forEach(video => {
    if (!video.includes('h264') && !video.includes('mjpeg') && !video.includes('png')) {
      needvideo = true
    }
  })

  let needaudio = false
  audios.forEach(audio => {
    const [codec, channels] = audio.split(',')
    if (codec != 'aac' || channels != '2') {
      needaudio = true
    }
  })

  if (!needaudio && !needvideo) {
    emitter.emit('transcodeend', path)
    return
  }

  const command = `${
    needvideo ? '' : '-hwaccel cuvid'
  } -i "${path}" -loglevel error -hide_banner -stats -y ${
    needvideo ? '' : '-gpu 0'
  } -max_muxing_queue_size 9999 -map 0:v -map -v -map V -c:v ${
    needvideo ? 'h264' : 'copy'
  } -map 0:a -c:a ${needaudio ? 'aac -ac 2' : 'copy'} -map 0:s? -c:s copy "${output}"`

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('powershell.exe', [`-Command`, `ffmpeg.exe ${command}`])
    const update = console.draft(`Transcoding ${path}...`)
    let text = ''

    ffmpeg
      .on('error', err => {
        logger.error(err)
        reject()
      })
      .on('close', (code, signal) => {
        if (code === 0) {
          update(`${path} transcoded`)
          rimraf.sync(path)
          renameSync(output, path)
          resolve(undefined)
        } else {
          logger.error(ffmpeg.stderr.read())
          reject()
        }
      })

    // ffmpeg.stdout.pipe(process.stdout)
    ffmpeg.stderr.addListener('data', chunk => {
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

  emitter.emit('transcodeend', path)
}

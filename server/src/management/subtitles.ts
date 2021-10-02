import * as Draftlog from 'draftlog'
import * as Ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'
import { ROOT_FILES, ROOT_SUBTITLES } from 'src/config'
import { createEmptyFile } from 'src/helpers/file'

Draftlog(console)

export async function extractSubtitles(localFrom: string, localTo: string, index: number) {
  const input = `${ROOT_FILES}${localFrom}`
  const output = `${ROOT_SUBTITLES}${localTo}`
  const update = console.draft(`[Extracting] ${localTo}`)
  createEmptyFile(output)

  const created = await new Promise((resolve, reject) => {
    Ffmpeg(input)
      .outputOption([`-map 0:${index}`, `-c:s webvtt`])
      .on('end', (stdout, stderr) => {
        update(`[Extracted] ${localTo}`)
        resolve(true)
      })
      .on('error', (error, stdout, stderr) => {
        update(`[Aborting | Error] ${localTo}`)
        resolve(false)
      })
      .save(output)
  })

  if (!created) {
    fs.unlinkSync(output)
  }
}

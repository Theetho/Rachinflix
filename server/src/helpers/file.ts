import { closeSync, existsSync, mkdirSync, openSync } from 'fs'
import * as rmdir from 'rimraf'
import { ROOT_STREAMS } from 'src/config'
import { File } from 'src/interface'

export function isReadable(file: File) {
  return !(file.video.needs_transcoding || file.audio.length > 1 || file.audio[0].needs_transcoding)
}

export function createEmptyFile(path: string) {
  const directory = path.split('/').reverse().slice(1).reverse().join('/')
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true })
  }
  closeSync(openSync(path, 'w'))
}

export async function deleteRemuxedFileIfExists(id: string) {
  const directory = `${ROOT_STREAMS}/${id}`

  if (!existsSync(directory)) return

  rmdir(directory, err => console.log(err))
}

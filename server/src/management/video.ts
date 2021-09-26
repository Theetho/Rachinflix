import { Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as request from 'request'
import { ROOT_TRAILERS } from 'src/config'
import { createEmptyFile } from 'src/helpers/file'

export async function downloadFilmTrailer(
  trailerUri: string | undefined,
  localPath: string,
  logger: Logger
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${ROOT_TRAILERS}${localPath}`
    createEmptyFile(path)

    if (!trailerUri) {
      throw new Error("Rajoute la génération d'un trailer si inexistant")
    }

    request.head(trailerUri, function (err, res, body) {
      request(trailerUri)
        .pipe(fs.createWriteStream(path))
        .on('open', () => {
          logger.log(`Downloading the trailer in ${localPath}...`)
        })
        .on('close', () => {
          logger.log(`Downloaded the trailer in ${localPath}`)
          resolve(localPath)
        })
    })
  })
}

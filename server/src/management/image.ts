import { Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as request from 'request'
import { ROOT_BACKDROPS, ROOT_THUMBNAILS } from 'src/config'
import { createEmptyFile } from 'src/helpers/file'

export async function downloadFilmBackdrop(
  backdropUri: string | undefined,
  localPath: string,
  logger: Logger
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${ROOT_BACKDROPS}${localPath}`
    createEmptyFile(path)

    if (!backdropUri) {
      throw new Error("Rajoute la génération d'un backdrop si inexistant")
    }

    request.head(backdropUri, function (err, res, body) {
      request(backdropUri)
        .pipe(fs.createWriteStream(path))
        .on('open', () => {
          logger.log(`Downloading the backdrop in ${localPath}...`)
        })
        .on('close', () => {
          logger.log(`Downloaded the backdrop in ${localPath}`)
          resolve(localPath)
        })
    })
  })
}

export async function downloadFilmPoster(
  posterUri: string | undefined,
  localPath: string,
  logger: Logger
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${ROOT_THUMBNAILS}${localPath}`
    createEmptyFile(path)

    if (!posterUri) {
      throw new Error("Rajoute la génération d'un poster si inexistant")
    }

    request.head(posterUri, function (err, res, body) {
      request(posterUri)
        .pipe(fs.createWriteStream(path))
        .on('open', () => {
          logger.log(`Downloading the poster in ${localPath}...`)
        })
        .on('close', () => {
          logger.log(`Downloaded the poster in ${localPath}`)
          resolve(localPath)
        })
    })
  })
}

import * as Draftlog from 'draftlog'
import * as fs from 'fs'
import * as request from 'request'
import { ROOT_BACKDROPS, ROOT_THUMBNAILS } from 'src/config'
import { createEmptyFile } from 'src/helpers/file'

Draftlog(console)

export async function downloadBackdrop(
  backdropUri: string | undefined,
  localPath: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const path = `${ROOT_BACKDROPS}${localPath}`
    createEmptyFile(path)

    if (!backdropUri) {
      resolve(localPath)
      return
    }

    const update = console.draft(`[Downloading] ${localPath}`)

    request.head(backdropUri, function (err, res, body) {
      request(backdropUri)
        .pipe(fs.createWriteStream(path))
        .on('close', () => {
          update(`[Downloaded] ${localPath}`)
          resolve(localPath)
        })
        .on('error', err => {
          update(`[Aborting | Error] ${path}: ${err}`)
        })
    })
  })
}

export async function downloadPoster(
  posterUri: string | undefined,
  localPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${ROOT_THUMBNAILS}${localPath}`
    createEmptyFile(path)

    if (!posterUri) {
      resolve(localPath)
      return
    }
    const update = console.draft(`[Downloading] ${localPath}`)

    request.head(posterUri, function (err, res, body) {
      request(posterUri)
        .pipe(fs.createWriteStream(path))
        .on('close', () => {
          update(`[Downloaded] ${localPath}`)
          resolve(localPath)
        })
        .on('error', err => {
          update(`[Aborting | Error] ${path}: ${err}`)
        })
    })
  })
}

export async function downloadThumbnail(
  thumbnailUri: string | undefined,
  localPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = `${ROOT_THUMBNAILS}${localPath}`
    createEmptyFile(path)

    if (!thumbnailUri) {
      resolve(localPath)
      return
    }
    const update = console.draft(`[Downloading] ${localPath}`)

    request.head(thumbnailUri, function (err, res, body) {
      request(thumbnailUri)
        .pipe(fs.createWriteStream(path))
        .on('close', () => {
          update(`[Downloaded] ${localPath}`)
          resolve(localPath)
        })
        .on('error', err => {
          update(`[Aborting | Error] ${path}: ${err}`)
        })
    })
  })
}

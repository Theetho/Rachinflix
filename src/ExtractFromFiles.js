const fs = require('fs')
const ffprobe = require('ffmpeg-probe')
const ffmpeg = require('fluent-ffmpeg')
const logger = require('./logger')

const { ExtraireInformationsSousTitre } = require('./bdd/Fichier')
const CreateFoldersFromPath = require('./CreateFoldersFromPath')
const { ROOT_SUBTITLES, ROOT_TRAILERS, ROOT_THUMBNAILS } = require('./constantsServer')
const { resolve } = require('path')
const TRAILER_DURATION = 120 // In sec
const BEGIN_AT = 0.1

async function ExtractFromFiles(new_files) {
  await new Promise((resolve, reject) => {
    logger.Info('On attend que les téléchargements soient finis...')
    setTimeout(resolve, 10000)
  })

  const episodes = Object.values(new_files)
    .filter((e) => {
      return e.paths.local.includes('/Series/')
    })
    .sort((e1, e2) => {
      const episode1 = Number.parseInt(e1.paths.local.split('/')[4].replace(/S[0-9]+E([0-9]+) - .*/, '$1'))
      const episode2 = Number.parseInt(e2.paths.local.split('/')[4].replace(/S[0-9]+E([0-9]+) - .*/, '$1'))

      return episode1 < episode2 ? -1 : 1
    })
  const films = Object.values(new_files).filter((e) => {
    return e.paths.local.includes('/Films/')
  })

  const files = films.concat(episodes)

  for (const file of files) {
    logger.Clear()
    logger.Info(`Extracting ${file.title}...`)

    const is_film = file.paths.absolute.includes('/Films/')

    await ExtractTrailer(file, is_film)

    if (!is_film) await ExtractThumbnail(file)

    await ExtractSubtitles(file)
  }
}

async function ExtractSubtitles(file) {
  CreateFoldersFromPath(`${ROOT_SUBTITLES}`, file.paths.local)

  const informations = await ffprobe(file.paths.absolute)

  let index = 1
  for (let stream_index in informations.streams) {
    const track = informations.streams[stream_index]

    if (track['codec_type'] != 'subtitle') continue

    const subtitle = ExtraireInformationsSousTitre(track, index++)
    const subtitle_path = `${ROOT_SUBTITLES}${file.paths.local
      .split('/')
      .filter((e) => {
        return !e.includes('mkv')
      })
      .join('/')}/${file.title}_${subtitle.index}.vtt`
    const codec = track['codec_name'] === 'webvtt' ? 'copy' : 'webvtt'

    const Extract = async () => {
      return new Promise((resolve, reject) => {
        if (fs.existsSync(subtitle_path)) {
          resolve(true)
          return
        }

        ffmpeg(file.paths.absolute)
          .outputOption([`-map 0:${stream_index}`, `-c:s ${codec}`])
          .on('start', () => {
            logger.Info(`Extracting subtitle ${subtitle.index}...`)
          })
          .on('end', (stdout, stderr) => {
            logger.MoveUp()
            logger.Info(`${file.title}_${subtitle.index}.vtt created`)
            resolve(true)
          })
          .on('error', (error, stdout, stderr) => {
            resolve(false)
          })
          .save(subtitle_path)
      })
    }

    const created = await Extract()
    if (!created && fs.existsSync(subtitle_path)) {
      fs.unlinkSync(subtitle_path)
    }
  }
}

async function ExtractThumbnail(file) {
  CreateFoldersFromPath(`${ROOT_THUMBNAILS}`, file.paths.local)

  const thumbnail_path = `${ROOT_THUMBNAILS}${file.paths.local.replace('.mkv', '.jpg')}`

  return new Promise(async (resolve, reject) => {
    // If the subtitle already exists, we don't need to reextract it
    if (fs.existsSync(thumbnail_path)) resolve()
    else {
      try {
        var metadata = await ffprobe(file.paths.absolute)
      } catch (err) {
        logger.Error(`Error while getting metadata in file: ${file.paths.absolute} ==> ${err}`)
      }

      // Start time in seconds
      const start_time = (metadata.format.duration * BEGIN_AT).toFixed(0)

      ffmpeg(file.paths.absolute)
        .outputOption([`-ss ${start_time}`, '-s 640x360', `-frames 1`])
        .on('start', () => {
          logger.Info('Extracting thumbnail...')
        })
        .on('end', (stdout, stderr) => {
          logger.MoveUp()
          logger.Info(`${file.title}.jpg created`)
          resolve()
        })
        .on('error', (error, stdout, stderr) => {
          reject()
        })
        .save(thumbnail_path)
    }
  })
}

async function ExtractTrailer(file, is_film) {
  CreateFoldersFromPath(ROOT_TRAILERS, file.paths.local)

  const Extract = async (language) => {
    return new Promise(async (resolve, reject) => {
      const trailer_path = `${ROOT_TRAILERS}${file.paths.local.replace(`${file.title}`, `${is_film ? `${file.title}_${language}` : `Trailer_${language}`}`)}`
      // If the subtitle already exists, we don't need to reextract it
      if (fs.existsSync(trailer_path)) resolve()
      else {
        const audio_track =
          file.audio.find((e) => {
            return e.language == language
          }) || file.audio[0]

        ffmpeg(file.paths.absolute)
          .outputOption([
            `-map 0:${file.video.stream_index}`,
            `-c:v h264`,
            `-map 0:${audio_track.stream_index}`,
            `-c:a ${audio_track.needs_transcoding ? 'aac' : 'copy'}`,
            `-t ${TRAILER_DURATION}`,
            '-r 24',
            '-f matroska',
            '-s 640x360',
          ])
          .on('start', () => {
            logger.Info(`Extracting trailer ${language}...`)
          })
          .on('end', (stdout, stderr) => {
            logger.MoveUp()
            logger.Info(`Trailer_${language} created`)
            resolve()
          })
          .on('error', (error, stdout, stderr) => {
            reject()
          })
          .save(trailer_path)
      }
    })
  }

  for (const language of ['eng-US', 'fre-FR']) {
    await Extract(language)
  }
}

module.exports = {
  ExtractFromFiles,
}

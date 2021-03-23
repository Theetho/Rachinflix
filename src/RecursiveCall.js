const fs = require('fs')
const { ExtraireInformationsSousTitre } = require('./bdd/Fichier')
const ffprobe = require('ffmpeg-probe')
const ffmpeg = require('fluent-ffmpeg')
const logger = require('./logger')

// Required in preset: 'ExtractSubtitle'
const CreateFoldersFromPath = require('./CreateFoldersFromPath')

async function _RecursiveCall(fn, root, path = '') {
  const current_directory = fs.readdirSync(root + path)

  for (let element in current_directory) {
    const file_name = current_directory[element]

    // logger.Info(`Élément en cours d'analyse: ${file_name}`)

    const paths = {
      local: path + '/' + file_name,
      absolute: root + (path == '' ? '/' : path + '/') + file_name,
    }

    try {
      var is_directory = fs.statSync(paths.absolute).isDirectory()
    } catch {
      console.error(`Le dossier ou fichier ${paths.absolute} n'existe pas.`)
      continue
    }

    if (is_directory) {
      await _RecursiveCall(fn, root, paths.local)
    } else {
      await fn(paths, file_name)
    }
  }
}

const { ROOT_FILES, ROOT_SUBTITLES, ROOT_TRAILERS, ROOT_THUMBNAILS } = require('./constantsServer')
const TRAILER_DURATION = 120 // In sec
const BEGIN_AT = 0.05

const Presets = {
  ExtractSubtitles: {
    fn: async (paths, file_name) => {
      file_name = file_name.replace('.mkv', '')

      logger.Clear()
      logger.Info(`Extracting ${file_name}...`)

      const informations = await ffprobe(paths.absolute)

      CreateFoldersFromPath(`${ROOT_SUBTITLES}`, paths.local)

      let index = 1
      for (let indice in informations.streams) {
        const piste = informations.streams[indice]

        if (piste['codec_type'] != 'subtitle') continue

        const subtitle = ExtraireInformationsSousTitre(piste, index++)
        const path = `${ROOT_SUBTITLES}${paths.local
          .split('/')
          .filter((e) => {
            return !e.includes('mkv')
          })
          .join('/')}/${file_name}_${subtitle.index}.vtt`
        const codec = piste['codec_name'] === 'webvtt' ? 'copy' : 'webvtt'

        const Extract = async () => {
          return new Promise((resolve, reject) => {
            if (fs.existsSync(path)) {
              resolve(true)
              return
            }

            ffmpeg(paths.absolute)
              .outputOption([`-map 0:${indice}`, `-c:s ${codec}`])
              .on('end', (stdout, stderr) => {
                logger.Info(`${file_name}_${subtitle.index}.vtt created`)
                resolve(true)
              })
              .on('error', (error, stdout, stderr) => {
                resolve(false)
              })
              .save(path)
          })
        }

        const sub = await Extract()
        if (!sub && fs.existsSync(path)) {
          fs.unlinkSync(path)
        }
      }
    },
    root: ROOT_FILES,
  },
  ExtractThumbnails: {
    fn: async (paths, file_name) => {
      if (paths.absolute.includes('/Films/'))
        return new Promise((resolve) => {
          resolve()
        })
      file_name = file_name.replace('.mkv', '')

      logger.Clear()
      logger.Info(`Extracting ${file_name}...`)

      CreateFoldersFromPath(`${ROOT_THUMBNAILS}`, paths.local)
      const thumbnail_path = `${ROOT_THUMBNAILS}${paths.local.replace('.mkv', '.jpg')}`

      return new Promise(async (resolve, reject) => {
        // If the subtitle already exists, we don't need to reextract it
        if (fs.existsSync(thumbnail_path)) resolve()
        else {
          let metadata = 0
          try {
            metadata = await ffprobe(paths.absolute)
          } catch (err) {
            logger.Error(`Error while getting metadata in file: ${paths.absolute} ==> ${err}`)
          }

          // Start time in seconds
          const start_time = (metadata.format.duration * BEGIN_AT).toFixed(0)

          ffmpeg(paths.absolute)
            .outputOption([`-ss ${start_time}`, '-s 640x360', `-frames 1`])
            .on('start', (command) => {
              logger.Debug(command)
            })
            .on('progress', (progress) => {
              logger.Progress(progress.percent.toFixed(2), 0, 'thumbnail')
            })
            .on('end', (stdout, stderr) => {
              resolve()
            })
            .on('error', (error, stdout, stderr) => {
              reject()
            })
            .save(thumbnail_path)
        }
      })
    },
    root: ROOT_FILES,
  },
}

async function RecursiveCall(preset_name) {
  const preset = Presets[preset_name]

  if (!preset) {
    console.log(`No preset with name '${preset_name}'`)
    return
  }

  await _RecursiveCall(preset.fn, preset.root)
}

//RecursiveCall('ExtractTrailer')

module.exports = RecursiveCall

const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const { ROOT_TRAILERS } = require('../constantsServer')
const logger = require('../logger')
const SetAspectRatio = require('../SetAspectRatio')

function CreerLeDossierInexistant(chemin) {
  const dossiers = chemin.split('/')
  let chemin_courant = ROOT_TRAILERS

  for (let dossier of dossiers) {
    chemin_courant += dossier + '/'
    if (!fs.existsSync(chemin_courant)) fs.mkdirSync(chemin_courant)
  }
}

async function TelechargerUneBandeAnnonce(url, dossier, titre, langue) {
  if (!url) return

  CreerLeDossierInexistant(dossier)

  dossier = ROOT_TRAILERS + dossier

  const info = await ytdl.getInfo(url)

  const trailer_path = `${dossier}/${titre}_${langue}.mkv`

  if (fs.existsSync(trailer_path)) return

  try {
    let two_files = await TelechargerDepuisDeuxFichiers(url, info, dossier, titre, langue)

    if (!two_files) two_files = await TelechargerDepuisUnFichier(url, info, dossier, titre, langue)
    if (!two_files) {
      logger.Failure(`No trailer available for ${titre}_${langue}`)
      return
    }

    await SetAspectRatio(trailer_path, 640, 360)
  } catch (e) {
    logger.Failure(`Erreur lors du téléchargement du trailer '${titre}_${langue}'`)
    logger.Error(e)
  }
}

function TelechargerDepuisUnFichier(url, info, dossier, titre, langue) {
  return new Promise((resolve, reject) => {
    const fichier = RecupererLesFormatsAudioEtVideo(info.formats)

    if (!fichier.length) {
      resolve(false)
      return
    }

    ytdl(url, { quality: fichier.itag })
      .pipe(fs.createWriteStream(`${dossier}/${titre}_${langue}_audio_video.mp4`))
      .on('close', () => {
        ffmpeg(`${dossier}/${titre}_${langue}_audio_video.mp4`)
          .outputOption(['-c:v copy', '-c:a copy', '-strict -2'])
          .on('error', () => {
            logger.Failure(`Erreur lors du téléchargement du trailer '${titre}_${langue}'`)
            fs.unlinkSync(`${dossier}/${titre}_${langue}_audio_video.mp4`)
            reject()
          })
          .on('end', (progress) => {
            logger.Success(`Trailer '${titre}_${langue}.mkv' a bien été téléchargé.`)
            fs.unlinkSync(`${dossier}/${titre}_${langue}_audio_video.mp4`)
            resolve(true)
          })
          .save(`${dossier}/${titre}_${langue}.mkv`)
      })
  })
}

function TelechargerDepuisDeuxFichiers(url, info, dossier, titre, langue) {
  return new Promise((resolve, reject) => {
    const audio_format = RecupererLesFormatsAudio(info.formats)
    const video_format = RecupererLesFormatsVideo(info.formats)
    if (!audio_format.length || !video_format.length) {
      resolve(false)
      return
    }

    const audio = audio_format[0]
    const video = video_format[0]

    if (!video || !audio) {
      resolve(false)
      return
    }

    ytdl(url, { quality: audio.itag })
      .pipe(fs.createWriteStream(`${dossier}/${titre}_${langue}_audio.mp4`))
      .on('error', () => {
        logger.Failure(`Erreur lors du téléchargement du trailer '${titre}_${langue}'`)
        fs.unlinkSync(`${dossier}/${titre}_${langue}_audio.mp4`)
        reject()
      })
      .on('close', () => {
        ytdl(url, { quality: video.itag })
          .pipe(fs.createWriteStream(`${dossier}/${titre}_${langue}_video.mp4`))
          .on('error', () => {
            logger.Failure(`Erreur lors du téléchargement du trailer '${titre}_${langue}'`)
            fs.unlinkSync(`${dossier}/${titre}_${langue}_video.mp4`)
            fs.unlinkSync(`${dossier}/${titre}_${langue}_audio.mp4`)
            reject()
          })
          .on('close', () => {
            ffmpeg(`${dossier}/${titre}_${langue}_video.mp4`)
              .input(`${dossier}/${titre}_${langue}_audio.mp4`)
              .outputOption(['-c:v copy', '-c:a copy', '-strict -2'])
              .on('error', () => {
                logger.Failure(`Erreur lors du téléchargement du trailer '${titre}_${langue}'`)
                fs.unlinkSync(`${dossier}/${titre}_${langue}_audio.mp4`)
                fs.unlinkSync(`${dossier}/${titre}_${langue}_video.mp4`)
                reject()
              })
              .on('end', (progress) => {
                logger.Success(`Trailer '${titre}_${langue}.mkv' sauvegardé.`)
                fs.unlinkSync(`${dossier}/${titre}_${langue}_audio.mp4`)
                fs.unlinkSync(`${dossier}/${titre}_${langue}_video.mp4`)
                resolve(true)
              })
              .save(`${dossier}/${titre}_${langue}.mkv`)
          })
      })
  })
}

function RecupererLesFormatsAudioEtVideo(formats) {
  const min_height = 360
  const min_debit = 48

  let resultat = ytdl
    .filterFormats(formats, 'audioandvideo')
    .filter((element) => {
      return element.height >= min_height && element.audioBitrate >= min_debit
    })
    .sort((e1, e2) => {
      return e1.height < e2.height ? -1 : e1.height == e2.height ? (e1.audioBitrate < e2.audioBitrate ? -1 : 1) : 1
    })

  return resultat || []
}

function RecupererLesFormatsAudio(formats) {
  const min_debit = 48

  let resultat = ytdl
    .filterFormats(formats, 'audioonly')
    .filter((element) => {
      return element.audioBitrate >= min_debit
    })
    .sort((e1, e2) => {
      return e1.audioBitrate < e2.audioBitrate ? -1 : 1
    })

  return resultat || []
}

function RecupererLesFormatsVideo(formats) {
  const min_height = 360

  let resultat = ytdl
    .filterFormats(formats, 'videoonly')
    .filter((element) => {
      return element.height >= min_height
    })
    .sort((e1, e2) => {
      return e1.height < e2.height ? -1 : 1
    })

  return resultat || []
}

module.exports = {
  TelechargerUneBandeAnnonce,
}

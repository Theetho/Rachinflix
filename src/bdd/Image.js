const fs = require('fs')
const request = require('request')
const { ROOT_THUMBNAILS } = require('../constantsServer')
const logger = require('../logger')

function CreerLeDossierInexistant(chemin) {
  const dossiers = chemin.split('/')
  let chemin_courant = ROOT_THUMBNAILS

  for (let dossier of dossiers) {
    chemin_courant += dossier + '/'
    if (!fs.existsSync(chemin_courant)) fs.mkdirSync(chemin_courant)
  }
}

function TelechargerLaMiniature(chemin_TMDB, chemin_local, nom, langue = null) {
  return new Promise((resolve, reject) => {
    if (!chemin_TMDB) {
      resolve()
      return
    }

    const uri = `https://image.tmdb.org/t/p/w500/${chemin_TMDB}`
    const chemin_absolu = `${ROOT_THUMBNAILS}${chemin_local}/${nom}${langue ? '_' + langue : ''}.jpg`

    CreerLeDossierInexistant(chemin_local)

    fs.writeFileSync(chemin_absolu, null)

    request.head(uri, function(err, res, body) {
      request(uri)
        .pipe(fs.createWriteStream(chemin_absolu))
        .on('close', () => {
          logger.Success(`Miniature '${nom}${langue ? '_' + langue : ''}.jpg' a bien été téléchargée.`)
          resolve()
        })
    })
  })
}

module.exports = {
  TelechargerLaMiniature,
}

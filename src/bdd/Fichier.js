const fs = require('fs')
const path = require('path')
const ffprobe = require('ffmpeg-probe')
const CODECS_VIDEO_LISIBLE = ['h264', 'mjpeg']
const CODECS_AUDIO_LISIBLE = ['libmp3lame', 'aac']

const pistes_sans_langues = []

const LANGUES_VIA_ISO_639_1 = {
  eng: 'English',
  spa: 'Spanish',
  ara: 'Arabic',
  dan: 'Danish',
  dut: 'Dutch',
  est: 'Estinian',
  fin: 'Finnish',
  ger: 'German',
  hun: 'Hungarian',
  ita: 'Italian',
  nor: 'Norwegian',
  por: 'Portuguese',
  rum: 'Romanian',
  rus: 'Russian',
  swe: 'Swedish',
  tur: 'Turkish',
  fre: 'French',
  fra: 'French',
  kor: 'Korean',
  frf: 'French',
  pol: 'Polish',
  scc: 'Serbian',
  bul: 'Bulgarian',
  scr: 'Unknown',
  cze: 'Czech',
  gre: 'Greek',
  slv: 'Slovenian',
  hin: 'Hindi',
  srp: 'Serbian',
  fao: 'Faorese',
  chi: 'Chinese',
  heb: 'Hebrew',
  ind: 'Indonesian',
  tam: 'Tamil',
  tel: 'Telugu',
  tha: 'Thai',
  fil: 'Filipino',
  jpn: 'Japanese',
  may: 'Malay',
  nob: 'Norwegian Bokmål',
}
const COMPLEMENT_VIA_ISO_639_3 = {
  CA: ' (VFQ)',
  FR: ' (VFF)',
}

const GenererHashUnique = (chaine) => {
  var hash = 0
  for (let i = 0; i < chaine.length; i++) {
    let chr = chaine.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const SecondesEnDuree = (duree_en_seconde) => {
  const heures = Number.parseInt(duree_en_seconde / 3600)
  duree_en_seconde -= heures * 3600
  const minutes = Number.parseInt(duree_en_seconde / 60)
  duree_en_seconde -= minutes * 60
  const secondes = (duree_en_seconde % 60).toFixed(0)

  if (Number.isNaN(heures) || Number.isNaN(minutes)) return null

  return `${heures ? heures + ':' : ''}${minutes < 10 ? '0' + minutes : minutes}:${secondes < 10 ? '0' + secondes : secondes}`
}

const EngEnSecondes = (timeInENG) => {
  const [heures, minutes, secondes] = timeInENG.split(':')
  return Number.parseInt(heures) * 3600 + Number.parseInt(minutes) * 60 + Number.parseInt(secondes)
}

const ObtenirDureeDuFichier = (informations) => {
  let duree_en_secondes = 0

  if (informations.format && informations.format.duration) duree_en_secondes = informations.format.duration
  else {
    const pistes = informations.streams
    for (let indice in pistes) {
      const piste = pistes[indice]

      if (!piste.duration) {
        if (piste.tags && !piste.tags['DURATION-eng']) continue
        duree_en_secondes = Math.max(EngEnSecondes(piste.tags['DURATION-eng']), 0)
      } else duree_en_secondes = Math.max(piste.duration, duree_en_secondes)
    }
  }
  const duree = SecondesEnDuree(duree_en_secondes)

  return duree
}

const ObtenirTitreViaLangue = (langue, type, indice) => {
  if (langue == 'unknown') return `Piste ${indice}`

  const [iso_639_1, iso_639_3] = langue.split('-')

  return LANGUES_VIA_ISO_639_1[iso_639_1] + (type == 'audio' ? COMPLEMENT_VIA_ISO_639_3[iso_639_3] || '' : '')
}

const EstForce = (piste) => {
  if (!piste.tags) return false

  const titre = (piste.tags.title || '').toLowerCase()

  return titre.includes('forced') || titre.includes('forcé') || titre.includes('force')
}

const ExtraireLangueISO_639_3 = (piste) => {
  let langue = 'unknown'

  if (!piste.tags) {
    console.log("Cette piste n'a pas de langue définie")
    pistes_sans_langues.push(piste)
    return langue
  }

  langue = piste.tags['language'] || piste.tags['LANGUAGE']

  if (!langue) {
    const titre = (piste.tags.title || '').toLowerCase()

    if (
      titre.includes('francais') ||
      titre.includes('français') ||
      titre.includes('fra') ||
      titre.includes('french') ||
      titre.includes('fre') ||
      titre.includes('fr')
    ) {
      langue = 'fre'
    } else if (titre.includes('korean') || titre.includes('kor') || titre.includes('coreen') || titre.includes('cor')) langue = 'kor'
    else if (
      titre.includes('anglais') ||
      titre.includes('ang') ||
      titre.includes('an') ||
      titre.includes('english') ||
      titre.includes('eng') ||
      titre.includes('en')
    )
      langue = 'eng'
    else {
      pistes_sans_langues.push(piste)
      langue = `unknown`
    }
  }

  return langue
}

const ExtraireLangueISO_639_1 = (piste) => {
  const langue_ISO_639_3 = ExtraireLangueISO_639_3(piste)
  if (langue_ISO_639_3 == 'unknown') return langue_ISO_639_3

  let langue = '-'

  const titre = piste.tags ? (piste.tags.title || '').toLowerCase() : ''

  if (langue_ISO_639_3 == 'fre' && (titre.includes('vfq') || titre.includes('quebec') || titre.includes('canad'))) langue += 'CA'
  else if (langue_ISO_639_3 == 'eng') langue += 'US'
  else {
    langue += (langue_ISO_639_3[0] + langue_ISO_639_3[1]).toUpperCase()
  }

  return langue_ISO_639_3 + langue
}
const ExtraireTitreDuFichier = (nom_fichier) => {
  let titre = nom_fichier.split('.')
  let est_une_video = false

  if (titre.length > 1) {
    const extension = titre.pop()

    est_une_video = extension == 'mkv'
  }

  titre = titre.join('.')

  return { titre, est_une_video }
}

const ExtraireInformationsVideo = (piste, indice_du_stream) => {
  // console.log('Piste vidéo: ', piste)

  const codec = piste['codec_name']
  const besoin_transcodage = !CODECS_VIDEO_LISIBLE.includes(codec)

  return {
    codec,
    needs_transcoding: besoin_transcodage,
    stream_index: Number.parseInt(indice_du_stream),
  }
}

const ExtraireInformationsAudio = (piste, indice_du_stream, indice) => {
  const codec = piste['codec_name']
  const besoin_transcodage = !CODECS_AUDIO_LISIBLE.includes(codec)
  const langue = ExtraireLangueISO_639_1(piste)
  const titre = ObtenirTitreViaLangue(langue, 'audio', indice)

  return {
    codec,
    needs_transcoding: besoin_transcodage,
    language: langue,
    title: titre,
    index: indice,
    stream_index: Number.parseInt(indice_du_stream),
  }
}

const ExtraireInformationsSousTitre = (piste, indice) => {
  const langue = ExtraireLangueISO_639_1(piste)
  const titre = ObtenirTitreViaLangue(langue, 'subtitle', indice)
  const est_force = EstForce(piste)

  return {
    language: langue,
    title: titre,
    is_forced: est_force,
    index: indice,
  }
}

const json = {}

const AnalyseComplete = async (racine, chemin = '') => {
  const dossier_courant = fs.readdirSync(racine + chemin)

  for (let element in dossier_courant) {
    const nom_fichier = dossier_courant[element]

    console.log(`Élément en cours d'analyse: ${nom_fichier}`)

    const chemins = {
      local: chemin + '/' + nom_fichier,
      absolu: racine + (chemin == '' ? '/' : chemin + '/') + nom_fichier,
    }

    try {
      var est_un_dossier = fs.statSync(chemins.absolu).isDirectory()
    } catch {
      console.error(`Le dossier ou fichier ${chemins.absolu} n'existe pas.`)
      return
    }

    if (est_un_dossier) {
      await AnalyseComplete(racine, chemins.local)
    } else {
      const { titre, est_une_video } = ExtraireTitreDuFichier(nom_fichier)

      if (!est_une_video) continue

      const hash = GenererHashUnique(chemins.local)

      let fichier = {
        id: hash,
        paths: {
          local: chemins.local,
          absolute: chemins.absolu,
        },
        title: titre,
        video: null,
        audio: [],
        subtitles: [],
      }

      const informations = await ffprobe(chemins.absolu)

      const indices = {
        audio: 1,
        sous_titre: 1,
      }

      fichier.duration = ObtenirDureeDuFichier(informations)

      for (let indice in informations.streams) {
        const piste = informations.streams[indice]

        const type = piste['codec_type']

        if (type == 'video') fichier.video = ExtraireInformationsVideo(piste, indice)
        else if (type == 'audio') fichier.audio.push(ExtraireInformationsAudio(piste, indice, indices.audio++))
        else if (type == 'subtitle') fichier.subtitles.push(ExtraireInformationsSousTitre(piste, indices.sous_titre++))
      }

      if (json[hash]) {
        console.error(`\n\n Hash existe déjà, Fichier courant: ${chemins.absolu}, Fichier enregistré: ${json[hash].chemins.absolu} \n\n`)
      }

      json[hash] = fichier
    }
  }
}

const nouveaux_fichiers = {}

const AnalyseDesNouveauxFichiers = async (db, racine, chemin = '') => {
  const dossier_courant = fs.readdirSync(racine + chemin)

  for (let element in dossier_courant) {
    const nom_fichier = dossier_courant[element]

    const chemins = {
      local: chemin + '/' + nom_fichier,
      absolu: racine + (chemin == '' ? '/' : chemin + '/') + nom_fichier,
    }

    try {
      var est_un_dossier = fs.statSync(chemins.absolu).isDirectory()
    } catch {
      console.error(`Le dossier ou fichier ${chemins.absolu} n'existe pas.`)
      return
    }

    if (est_un_dossier) {
      await AnalyseDesNouveauxFichiers(db, racine, chemins.local)
    } else {
      const { titre, est_une_video } = ExtraireTitreDuFichier(nom_fichier)

      if (!est_une_video) continue

      const hash = GenererHashUnique(chemins.local)

      if (db.getIndex('/files', hash) != -1) continue

      console.log('Analyse du fichier: ', nom_fichier)

      let fichier = {
        id: hash,
        paths: {
          local: chemins.local,
          absolute: chemins.absolu,
        },
        title: titre,
        video: null,
        audio: [],
        subtitles: [],
      }

      const informations = await ffprobe(chemins.absolu)

      const indices = {
        audio: 1,
        sous_titre: 1,
      }

      fichier.duration = ObtenirDureeDuFichier(informations)

      for (let indice in informations.streams) {
        const piste = informations.streams[indice]

        const type = piste['codec_type']

        if (type == 'video') fichier.video = ExtraireInformationsVideo(piste, indice)
        else if (type == 'audio') fichier.audio.push(ExtraireInformationsAudio(piste, indice, indices.audio++))
        else if (type == 'subtitle') fichier.subtitles.push(ExtraireInformationsSousTitre(piste, indices.sous_titre++))
      }

      nouveaux_fichiers[hash] = fichier
    }
  }
}

const EnregistrerUnFichier = (db, fichier) => {
  const index = db.getIndex('/files', fichier.id)

  if (index != -1) return false

  db.push(`/files[]`, fichier)

  console.log(`Ajout du fichier ${fichier.title} dans la base de donnée`)

  return true
}

const { ROOT_FILES } = require('../constantsServer')

const LancerAnalyseComplete = async () => {
  await AnalyseComplete(ROOT_FILES)
  console.log(`Nombre de fichiers enregistrés: ${Object.keys(json).length}`)
  fs.writeFileSync(path.join(__dirname + '/Fichier.json'), JSON.stringify(json, null, 2))
}

const LancerAnalyseDesNouveauxFichiers = async (db) => {
  await AnalyseDesNouveauxFichiers(db, ROOT_FILES)
  console.log(`Nombre de nouveaux fichiers: ${Object.keys(nouveaux_fichiers).length}`)
  return Object.keys(nouveaux_fichiers).length ? nouveaux_fichiers : null
}

// LancerAnalyseComplete()

module.exports = {
  ExtraireInformationsSousTitre,
  GenererHashUnique,
  LancerAnalyseComplete,
  LancerAnalyseDesNouveauxFichiers,
  EnregistrerUnFichier,
}

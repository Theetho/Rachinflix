// Point d'entrée
document.getElementById('scanner').addEventListener('click', (event) => {
  document.getElementById('scanner').style.display = 'none'
  document.getElementById('spinner').style.display = 'initial'
  fetch('/nouveaux')
    .then((reponse) => {
      return reponse.json()
    })
    .then(async (donnees) => {
      if (donnees.aucun_nouveaux) {
        document.getElementById('spinner').style.display = 'none'
        document.getElementById('aucun-fichier').style.display = 'initial'
        return
      }

      MVC.donnees = donnees
      MVC.Afficher()
    })
})

document.getElementById('miniature').addEventListener(
  'load',
  () => {
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('contenu').style.display = 'initial'
  },
  { once: true }
)

const MVC = {
  donnees: {
    films: [],
    series: {},
    saisons: {},
    episodes: [],
  },
  async Afficher() {
    for (let film of this.donnees.films) {
      await AfficherNouveau(film, 'Film')
    }
    for (let serie of Object.values(this.donnees.series)) {
      await AfficherNouveau(serie, 'Serie')
    }
    for (let saison of Object.values(this.donnees.saisons)) {
      await AfficherNouveau(saison, 'Saison')
    }
    for (let episode of this.donnees.episodes) {
      await AfficherNouveau(episode, 'Episode')
    }
    document.getElementById('contenu').style.display = 'none'
    document.getElementById('spinner').style.display = 'none'
    document.getElementById('aucun-fichier').style.display = 'initial'
    fetch('/ajouts-termines')
  },
}

async function AfficherNouveau(nouveau, type = null) {
  console.log(nouveau)

  const informations = await RecupererInformations[type](nouveau)
  console.log(informations, type)

  if (informations == null) return

  document.getElementById('spinner').style.display = 'none'
  document.getElementById('contenu').style.display = 'initial'
  for (let langue of Object.keys(informations)) await AfficherLesInformations[type](nouveau, informations, langue)
  document.getElementById('spinner').style.display = 'initial'
  document.getElementById('contenu').style.display = 'none'
}

const RecupererInformations = {
  async Film(film) {
    const reponse = await fetch(`/informations/film/${film.title.replace(/[0-9]+ - /, '')}`)
    const informations = await reponse.json()

    if (informations.film_nexiste_pas) return null

    return informations
  },
  async Serie(serie) {
    const reponse = await fetch(`/informations/serie/${serie.title}`)
    const informations = await reponse.json()

    if (informations.serie_deja_dans_base || informations.serie_nexiste_pas) return null

    return informations
  },
  async Saison(saison) {
    const reponse = await fetch(`/informations/serie/${saison.serie_title}/saison/${saison.nombre}`)
    const informations = await reponse.json()

    if (informations.saison_deja_dans_base || informations.saison_nexiste_pas) return null

    return informations
  },
  async Episode(episode) {
    const reponse = await fetch(`/informations/serie/${episode.serie_title}/saison/${episode.nombre_saison}/episode/${episode.nombre}`)
    const informations = await reponse.json()

    if (informations.episode_nexiste_pas) return null

    return informations
  },
}

const AfficherLesInformations = {
  Film(fichier, informations, langue, indice = 0, indice_miniature = -1, indice_video = 0) {
    return new Promise((resolve, reject) => {
      const resultat = informations[langue][indice]

      document.getElementById('titre').innerHTML = `${resultat.title || resultat.name} (${fichier.title})`
      if (resultat.posters.length) {
        document.getElementById('miniature').style.display = 'inital'
        document.getElementById('miniature').src = `https://image.tmdb.org/t/p/w500/${
          indice_miniature == -1 ? resultat.poster_path : resultat.posters[indice_miniature].file_path
        }`
      } else {
        document.getElementById('miniature').style.display = 'none'
      }
      if (resultat.videos.length) {
        document.getElementById('trailer').style.display = 'initial'
        document.getElementById('trailer').src = `https://www.youtube.com/embed/${resultat.videos[indice_video].key}?controls=0`
      } else {
        document.getElementById('trailer').style.display = 'none'
      }
      document.getElementById('synopsis').innerHTML = `Synospsis: ${resultat.overview}`
      document.getElementById('langue').innerHTML = `${langue}`

      document.getElementById('suivant').style.display = indice == informations[langue].length - 1 ? 'none' : 'initial'
      document.getElementById('precedent').style.display = indice == 0 ? 'none' : 'initial'
      document.getElementById('miniature-suivante').style.display = indice_miniature == resultat.posters.length - 1 ? 'none' : 'initial'
      document.getElementById('miniature-precedente').style.display = indice_miniature == -1 ? 'none' : 'initial'
      document.getElementById('trailer-suivant').style.display = indice_video == resultat.videos.length - 1 ? 'none' : 'initial'
      document.getElementById('trailer-precedent').style.display = indice_video == 0 ? 'none' : 'initial'

      document.getElementById('suivant').onclick = function() {
        resolve(AfficherLesInformations['Film'](fichier, informations, langue, indice + 1, -1, 0))
      }
      document.getElementById('precedent').onclick = function() {
        resolve(AfficherLesInformations['Film'](fichier, informations, langue, indice - 1, -1, 0))
      }
      document.getElementById('trailer-suivant').onclick = function() {
        indice_video = Math.min(indice_video + 1, resultat.videos.length - 1)
        resolve(AfficherLesInformations['Film'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
      document.getElementById('trailer-precedent').onclick = function() {
        indice_video = Math.max(indice_video - 1, 0)
        resolve(AfficherLesInformations['Film'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
      document.getElementById('valider').onclick = function() {
        Valider['Film'](resultat, fichier, langue, indice_miniature, indice_video)
        resolve(true)
      }
      document.getElementById('miniature-suivante').onclick = function() {
        indice_miniature = Math.min(indice_miniature + 1, resultat.posters.length - 1)
        resolve(AfficherLesInformations['Film'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
      document.getElementById('miniature-precedente').onclick = function() {
        indice_miniature = Math.max(indice_miniature - 1, -1)
        resolve(AfficherLesInformations['Film'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
    })
  },
  Serie(fichier, informations, langue, indice = 0, indice_miniature = -1, indice_video = 0) {
    return new Promise((resolve, reject) => {
      const resultat = informations[langue][indice]

      document.getElementById('titre').innerHTML = `${resultat.title || resultat.name} (${fichier.title})`
      if (resultat.posters.length) {
        document.getElementById('miniature').style.display = 'inital'
        document.getElementById('miniature').src = `https://image.tmdb.org/t/p/w500/${
          indice_miniature == -1 ? resultat.poster_path : resultat.posters[indice_miniature].file_path
        }`
      } else {
        document.getElementById('miniature').style.display = 'none'
      }
      if (resultat.videos.length) {
        document.getElementById('trailer').style.display = 'initial'
        document.getElementById('trailer').src = `https://www.youtube.com/embed/${resultat.videos[indice_video].key}?controls=0`
      } else {
        document.getElementById('trailer').style.display = 'none'
      }
      document.getElementById('synopsis').innerHTML = `Synospsis: ${resultat.overview}`
      document.getElementById('langue').innerHTML = `${langue}`

      document.getElementById('suivant').style.display = indice == informations[langue].length - 1 ? 'none' : 'initial'
      document.getElementById('precedent').style.display = indice == 0 ? 'none' : 'initial'
      document.getElementById('miniature-suivante').style.display = indice_miniature == resultat.posters.length - 1 ? 'none' : 'initial'
      document.getElementById('miniature-precedente').style.display = indice_miniature == -1 ? 'none' : 'initial'
      document.getElementById('trailer-suivant').style.display = indice_video == resultat.videos.length - 1 ? 'none' : 'initial'
      document.getElementById('trailer-precedent').style.display = indice_video == 0 ? 'none' : 'initial'

      document.getElementById('suivant').onclick = function() {
        resolve(AfficherLesInformations['Serie'](fichier, informations, langue, indice + 1, -1, 0))
      }
      document.getElementById('precedent').onclick = function() {
        resolve(AfficherLesInformations['Serie'](fichier, informations, langue, indice - 1, -1, 0))
      }
      document.getElementById('valider').onclick = function() {
        Valider['Serie'](resultat, fichier, langue, indice_miniature, indice_video)
        resolve(true)
      }
      document.getElementById('miniature-suivante').onclick = function() {
        indice_miniature = Math.min(indice_miniature + 1, resultat.posters.length)
        resolve(AfficherLesInformations['Serie'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
      document.getElementById('miniature-precedente').onclick = function() {
        indice_miniature = Math.max(indice_miniature - 1, -1)
        resolve(AfficherLesInformations['Serie'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
      document.getElementById('trailer-suivant').onclick = function() {
        indice_video = Math.min(indice_video + 1, resultat.videos.length - 1)
        resolve(AfficherLesInformations['Serie'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
      document.getElementById('trailer-precedent').onclick = function() {
        indice_video = Math.max(indice_video - 1, 0)
        resolve(AfficherLesInformations['Serie'](fichier, informations, langue, indice, indice_miniature, indice_video))
      }
    })
  },
  Saison(fichier, informations, langue, indice_video = 0) {
    return new Promise((resolve, reject) => {
      const resultat = informations[langue]

      document.getElementById('titre').innerHTML = `${fichier.serie_title} - ${resultat.title || resultat.name}`
      document.getElementById('miniature').src = `https://image.tmdb.org/t/p/w500/${resultat.poster_path}`
      if (resultat.videos.length) {
        document.getElementById('trailer').style.display = 'initial'
        document.getElementById('trailer').src = `https://www.youtube.com/embed/${resultat.videos[indice_video].key}?controls=0`
      } else {
        document.getElementById('trailer').style.display = 'none'
      }
      document.getElementById('synopsis').innerHTML = `Synospsis: ${resultat.overview}`
      document.getElementById('langue').innerHTML = `${langue}`

      document.getElementById('suivant').style.display = 'none'
      document.getElementById('precedent').style.display = 'none'
      document.getElementById('miniature-suivante').style.display = 'none'
      document.getElementById('miniature-precedente').style.display = 'none'
      document.getElementById('trailer-suivant').style.display = indice_video == resultat.videos.length - 1 ? 'none' : 'initial'
      document.getElementById('trailer-precedent').style.display = indice_video == 0 ? 'none' : 'initial'

      document.getElementById('trailer-suivant').onclick = function() {
        indice_video = Math.min(indice_video + 1, resultat.videos.length - 1)
        resolve(AfficherLesInformations['Saison'](fichier, informations, langue, indice_video))
      }
      document.getElementById('trailer-precedent').onclick = function() {
        indice_video = Math.max(indice_video - 1, 0)
        resolve(AfficherLesInformations['Saison'](fichier, informations, langue, indice_video))
      }
      document.getElementById('valider').onclick = function() {
        Valider['Saison'](resultat, fichier, langue, indice_video)
        resolve(true)
      }
    })
  },
  Episode(fichier, informations, langue) {
    return new Promise((resolve, reject) => {
      const resultat = informations[langue]

      document.getElementById('titre').innerHTML = `${fichier.serie_title} - S${fichier.nombre_saison}E${fichier.nombre} - ${resultat.title || resultat.name}`
      document.getElementById('miniature').src = `https://image.tmdb.org/t/p/w500/${resultat.still_path}`
      document.getElementById('trailer').style.display = 'none'
      document.getElementById('synopsis').innerHTML = `Synospsis: ${resultat.overview}`
      document.getElementById('langue').innerHTML = `${langue}`

      document.getElementById('suivant').style.display = 'none'
      document.getElementById('precedent').style.display = 'none'
      document.getElementById('miniature-suivante').style.display = 'none'
      document.getElementById('miniature-precedente').style.display = 'none'
      document.getElementById('trailer-suivant').style.display = 'none'
      document.getElementById('trailer-precedent').style.display = 'none'

      document.getElementById('trailer-suivant').onclick = function() {
        indice_video = Math.min(indice_video + 1, resultat.videos.length - 1)
        resolve(AfficherLesInformations['Episode'](fichier, informations, langue))
      }
      document.getElementById('trailer-precedent').onclick = function() {
        indice_video = Math.max(indice_video - 1, 0)
        resolve(AfficherLesInformations['Episode'](fichier, informations, langue))
      }
      document.getElementById('valider').onclick = function() {
        Valider['Episode'](resultat, fichier, langue)
        resolve(true)
      }
    })
  },
}

const Valider = {
  Film(resultat, fichier, langue, indice_miniature, indice_video) {
    const resultat_avec_la_bonne_miniature = {}
    Object.assign(resultat_avec_la_bonne_miniature, resultat)
    resultat_avec_la_bonne_miniature.poster_path = indice_miniature == -1 ? resultat.poster_path : resultat.posters[indice_miniature].file_path
    resultat_avec_la_bonne_miniature.trailer_path = resultat.videos.length ? `https://www.youtube.com/watch?v=${resultat.videos[indice_video].key}` : null
    delete resultat_avec_la_bonne_miniature.posters
    delete resultat_avec_la_bonne_miniature.videos

    console.log('Envoie du film au serveur: ', resultat_avec_la_bonne_miniature)

    //Envoie  du film au serveur
    fetch('/ajout/film', {
      method: 'POST',
      body: JSON.stringify({
        fichier,
        resultat: resultat_avec_la_bonne_miniature,
        langue,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((reponse) => {
        return reponse.text()
      })
      .then((reponse) => {
        console.log(reponse)
      })

    fetch('/ajout/fichier', {
      method: 'POST',
      body: JSON.stringify({
        fichier,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((reponse) => {
        return reponse.text()
      })
      .then((reponse) => {
        console.log(reponse)
      })
  },
  Serie(resultat, fichier, langue, indice_miniature, indice_video) {
    const resultat_avec_la_bonne_miniature = {}
    Object.assign(resultat_avec_la_bonne_miniature, resultat)
    resultat_avec_la_bonne_miniature.poster_path = indice_miniature == -1 ? resultat.poster_path : resultat.posters[indice_miniature].file_path
    resultat_avec_la_bonne_miniature.trailer_path = resultat.videos.length ? `https://www.youtube.com/watch?v=${resultat.videos[indice_video].key}` : null
    delete resultat_avec_la_bonne_miniature.posters
    delete resultat_avec_la_bonne_miniature.videos

    console.log('Envoie de la série au serveur: ', resultat_avec_la_bonne_miniature)

    // Envoie de la série au serveur
    fetch('/ajout/serie', {
      method: 'POST',
      body: JSON.stringify({
        fichier,
        resultat: resultat_avec_la_bonne_miniature,
        langue,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((reponse) => {
        return reponse.text()
      })
      .then((reponse) => {
        console.log(reponse)
      })
  },
  Saison(resultat, fichier, langue, indice_video) {
    const resultat_avec_la_bonne_miniature = {}
    Object.assign(resultat_avec_la_bonne_miniature, resultat)
    resultat_avec_la_bonne_miniature.trailer_path = resultat.videos.length ? `https://www.youtube.com/watch?v=${resultat.videos[indice_video].key}` : null
    delete resultat_avec_la_bonne_miniature.videos
    console.log('Envoie de la saison au serveur: ', resultat)

    fetch('/ajout/saison', {
      method: 'POST',
      body: JSON.stringify({
        fichier,
        resultat,
        langue,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((reponse) => {
        return reponse.text()
      })
      .then((reponse) => {
        console.log(reponse)
      })
  },
  Episode(resultat, fichier, langue) {
    console.log("Envoie de l'épisode au serveur: ", resultat)

    fetch('/ajout/episode', {
      method: 'POST',
      body: JSON.stringify({
        fichier,
        resultat,
        langue,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((reponse) => {
        return reponse.text()
      })
      .then((reponse) => {
        console.log(reponse)
      })

    const fichier_propre = {}
    Object.assign(fichier_propre, fichier)

    delete fichier_propre.serie_title
    delete fichier_propre.nombre
    delete fichier_propre.nombre_saison

    fetch('/ajout/fichier', {
      method: 'POST',
      body: JSON.stringify({
        fichier: fichier_propre,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((reponse) => {
        return reponse.text()
      })
      .then((reponse) => {
        console.log(reponse)
      })
  },
}

export interface NewFiles {
  films: {
    id: string
    fileId: string
  }[]
  series: {
    id: string
    path: string
  }[]
  seasons: {
    id: string
    path: string
    serieId: string
  }[]
  episodes: {
    id: string
    seasonId: string
    fileId: string
  }[]
  files: {
    id: string
    path: string
  }[]
}

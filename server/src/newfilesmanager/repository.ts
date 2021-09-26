import { Database } from 'src/models/database'

export class NewFileRepository {
  root = '/news'
  // database = new JsonDB(new Config(`${ROOT_DATABASE}/DB_TEST.json`, false, true, '/'))

  getFilms(): { id: string; fileId: string }[] {
    return Database.database.getData(`${this.root}/films`)
  }

  getSeries(): { id: string; path: string }[] {
    return Database.database.getData(`${this.root}/series`)
  }

  getSeasons(): { id: string; path: string; serieId: string }[] {
    return Database.database.getData(`${this.root}/seasons`)
  }

  getEpisodes(): { id: string; seasonId: string; fileId: string }[] {
    return Database.database.getData(`${this.root}/episodes`)
  }

  getFiles(): { id: string; path: string }[] {
    return Database.database.getData(`${this.root}/files`)
  }

  getSerieId(path: string): string {
    return (
      Database.database.getData(`/series`).find(serie => path.includes(serie.path)) ||
      Database.database.getData(`${this.root}/series`).find(serie => path.includes(serie.path))
    ).id
  }

  getSeasonId(path: string): string {
    return (
      Database.database.getData(`/seasons`).find(season => path.includes(season.path)) ||
      Database.database.getData(`${this.root}/seasons`).find(season => path.includes(season.path))
    ).id
  }

  add<T>(type: 'films' | 'series' | 'seasons' | 'episodes' | 'files', media: T) {
    Database.database.push(`${this.root}/${type}[]`, media)
  }

  remove(type: 'films' | 'series' | 'seasons' | 'episodes' | 'files', id: string) {
    Database.database.push(
      `${this.root}/${type}`,
      Database.database.getData(`${this.root}/${type}`).filter(media => media.id !== id),
      true
    )
  }
}

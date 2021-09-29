import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import { ROOT_DATABASE } from 'src/config'

export class DownloadRepository {
  root = '/downloads'
  static database = new JsonDB(new Config(`${ROOT_DATABASE}/DB_DOWNLOADS.json`, true, true, '/'))

  constructor() {}

  getAll(): {
    videos: { uri: string; path: string }[]
    backdrops: { uri: string; path: string }[]
    posters: { uri: string; path: string }[]
    thumbnails: { uri: string; path: string }[]
    subtitles: { localFrom: string; localTo: string; index: number }[]
  } {
    return DownloadRepository.database.getData(`${this.root}`)
  }

  add<T>(type: 'videos' | 'backdrops' | 'posters' | 'thumbnails' | 'subtitles', data: T) {
    DownloadRepository.database.push(`${this.root}/${type}[]`, data)
  }

  clear() {
    DownloadRepository.database.push(this.root, {})
  }
}

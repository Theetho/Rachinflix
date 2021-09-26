import { Serie } from 'src/interface'
import { Database } from 'src/models/database'

export class SerieRepository extends Database<Serie> {
  constructor() {
    super(`/series`)
  }
}

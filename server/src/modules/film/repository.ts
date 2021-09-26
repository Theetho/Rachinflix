import { Film } from 'src/interface'
import { Database } from 'src/models/database'

export class FilmRepository extends Database<Film> {
  constructor() {
    super(`/films`)
  }
}

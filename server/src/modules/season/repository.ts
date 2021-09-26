import { Season } from 'src/interface'
import { Database } from 'src/models/database'

export class SeasonRepository extends Database<Season> {
  constructor() {
    super(`/seasons`)
  }
}

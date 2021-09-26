import { Episode } from 'src/interface'
import { Database } from 'src/models/database'

export class EpisodeRepository extends Database<Episode> {
  constructor() {
    super(`/episodes`)
  }
}

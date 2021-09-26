import { File } from 'src/interface'
import { Database } from 'src/models/database'

export class FileRepository extends Database<File> {
  constructor() {
    super('/files')
  }
}

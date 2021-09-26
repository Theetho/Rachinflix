import { Injectable } from '@nestjs/common'
import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'
import { ROOT_DATABASE } from 'src/config'

@Injectable()
export class Database<T> {
  static database: JsonDB
  protected readonly root: string

  constructor(root: string) {
    Database.database = new JsonDB(new Config(`${ROOT_DATABASE}/DB_TEST.json`, true, true, '/'))
    this.makeReadableCopy()
    this.root = root
  }

  getAll(): T[] {
    return Database.database.getData(this.root)
  }

  some(id: string): boolean {
    return Database.database.getIndex(this.root, id) > -1
  }

  getById(id: string): T {
    const index = Database.database.getIndex(this.root, id)
    if (index === -1) {
      throw new Error(`There is no element with id ${id}`)
    }
    return Database.database.getData(`${this.root}[${index}]`)
  }

  getByIndex(index: number): T {
    if (index > Database.database.count(this.root)) {
      throw new Error(`There is no element at index ${index}`)
    }
    return Database.database.getData(`${this.root}[${index}]`)
  }

  add(entity: T) {
    Database.database.push(`${this.root}[]`, entity)
  }

  private makeReadableCopy() {
    const readable = new JsonDB(new Config(`${ROOT_DATABASE}/DB_COPY.json`, true, true, '/'))
    readable.delete('/')
    readable.push('/', Database.database.getData('/'))
    readable.save()
  }
}

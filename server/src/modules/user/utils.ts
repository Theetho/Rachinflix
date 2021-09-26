import { JsonDB } from 'node-json-db'

export function removeMediaFromDatabase(
  type: 'series' | 'films',
  database: JsonDB,
  root: string,
  media: { userIndex: number; [any: string]: any }
) {
  const clone = Object.assign({}, media)
  delete clone.userIndex

  const index = (
    database.getData(`${root}[${media.userIndex}]/registry/${type}`) as any[]
  ).findIndex(serieorfilm =>
    Object.keys(clone).reduce((result, key) => result && clone[key] === serieorfilm[key], true)
  )

  database.delete(`${root}[${media.userIndex}]/registry/${type}[${index}]`)
}

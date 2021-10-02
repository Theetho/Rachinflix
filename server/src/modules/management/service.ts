import { Injectable } from '@nestjs/common'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { createFile } from 'src/management/file'
import { SearchItem } from 'src/tmdb/interface'

@Injectable()
export class ManagementService extends UseLogger {
  constructor() {
    super()
  }

  private async addNewFiles() {
    const files = Repositories.getNewFilesRepository().getFiles()

    for (const { id, path } of files) {
      if (Repositories.getFileRepository().some(id)) {
        continue
      }
      const file = await createFile(id, path)
      this.logger.debug(`Adding file ${inline({ id, path })} `)
      Repositories.getFileRepository().add(file)
      Repositories.getNewFilesRepository().remove('files', id)
    }
  }

  async getNewFiles(type: 'films' | 'series' | 'seasons' | undefined): Promise<SearchItem[]> {
    await this.addNewFiles()

    if (type === 'films' || type == null) {
      return Repositories.getNewFilesRepository().getFilms().length > 0
        ? Repositories.getNewFilesRepository()
            .getFilms()

            .map(({ fileId, id }) => {
              const { path } = Repositories.getFileRepository().getById(fileId)

              return {
                title: path.split('/').pop(),
                _actions: {
                  addMedia: {
                    body: undefined,
                    method: 'POST',
                    href: `/management/film/${id}`
                  }
                },
                _links: {
                  getInformations: {
                    href: `/management/film/${id}`
                  }
                }
              }
            })
        : this.getNewFiles('series')
    } else if (type === 'series') {
      return Repositories.getNewFilesRepository().getSeries().length > 0
        ? Repositories.getNewFilesRepository()
            .getSeries()
            .map(({ id, path }) => ({
              title: path.split('/').pop(),
              _actions: {
                addMedia: {
                  body: undefined,
                  method: 'POST',
                  href: `/management/serie/${id}`
                }
              },
              _links: {
                getInformations: {
                  href: `/management/serie/${id}`
                }
              }
            }))
        : this.getNewFiles('seasons')
    } else if (type === 'seasons') {
      return Repositories.getNewFilesRepository().getSeasons().length > 0
        ? Repositories.getNewFilesRepository()
            .getSeasons()
            .map(({ id, path }) => ({
              title: path.split('/').reverse().slice(0, 2).reverse().join('/'),
              _actions: {
                addMedia: {
                  body: undefined,
                  method: 'POST',
                  href: `/management/season/${id}`
                }
              },
              _links: {
                getInformations: {
                  href: `/management/season/${id}`
                }
              }
            }))
        : undefined
    }

    return undefined
  }
}

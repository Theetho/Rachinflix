import * as chokidar from 'chokidar'
import * as EventEmitter from 'events'
import { ROOT_FILES } from 'src/config'
import { UseLogger } from 'src/helpers/logger'
import { Repositories } from 'src/helpers/repository'
import { v4 } from 'uuid'
import { Ffmpeg } from './ffmpeg'

export class FileWatcher extends UseLogger {
  watcher = chokidar.watch(ROOT_FILES, {
    persistent: true,
    awaitWriteFinish: true,
    ignoreInitial: true
  })
  newfiles = []
  filesready = []
  processes = {
    // Maximum number of concurrent transcoding
    max: 4,
    // Running transcoding
    running: 0
  }
  emitter = new EventEmitter()

  constructor() {
    super()
  }

  watch() {
    // =====================================
    // ============= LISTENERS =============
    // =====================================
    this.emitter.on('updaterunning', (running: number) => {
      this.processes.running = running
      this.logger.debug(`${this.processes.running} transcoding running`)
    })
    this.emitter.on('transcodestart', (path: string) => {
      if (this.processes.running < this.processes.max) {
        this.emitter.emit('updaterunning', this.processes.running + 1)
        this.filesready = this.filesready.filter(p => p != path)
        Ffmpeg(path, this.emitter, this.logger)
      }
    })
    this.emitter.on('transcodeend', (path: string) => {
      this.emitter.emit('updaterunning', this.processes.running - 1)
      this.emitter.emit('fileready', path)
      // Remove the path from the newfiles to transcode
      if (this.filesready.length > 0) {
        const nextpath = this.filesready[0]
        this.filesready = this.filesready.slice(1)
        Ffmpeg(nextpath, this.emitter, this.logger)
      }
    })
    this.emitter.on('fileready', (path: string) => {
      path = path.replace(/\\/g, '/')

      const file = {
        id: v4(),
        path: path.substring(ROOT_FILES.length)
      }

      Repositories.getNewFilesRepository().add('files', file)

      if (path.startsWith(`${ROOT_FILES}/Films/`)) {
        Repositories.getNewFilesRepository().add('films', {
          id: v4(),
          fileId: file.id
        })
        this.logger.log(`Added new film & file [${path}]`)
      } else {
        Repositories.getNewFilesRepository().add('episodes', {
          id: v4(),
          fileId: file.id,
          seasonId: Repositories.getNewFilesRepository().getSeasonId(path)
        })
        this.logger.log(`Added new episode & file [${path}]`)
      }
    })

    // =====================================
    // ============= WATCHERS ==============
    // =====================================

    this.watcher
      .on('add', (path, stats) => {
        // Skip the download newfiles
        if (path.endsWith('.part')) return
        // Skip the temporary files
        if (path.split(/\\|\//).pop().includes('__VALID__')) return

        this.logger.debug('Adding file...')

        // Add it to the new newfiles to check for transcoding
        this.newfiles.push(path)
      })
      .on('change', (path, stats) => {
        if (!this.newfiles.find(p => p === path)) {
          return
        }
        this.newfiles = this.newfiles.filter(p => p != path)
        this.filesready.push(path)
        this.emitter.emit('transcodestart', path)
      })
      .on('addDir', (path, stats) => {
        path = path.replace(/\\/g, '/')

        if (!path.startsWith(`${ROOT_FILES}/Series/`) || path.endsWith('Nouveau dossier')) return

        this.logger.debug('Adding directory...')

        const seasonRegExp = new RegExp(/\/Series\/.+\/Season [0-9]+/)

        if (seasonRegExp.exec(path) != null) {
          Repositories.getNewFilesRepository().add('seasons', {
            id: v4(),
            path: path.substring(ROOT_FILES.length),
            serieId: Repositories.getNewFilesRepository().getSerieId(path)
          })
          this.logger.log(`Added new season [${path}]`)

          return
        }

        // Add serie
        Repositories.getNewFilesRepository().add('series', {
          id: v4(),
          path: path.substring(ROOT_FILES.length)
        })
        this.logger.log(`Added new serie [${path}]`)
      })
      .on('unlink', (path, stats) => {})
      .on('unlinkDir', (path, stats) => {})

    this.logger.log(`${ROOT_FILES} is being watched...`)
  }
}

import { Logger } from '@nestjs/common'
import * as chokidar from 'chokidar'
import * as EventEmitter from 'events'
import { v4 } from 'uuid'
import { Ffmpeg } from './ffmpeg'
import { NewFileRepository } from './repository'
// =====================================
// ============= CONSTANTS =============
// =====================================
const ROOT = 'E:/Site'

const logger = new Logger()

const emitter = new EventEmitter()

const newfilesrepository = new NewFileRepository()

const watcher = chokidar.watch(ROOT, {
  persistent: true,
  awaitWriteFinish: true,
  ignoreInitial: true
})

// All the path to the file added while watching
let newfiles = []
let filesready = []
const processes = {
  // Maximum number of concurrent transcoding
  max: 4,
  // Running transcoding
  running: 0
}

// =====================================
// ============= LISTENERS =============
// =====================================

emitter.on('updaterunning', (running: number) => {
  processes.running = running
  logger.log(`${processes.running} transcoding running`)
})
emitter.on('transcodestart', (path: string) => {
  if (processes.running < processes.max) {
    emitter.emit('updaterunning', processes.running + 1)
    filesready = filesready.filter(p => p != path)
    Ffmpeg(path, emitter, logger)
  }
})
emitter.on('transcodeend', (path: string) => {
  emitter.emit('updaterunning', processes.running - 1)
  emitter.emit('fileready', path)
  // Remove the path from the newfiles to transcode
  if (filesready.length > 0) {
    const nextpath = filesready[0]
    filesready = filesready.slice(1)
    Ffmpeg(nextpath, emitter, logger)
  }
})
emitter.on('fileready', (path: string) => {
  path = path.replace(/\\/g, '/')

  const file = {
    id: v4(),
    path: path.substring(ROOT.length)
  }

  newfilesrepository.add('files', file)

  if (path.startsWith(`${ROOT}/Films/`)) {
    newfilesrepository.add('films', {
      id: v4(),
      fileId: file.id
    })
    logger.log(`Added new film & file [${path}]`)
  } else {
    newfilesrepository.add('episodes', {
      id: v4(),
      fileId: file.id,
      seasonId: newfilesrepository.getSeasonId(path)
    })
    logger.log(`Added new episode & file [${path}]`)
  }
})

logger.log(`${ROOT} is being watched...`)

// =====================================
// ============= WATCHERS ==============
// =====================================

watcher
  .on('add', (path, stats) => {
    // Skip the download newfiles
    if (path.endsWith('.part')) return
    // Skip the temporary files
    if (path.split(/\\|\//).pop().includes('__VALID__')) return

    logger.debug('Adding file...')

    // Add it to the new newfiles to check for transcoding
    newfiles.push(path)
  })
  .on('change', (path, stats) => {
    if (!newfiles.find(p => p === path)) {
      return
    }
    newfiles = newfiles.filter(p => p != path)
    filesready.push(path)
    emitter.emit('transcodestart', path)
  })
  .on('addDir', (path, stats) => {
    path = path.replace(/\\/g, '/')

    if (!path.startsWith(`${ROOT}/Series/`) || path.endsWith('Nouveau dossier')) return

    logger.debug('Adding directory...')

    const seasonRegExp = new RegExp(/\/Series\/.+\/Season [0-9]+/)

    if (seasonRegExp.exec(path) != null) {
      newfilesrepository.add('seasons', {
        id: v4(),
        path: path.substring(ROOT.length),
        serieId: newfilesrepository.getSerieId(path)
      })
      logger.log(`Added new season [${path}]`)

      return
    }

    // Add serie
    newfilesrepository.add('series', {
      id: v4(),
      path: path.substring(ROOT.length)
    })
    logger.log(`Added new serie [${path}]`)
  })
  .on('unlink', (path, stats) => {})
  .on('unlinkDir', (path, stats) => {})

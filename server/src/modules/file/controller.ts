import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'
import { createReadStream, statSync } from 'fs'
import { inline } from 'src/helpers/list'
import { UseLogger } from 'src/helpers/logger'
import { AudioHateoas, FileHateoas, Remux, SubtitleHateoas } from 'src/interface'
import { FileService } from './service'

@Controller()
export class FileController extends UseLogger {
  constructor(private readonly service: FileService) {
    super()
  }

  @Get('/file/:id')
  getFileDetails(@Param('id') id: string): FileHateoas {
    this.logger.debug(`Request to get the details of file ${inline({ id })}`)

    return this.service.getFileDetails(id)
  }

  @Get('/file/:id/subtitles')
  getSubtitlesDetails(@Param('id') id: string): SubtitleHateoas[] {
    this.logger.debug(`Request to get the details of the subtitles of file ${inline({ id })}`)

    return this.service.getSubtitlesDetails(id)
  }

  @Get('/file/:id/audios')
  getAudiosDetails(@Param('id') id: string): AudioHateoas[] {
    this.logger.debug(`Request to get the details of the audios of file ${inline({ id })}`)

    return this.service.getAudioDetails(id)
  }

  /**
   * Handle GET request for the path /file/${id}/audio/${index}
   *
   * @param id The id of the file.
   * @param indx The index of the audio track for the file.
   * @param done Boolean to send the progress of the remuxing (false)
   * or the file itself when it is complete (true).
   *
   * @returns Promise<Remux | StreamableFile>
   */
  @Get('/file/:id/audio/:index')
  getFile(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
    @Param('index') index: string,
    @Query('done') done: boolean
  ) {
    done = Boolean(done)
    this.service.getFile(id, Number(index)).then((remux: Remux) => {
      if (!done) {
        response.status(200).send({
          done: remux.done,
          progress: remux.progress,
          _links: {
            continue: { href: `/file/${id}/audio/${index}${remux.done ? '?done=true' : ''}` }
          }
        })
        return
      }

      const { path } = remux
      const range = request.headers.range
      const size = statSync(path).size
      let head

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1
        const chunksize = end - start + 1
        head = {
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': `video/mp4`
        }

        response.writeHead(206, head)
        createReadStream(path, { start, end }).pipe(response)
      } else {
        const head = {
          'Content-Length': size,
          'Content-Type': `video/mp4`
        }

        response.writeHead(200, head)
        createReadStream(path).pipe(response)
      }
    })
  }
}

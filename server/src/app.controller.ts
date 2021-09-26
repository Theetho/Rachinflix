import { Controller, Get, Param, Req, Res, StreamableFile } from '@nestjs/common'
import { Request, Response } from 'express'
import * as fs from 'fs'

@Controller()
export class AppController {
  @Get()
  get(@Res() res: Response) {
    res.sendFile('index.html')
  }

  @Get('test/backdrop')
  getBackdrop() {
    return new StreamableFile(fs.createReadStream(`D:/Downloads/backdrop_all_american.jpg`))
  }
  @Get('test/backdrop_2')
  getBackdrop2() {
    return new StreamableFile(fs.createReadStream(`D:/Downloads/backdrop_les_deux_tours.jpg`))
  }

  @Get('test/file/:file')
  master(@Req() request: Request, @Res() response: Response, @Param('file') file: string) {
    const path = `D:/Downloads/test-hls/${file}`
    const range = request.headers.range
    const size = fs.statSync(path).size
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
      fs.createReadStream(path, { start, end }).pipe(response)
    } else {
      const head = {
        'Content-Length': size,
        'Content-Type': `video/mp4`
      }

      response.writeHead(200, head)
      fs.createReadStream(path).pipe(response)
    }
  }
}

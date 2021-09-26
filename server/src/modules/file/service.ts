import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { AudioHateoas, FileHateoas, Remux, SubtitleHateoas } from 'src/interface'
import { Streamer } from 'src/streamer/streamer'

@Injectable()
export class FileService {
  private readonly streamer = new Streamer()

  getFileDetails(id: string): FileHateoas {
    const { duration } = Repositories.getFileRepository().getById(id)

    return {
      duration,
      _links: {
        getSubtitles: { href: `/file/${id}/subtitles` },
        getAudios: { href: `/file/${id}/audios` }
      }
    }
  }

  getSubtitlesDetails(id: string): SubtitleHateoas[] {
    return Repositories.getFileRepository()
      .getById(id)
      .subtitles.map(({ title, language, index }) => ({
        title,
        language,
        _links: {
          getSubtitle: { href: `/file/${id}/subtitle/${index}` }
        }
      }))
  }

  getAudioDetails(id: string): AudioHateoas[] {
    return Repositories.getFileRepository()
      .getById(id)
      .audio.map(({ title, index, language }) => ({
        title,
        language,
        _links: {
          getAudio: { href: `/file/${id}/audio/${index}` }
        }
      }))
  }

  async getFile(id: string, index: number): Promise<Remux> {
    const file = Repositories.getFileRepository().getById(id)
    const { language } = file.audio.find(track => track.index === index)
    return await this.streamer.remux(file, language)
  }
}

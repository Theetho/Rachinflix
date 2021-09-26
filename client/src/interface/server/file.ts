import { Duration } from '..'

export type FileHateoas = {
  duration: Duration
  _links: {
    getSubtitles: { href: `/file/${string}/subtitles` }
    getAudios: { href: `/file/${string}/audios` }
  }
}

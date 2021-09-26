import Ffmpeg, { ffprobe } from 'fluent-ffmpeg'
import { ROOT_FILES } from 'src/config'
import { durationToSeconds, secondsToDuration } from 'src/helpers/duration'
import { Duration, File, Language } from 'src/interface'
import { Label_Language_3166_1, PrefixLabelLanguage_3166_1 } from 'src/tmdb/language'

export async function createFile(id: string, path: string): Promise<File> {
  const fullpath = `${ROOT_FILES}${path}`

  return new Promise((resolve, reject) => {
    ffprobe(fullpath, (err, data) => {
      resolve({
        id,
        path,
        duration: getFileDuration(data),
        video: {
          codec: 'h264',
          needs_transcoding: false,
          stream_index: data.streams.find(stream => stream.codec_type === 'video').index
        },
        audio: data.streams
          .filter(stream => stream.codec_type === 'audio')
          .map((stream, index) => {
            const language = getLanguage639_1(stream)
            return {
              codec: 'aac',
              index: index + 1,
              stream_index: stream.index,
              language,
              needs_transcoding: false,
              title: language
                ? `${Label_Language_3166_1[language.slice(0, 3)]}${
                    PrefixLabelLanguage_3166_1[language.slice(4)] ?? ''
                  }`
                : `Piste ${index}`
            }
          }),
        subtitles: data.streams
          .filter(stream => stream.codec_type === 'subtitle')
          .map((stream, index) => {
            const language = getLanguage639_1(stream)
            return {
              index: index + 1,
              language,
              is_forced: getIsForced(stream),
              title: language
                ? `${Label_Language_3166_1[language.slice(0, 3)]}${
                    PrefixLabelLanguage_3166_1[language.slice(4)]
                  }`
                : `Piste ${index + 1}`,
              path: path.replace('.mkv', `_${index + 1}.vtt`)
            }
          })
      })
    })
  })
}

function getFileDuration(details: Ffmpeg.FfprobeData): Duration {
  let duration = 0

  if (details.format?.duration) {
    duration = details.format.duration
  } else {
    for (const track of details.streams) {
      if (!track.duration) {
        if (track.tags && !track.tags['DURATION-eng']) continue
        duration = Math.max(durationToSeconds(track.tags['DURATION-eng']), 0)
      } else {
        duration = Math.max(durationToSeconds(track.duration as Duration), duration)
      }
    }
  }
  return secondsToDuration(duration)
}

function getLanguage639_1(stream: Ffmpeg.FfprobeStream): Language | undefined {
  const language_ISO_639_3 = getLanguage639_3(stream)
  if (language_ISO_639_3 == null) return language_ISO_639_3

  let language = '-'

  const title = (stream.tags?.title || '').toLowerCase()

  if (
    language_ISO_639_3 === 'fre' &&
    (title.includes('vfq') || title.includes('quebec') || title.includes('canad'))
  )
    language += 'CA'
  else if (language_ISO_639_3 === 'eng') language += 'US'
  else {
    language += language_ISO_639_3.slice(0, 2).toUpperCase()
  }

  return (language_ISO_639_3 + language) as Language
}

function getLanguage639_3(stream: Ffmpeg.FfprobeStream) {
  if (!stream.tags) {
    console.log('No language for this audio track')
    return undefined
  }

  let language = stream.tags['language'] || stream.tags['LANGUAGE']

  if (language == null && stream.tags.title) {
    const title: string = stream.tags.title.toLowerCase()

    if (['francais', 'français', 'fra', 'french', 'fre', 'fr'].some(title.includes)) {
      language = 'fre'
    } else if (['korean', 'kor', 'coreen', 'cor'].some(title.includes)) {
      language = 'kor'
    } else if (['anglais', 'ang', 'an', 'english', 'eng', 'en'].some(title.includes)) {
      language = 'eng'
    }
  }

  return language || undefined
}

function getIsForced(stream: Ffmpeg.FfprobeStream): boolean {
  return !!stream.tags?.title?.toLowerCase().includes('forc')
}

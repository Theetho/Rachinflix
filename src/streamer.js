'use strict'

const ffmpeg = require('fluent-ffmpeg')
const ffprobe = require('ffmpeg-probe')
const fs = require('fs')
const logger = require('./logger')

const { ROOT_STREAMS } = require('./constantsServer')

const si = require('systeminformation')

let nvidiaCardIndex = -1

si.graphics().then((data) => {
  for (let index in data.controllers) {
    let controller = data.controllers[index]
    if (controller.vendor == 'NVIDIA') {
      nvidiaCardIndex = index
      break
    }
  }
})

/**
 * @brief - Class that handles all the converted files. It deals
 *          with converting, deleting, and storing them.
 */
class Streamer {
  constructor() {
    // Store ffmpeg process for every file being transcoded
    this.mVideoStreams = {}
  }
  /**
   * @brief - Transcode the given file to a readable file, if
   * it isn't transcode already
   *
   * @param {String} path: Path to the file to transcode
   * @param {Object} infos: Info of the file (codecs, bitrates, ...). See 'extractInfo.js"
   */
  ConvertFile(file, main_language) {
    let output = {
      path: '',
      completed: '',
    }

    const path = file.paths.absolute

    let _index = 0
    for (let language of file.audio.map((e) => {
      return e.language
    })) {
      const _output = this._GetOutputPath(file, language)

      if (language == main_language) output.path = _output
      // If their is already a conversion
      if (fs.existsSync(_output)) {
        // If its not the requested language, we just skip it
        if (language != main_language) continue
        // If it is and there is no stream for it, it means it has
        // has been transcoded but on previous server run, so the file
        // is already 100% transcoded
        if (
          !this.mVideoStreams[path] ||
          // Or it was transcoded on this server run
          (this.mVideoStreams[path][language] &&
            // Then we check if it is finished
            this.mVideoStreams[path][language].finished)
        )
          output.completed = true
        return new Promise((resolve, reject) => {
          resolve(output)
        })
      }

      // Stop the stream if it was active
      if (this.mVideoStreams[path] && this.mVideoStreams[path][language] && this.mVideoStreams[path][language].stream !== null)
        this.mVideoStreams[path].stream.kill()

      // Create the file to stream in
      fs.writeFileSync(_output)

      const current_audio = file.audio.find((e) => {
        return e.language == language
      })

      const [seconds, minutes, hours] = file.duration.split(':').reverse()
      const duration = Number.parseInt(seconds) + Number.parseInt(minutes) * 60 + (Number.isNaN(Number.parseInt(hours)) ? 0 : Number.parseInt(hours) * 3600)

      let options = [
        '-sn',
        '-preset ultrafast',
        `-map 0:${file.video.stream_index}`,
        `-vcodec ${file.video.needs_transcoding ? (file.video.codec == 'hevc' ? 'h264' : 'h264_nvenc') : 'copy'}`,
        `-t ${duration}`,
        `-map 0:${current_audio.stream_index}`,
        `-acodec ${current_audio.needs_transcoding ? 'aac' : 'copy'}`,
        '-max_muxing_queue_size 9999',
      ]

      // Use GPU acceleration if available
      if (nvidiaCardIndex >= 0 && file.video.codec != 'hevc') options.push(`-gpu ${nvidiaCardIndex}`)

      // Register the stream for the file
      if (!this.mVideoStreams[path]) {
        this.mVideoStreams[path] = {}
      }

      // Register the stream for the language
      this.mVideoStreams[path][language] = {
        stream: null,
        finished: false,
        index: _index,
      }

      // Launch the transcoding for the language
      this.mVideoStreams[path][language].stream = ffmpeg(path)
        .inputOption(nvidiaCardIndex >= 0 && file.video.codec != 'hevc' ? ['-vsync 0', '-hwaccel cuvid'] : [])
        .outputOptions(options)
        .on('start', (commandLine) => {
          logger.Debug(`Streaming ${path}. Executed ${commandLine}.`)
          this.mVideoStreams[path][language].finished = false
        })
        .on('end', (stdout, stderr) => {
          logger.Debug(`Streaming is over`)
          this.mVideoStreams[path][language].finished = true
        })
        .on('progress', (progress) => {
          logger.Progress(progress.percent.toFixed(2), this.mVideoStreams[path][language].index, language)
        })
        .on('error', (error, stdout, stderr) => {
          if (error.message !== 'ffmpeg was killed with signal SIGKILL') logger.Error(error.message, stdout, stderr)
        })
        .save(_output)

      ++_index
    }

    // Send the file after a time, so the transcoding has some advance
    // over the streaming
    return new Promise((resolve, reject) => {
      if (output.path == '') output.path = this._GetOutputPath(file, file.audio[0].language)

      setTimeout(() => {
        logger.Debug('Little delay to transcode the beginning')
        resolve(output)
      }, 5000)
    })
  }
  /**
   * @brief - Kill the ffmpeg process that is converting the input file and
   * delete the converted file. Must be called when user closes the video
   * before the end of transcoding so the incomplete file can be deleted.
   *
   * @param {String} path - Path to the file being streamed
   */
  async StopConverting(file) {
    const path = file.paths.absolute
    // If the file wasn't being streamed
    if (this.mVideoStreams[path] === undefined) return

    // Stop the streams if they were active
    if (this.mVideoStreams[path]) {
      for (let language in this.mVideoStreams[path]) {
        this.mVideoStreams[path][language].stream.kill()
      }
    }

    delete this.mVideoStreams[path]
  }
  /**
   * @brief - Delete the converted file(s) of the original file.
   *
   * @param {String} path - Path to the file being streamed
   */
  DeleteStream(file) {
    const path = file.paths.absolute
    logger.Info('Deleting file for: ', path)

    // Get the folder where converted files are stored
    const folder = fs.readdirSync(ROOT_STREAMS)

    // For every file inside
    folder.forEach((file_to_delete) => {
      const file_id = Number.parseInt(file_to_delete.replace(/(-*[0-9]+)_.*/, '$1'))
      if (file_id != file.id) return

      // Create a new temporary name for the file that is going to be deleted
      const _path = `${ROOT_STREAMS}/${Math.random()}.mkv`
      // Rename it
      fs.renameSync(`${ROOT_STREAMS}/${file_to_delete}`, _path)
      // Delete it
      fs.unlinkSync(_path)
      logger.Info(`File ${file_to_delete} deleted`)
    })
  }
  /**
   * @brief - Replace the file by its conversion if they have the
   *          same tracks (video and audio tracks)
   *
   * @param {String} path - Path to the file being streamed
   */
  async StoreConvertedFile(file, path) {
    const output = this._GetOutputPath(file, path)

    if (!this.mStreams[output].finished) return

    // Count video and audio tracks in the given streams
    const CountUsefullStreams = (streams) => {
      let count = 0
      for (const index in streams) {
        const stream = streams[index]

        if (stream['codec_type'] !== 'video' && stream['codec_type'] !== 'audio') continue

        ++count
      }

      return count
    }

    // File have same audio and video streams, except that output
    // is readable by browsers, so we override the input by the
    // output, and then next time we don't have to transcode it.
    if (CountUsefullStreams(await ffprobe(path).streams) === CountUsefullStreams(await ffprobe(output).streams)) {
      try {
        fs.copyFileSync(output, path)
      } catch (error) {
        logger.Error(`Error while overriding ${path}`)
      }

      logger.Info(`Overrided ${path} sucessfully !`)
    }
  }
  /**
   * @brief - Create the path to the converted file.
   *
   * @param {String} path - Path to the file being streamed.
   * @param {String} language - Audio language of file (used in the extension).
   *
   * @return {String} - The path to the converted file.
   */
  _GetOutputPath(file, language) {
    return `${ROOT_STREAMS}/${file.id}_${language}.mkv`
  }
}
module.exports = {
  Streamer,
}

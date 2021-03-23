const ffprobe = require('ffmpeg-probe')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const logger = require('./logger')

async function SetAspectRatio(path, width, height) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(path)) {
      resolve()
      return
    }

    const probe = await ffprobe(path)

    if (probe.width == width && probe.height == height) {
      resolve()
      return
    }

    logger.Info(`Resizing ${path}`)
    let output = path.replace('.mkv', '_.mkv')

    ffmpeg(path)
      .outputOptions([`-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad='${width}:${height}:(ow-iw)/2:(oh-ih)/2',setsar=1`])
      .save(output)
      .on('end', () => {
        resolve()
        fs.unlinkSync(path)
        fs.renameSync(output, path)
        logger.Success('Video resized !')
      })
  })
}

module.exports = SetAspectRatio

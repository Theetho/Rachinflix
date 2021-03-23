const fs = require('fs')
const logger = require('./logger')

/**
 * Create every folder that doesn't exist in the given path.
 *
 * @param {String} root - Root of the actual folder to check/create.
 * @param {String} localPath - Path to parse to create the folders.
 */
const CreateFoldersFromPath = (root, localPath) => {
  // Remove the file in the path
  const directoryPath = localPath.split('/')
  directoryPath.pop()

  let actualDir = `${root}`

  for (let directory of directoryPath) {
    if (directory != '') actualDir += `/${directory}`

    if (!fs.existsSync(actualDir)) {
      fs.mkdirSync(actualDir)
      logger.Debug(`Created directory ${actualDir} !`)
    }
  }

  return actualDir
}

module.exports = CreateFoldersFromPath

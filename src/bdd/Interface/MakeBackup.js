const fs = require('fs')
const path = require('path')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
})
const logger = require('../../logger')
const JSONDataBase = require('../JsonDB/JsonDB')

// Checking / Creating backups
const backup_path = path.join(__dirname, '../JsonDB/DB_backup.json')
const db_path = path.join(__dirname, '../JsonDB/DB.json')

module.exports = (db) => {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(backup_path)) {
      const AskQuestion = () => {
        return new Promise((resolve, reject) => {
          readline.question(
            `Il y a déjà une sauvegarde de la BDD. Veux-tu:
    [1] La remplacer ?
    [2] La restaurer ?
    [3] Ne rien faire ?
`,
            async (res) => {
              logger.MoveUp()
              res = Number.parseInt(res)
              switch (res) {
                case 1:
                  fs.unlinkSync(backup_path)
                  fs.copyFileSync(db_path, backup_path)
                  logger.Success('Base de donnée sauvegardée !')
                  break
                case 2:
                  delete db
                  fs.unlinkSync(db_path)
                  fs.copyFileSync(backup_path, db_path)
                  db = new JSONDataBase()._db
                  logger.Success('Base de donnée restaurée et rechargée !')
                  break
                case 3:
                  break
                default:
                  await AskQuestion()
                  break
              }
              readline.close()
              resolve()
            }
          )
        })
      }

      await AskQuestion()
      resolve()
    } else {
      fs.copyFileSync(db_path, backup_path)
      resolve()
    }
  })
}

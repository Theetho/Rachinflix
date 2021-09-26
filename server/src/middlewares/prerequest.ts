import { Injectable } from '@nestjs/common'
import { Language, UserHateoas } from 'src/interface'

/**
 * Ce middleware renseigne la langue par défaut en anglais
 */
@Injectable()
export class PreRequestMiddleware {
  use(req, res, next) {
    try {
      var user: UserHateoas = JSON.parse(req.cookies['rachinflixCurrentUser'])
      req.query.userId = user.id
    } catch (e) {
    } finally {
      req.query.language = req.query.language ?? user?.languages?.text ?? Language.ENG_US
    }

    next()
  }
}

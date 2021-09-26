import { Language } from '..'

export type UserModifiedOrCreated = {
  name: string
  languages: {
    text: Language
    audio: Language
  }
  sprite: number
}

export type UserHateoas = UserModifiedOrCreated & {
  id: string
  _links: {
    getSprite: { href: `/users/sprite/${number}` }
    getProfile: { href: `/user/${string}/profile` }
  }
  _actions: {
    updateUser: { href: `/user/${string}`; method: 'POST'; body: any }
    deleteUser: { href: `/user/${string}`; method: 'DELETE'; body: undefined }
  }
}

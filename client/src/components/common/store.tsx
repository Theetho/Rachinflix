import { Api } from 'api/api'
import { useApi } from 'contexts/api'
import { Language, UserHateoas } from 'interface'
import { action, makeObservable, observable } from 'mobx'
import React, { createContext } from 'react'
import Cookies from 'universal-cookie'

const cookies = new Cookies()

type UserModification = {
  name?: string
  sprite?: number
  languages?: {
    text?: Language
    audio?: Language
  }
}

export class Store {
  user: UserHateoas | undefined
  private readonly api: Api

  constructor(api: Api) {
    makeObservable(this, {
      user: observable,
      getUser: action,
      setUser: action,
      getUserLanguage: action,
      setUserLanguage: action,
      getUsername: action,
      modifyUser: action,
      deleteUser: action
    })
    this.setUser(cookies.get('rachinflixCurrentUser'))
    this.api = api
  }

  getUser() {
    return this.user
  }
  setUser(user: UserHateoas | undefined) {
    if (user) {
      cookies.set('rachinflixCurrentUser', JSON.stringify(user))
    } else {
      cookies.remove('rachinflixCurrentUser')
    }

    this.user = user
  }

  getUserLanguage(type: 'audio' | 'text') {
    return this.user?.languages[type]
  }
  setUserLanguage(type: 'audio' | 'text', language: Language) {
    if (!this.user) return

    this.modifyUser({ languages: { [type]: language } })
  }

  getUsername() {
    return this.user?.name
  }

  modifyUser(modification: UserModification) {
    if (!this.user) return

    this.user._actions.updateUser.body = modification
    this.api.query<UserHateoas>(this.user, '@updateUser').then(user => this.setUser(user))
  }

  deleteUser() {
    if (!this.user) return

    this.api.query(this.user, '@deleteUser').then(() => this.setUser(undefined))
  }
}

const StoreContext = createContext<Store>({} as Store)

export const StoreProvider: React.FC = ({ children }) => {
  const api = useApi()

  return <StoreContext.Provider value={new Store(api)}>{children}</StoreContext.Provider>
}

export const useStore = () => React.useContext(StoreContext)

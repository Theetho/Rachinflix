import classNames from 'classnames'
import { UserCreatorComponent } from 'components/authentication-page/userCreator'
import { Icon, IconName } from 'components/common/icons/icon'
import { useStore } from 'components/common/store'
import { useApi } from 'contexts/api'
import { Language, UserHateoas, UserModifiedOrCreated } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './userMenu.scss'

const LANGUAGE_MENU = {
  sections: {
    'eng-US': [
      { sectionLabel: 'Audio', type: 'audio' },
      { sectionLabel: 'Text', type: 'text' }
    ],
    'fre-FR': [
      { sectionLabel: 'Audio', type: 'audio' },
      { sectionLabel: 'Texte', type: 'text' }
    ]
  } as Partial<Record<Language, { sectionLabel: string; type: string }[]>>,
  languages: [
    { languageLabel: 'English', language: 'eng-US' },
    { languageLabel: 'Français', language: 'fre-FR' }
  ]
}

export const UserMenuComponent: React.FC = observer(() => {
  const store = useStore()
  const api = useApi()
  const state = useLocalObservable(() => ({
    toggle: false,
    toggleLanguage: false,
    toggleModification: false,
    toggleNewFiles: false,
    currentLanguages: {
      text: undefined as Language | undefined,
      audio: undefined as Language | undefined
    },
    logOut() {
      store.setUser(undefined)
    }
  }))

  useEffect(() => {
    if (store.user == null) return

    state.currentLanguages = store.user.languages
  }, [store.user])

  useEffect(() => {
    if (state.toggleModification) {
      document.getElementById('header-search-menu')?.setAttribute('style', 'display: none')
      document.getElementById('user-menu')?.setAttribute('style', 'display: none')
    } else {
      document.getElementById('header-search-menu')?.removeAttribute('style')
      document.getElementById('user-menu')?.removeAttribute('style')
    }
  })

  return (
    <>
      <div id="user-menu">
        <div
          id="user-menu-avatar"
          onClick={() => {
            state.toggle = !state.toggle
            state.toggleLanguage = false
          }}
        >
          <img src={api.hrefSync(store.getUser() as UserHateoas, 'getSprite')} alt="logo" />
        </div>
        <div className={classNames('user-menu', state.toggle && 'toggled')}>
          <div className={classNames('user-menu', state.toggleLanguage && 'toggled')}>
            <span
              onClick={() => {
                state.toggleLanguage = false
              }}
            >
              {state.currentLanguages.text === 'fre-FR' ? 'Retour' : 'Back'}
            </span>
            {LANGUAGE_MENU.sections[state.currentLanguages.text ?? 'eng-US']?.map(({ sectionLabel, type }, i) => (
              <div key={i}>
                {sectionLabel}
                {LANGUAGE_MENU.languages.map(({ languageLabel, language }, j) => (
                  <span
                    key={j}
                    className={classNames(
                      state.currentLanguages[type as 'audio' | 'text'] === language && 'selected-language'
                    )}
                    onClick={() => {
                      store.setUserLanguage(type as 'audio' | 'text', language as Language)
                    }}
                  >
                    {languageLabel}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className={'user-menu-section'}>
            <img src={api.hrefSync(store.getUser() as UserHateoas, 'getSprite')} alt="" />
            <span>{store.getUser()?.name} </span>
          </div>
          <div
            className={'user-menu-section'}
            onClick={() => {
              state.toggleModification = true
            }}
          >
            <Icon name={IconName.INFO} />
            <span>{state.currentLanguages.text === 'fre-FR' ? 'Profil' : 'Profile'} </span>
          </div>
          <div
            className={'user-menu-section'}
            onClick={() => {
              state.toggleLanguage = true
            }}
          >
            <Icon name={IconName.GLOBE} />
            {state.currentLanguages.text === 'eng-US' ? 'Languages' : 'Langues'}
          </div>
          <Link className={'user-menu-section'} to="/management">
            <Icon name={IconName.FOLDER} />
            {state.currentLanguages.text === 'eng-US' ? 'New files' : 'Nouveaux fichiers'}
          </Link>
          <div className={'user-menu-section'} onClick={state.logOut}>
            <Icon name={IconName.LOG_OUT} />
            {state.currentLanguages.text === 'eng-US' ? 'Sign out' : 'Deconnexion'}
          </div>
        </div>
      </div>
      {state.toggleModification && (
        <div className="user-menu-user-modification">
          <UserCreatorComponent
            user={store.getUser()}
            onCancel={() => (state.toggleModification = false)}
            onSave={(user: UserModifiedOrCreated) => {
              store.modifyUser(user)
              state.toggleModification = false
            }}
            onDelete={() => store.deleteUser()}
          />
        </div>
      )}
    </>
  )
})

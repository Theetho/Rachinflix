import { useApi } from 'contexts/api'
import { Language, UserHateoas, UserModifiedOrCreated } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React from 'react'
import { LanguageSelectorComponent } from './languageSelector'
import './userCreator.scss'

const SPRITE_COUNT = 258

export const UserCreatorComponent: React.FC<{
  user?: UserHateoas
  onSave: (user: UserModifiedOrCreated) => void
  onCancel: () => void
  onDelete?: () => void
}> = observer(({ user, onSave, onCancel, onDelete }) => {
  const api = useApi()

  const state = useLocalObservable(() => ({
    editSprite: false,
    userModified: {
      name: user?.name,
      languages: {
        text: user?.languages?.text ?? Language.ENG_US,
        audio: user?.languages?.audio ?? Language.ENG_US
      },
      sprite: user?.sprite ?? Number.parseInt(String(Math.random() * SPRITE_COUNT))
    }
  }))

  return (
    <div id="user-modifier">
      <div id="user-modifier-title">
        {!user ? 'Nouveau profil' : user.languages.text === 'fre-FR' ? 'Modifier le profil' : 'Change your profile'}
      </div>
      <div id="user-infos">
        <div id="user-avatar">
          <img src={api.addPrefix(`users/sprite/${state.userModified.sprite}`)} />
          <div className="avatar-edit-icon">
            <svg
              className="svg-icon svg-icon-edit"
              focusable="true"
              onClick={() => (state.editSprite = !state.editSprite)}
            >
              <path
                fill="currentColor"
                d="M16 0c8.833 0 16 7.167 16 16 0 8.8-7.167 16-16 16s-16-7.2-16-16c0-8.833 7.167-16 16-16zM16 1.7c-7.9 0-14.3 6.4-14.3 14.3s6.4 14.3 14.3 14.3 14.3-6.4 14.3-14.3-6.4-14.3-14.3-14.3zM22.333 12.9l0.3-0.267 0.867-0.867c0.467-0.5 0.4-0.767 0-1.167l-1.767-1.767c-0.467-0.467-0.767-0.4-1.167 0l-0.867 0.867-0.267 0.3zM18.3 11.1l-8.6 8.6-0.833 3.767 3.767-0.833 0.967-1 7.633-7.6z"
              ></path>
            </svg>
            {state.editSprite && (
              <div id="avatar-list">
                {Array(SPRITE_COUNT)
                  .fill(0)
                  .map((useless, index) => (
                    <img
                      key={`sprite-${index}`}
                      src={api.addPrefix(`users/sprite/${index}`)}
                      onClick={() => {
                        state.userModified.sprite = index
                        state.editSprite = false
                      }}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
        <input
          type="text"
          name="username"
          id="user-modifier-name"
          value={state.userModified.name}
          onChange={e => (state.userModified.name = e.currentTarget.value)}
          placeholder={user?.languages.text === 'eng-US' ? 'Your name' : 'Ton nom'}
        />
        <LanguageSelectorComponent
          id="first-selecter"
          getCurrent={() => state.userModified.languages.text}
          onChange={(language: Language) => (state.userModified.languages.text = language)}
          label={state.userModified.languages.text == 'eng-US' ? 'Language:' : 'Langue:'}
        />
        <LanguageSelectorComponent
          id="second-selecter"
          getCurrent={() => state.userModified.languages.audio}
          onChange={(language: Language) => (state.userModified.languages.audio = language)}
          label={state.userModified.languages.text == 'eng-US' ? 'Audio language:' : 'Langue audio:'}
        />
      </div>
      <div id="user-modifier-buttons">
        <button
          disabled={state.userModified.name == null}
          id="save"
          onClick={() => {
            onSave(state.userModified as Omit<UserHateoas, '_links'>)
          }}
        >
          {state.userModified.languages.text === 'eng-US' ? 'Save' : 'Enregistrer'}
        </button>
        <button id="cancel" onClick={onCancel}>
          {state.userModified.languages.text === 'eng-US' ? 'Cancel' : 'Annuler'}
        </button>
        {user && (
          <button id="delete" onClick={onDelete}>
            {state.userModified.languages.text === 'eng-US' ? 'Delete this user' : 'Supprimer le profil'}
          </button>
        )}
      </div>
    </div>
  )
})

import { Language } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React from 'react'
import './languageSelector.scss'

const SUPPORTED_LANGUAGES = { [Language.ENG_US]: 'English', [Language.FRE_FR]: 'Francais' }

export const LanguageSelectorComponent: React.FC<
  { label: string; getCurrent: () => Language; onChange: (language: Language) => void } & any
> = observer(({ label, getCurrent, onChange, ...props }) => {
  const state = useLocalObservable(() => ({
    toggle: false,
    current: SUPPORTED_LANGUAGES[getCurrent() as Language.FRE_FR | Language.ENG_US]
  }))

  return (
    <div className="user-language-selector" {...props}>
      {label}
      <div className="user-language-selector-content">
        <button className={state.toggle ? 'is-toggle' : 'is-not-toggle'} onClick={() => (state.toggle = !state.toggle)}>
          {state.current}
        </button>
        {state.toggle && (
          <ul className="user-language-list">
            {Object.keys(SUPPORTED_LANGUAGES).map((language, index) => (
              <li
                className="user-language-item"
                key={`${label}-${language}`}
                onClick={() => {
                  onChange(language)
                  state.current = SUPPORTED_LANGUAGES[getCurrent() as Language.FRE_FR | Language.ENG_US]
                  state.toggle = false
                }}
              >
                <div className="user-language-option">
                  {SUPPORTED_LANGUAGES[language as Language.FRE_FR | Language.ENG_US]}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
})

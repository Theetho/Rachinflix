import classNames from 'classnames'
import { useStore } from 'components/common/store'
import { SeasonHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React from 'react'
import './seasonSelector.scss'

export const SeasonSelector: React.FC<{
  seasons: SeasonHateoas[]
  current: SeasonHateoas
  setCurrent: (season: SeasonHateoas) => void
}> = observer(({ seasons, current, setCurrent }) => {
  const store = useStore()
  const state = useLocalObservable(() => ({
    toggle: false,
    changeToSeason(season: SeasonHateoas) {
      this.toggle = !this.toggle
      setCurrent(season)
    },
    formatSeason(season: SeasonHateoas): string {
      return `${store.getUserLanguage('text') === 'fre-FR' ? 'Saison' : 'Season'} ${season.number}`
    },
    formatEpisodes(episodes: number): string {
      return `( ${episodes} ${store.getUserLanguage('text') === 'fre-FR' ? 'épisodes' : 'episodes'})`
    }
  }))

  return (
    <div className="season-selector">
      <div className="season-selector-content">
        <button
          className={classNames(state.toggle ? 'is-toggle' : 'is-not-toggle')}
          onClick={() => {
            state.toggle = !state.toggle
          }}
        >
          {state.formatSeason(current)}
        </button>

        {state.toggle && (
          <ul className="season-list">
            {seasons.map((season, index) => (
              <li
                className="season-item"
                key={index}
                onClick={() => {
                  state.changeToSeason(season)
                }}
              >
                <div className="season-option">
                  {state.formatSeason(season)}
                  <span className="season-option-episodes">{state.formatEpisodes(season.episode_count)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
})

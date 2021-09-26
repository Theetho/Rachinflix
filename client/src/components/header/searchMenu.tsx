import classNames from 'classnames'
import { Accordion } from 'components/common/accordion'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { useStore } from 'components/common/store'
import { useApi } from 'contexts/api'
import { FilmHateoas, SerieHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import './searchMenu.scss'

export const SearchMenuComponent: React.FC = observer(() => {
  const store = useStore()
  const api = useApi()
  const eventHandler = useEventHandler()

  const state = useLocalObservable(() => ({
    films: undefined as Record<string, FilmHateoas[]> | undefined,
    series: undefined as SerieHateoas[] | undefined,
    research: undefined as string | undefined,
    opened: false,
    highlight(item: Element | null) {
      if (!item) return

      const animation = 1500
      const style = item.getAttribute('style')

      item.setAttribute('style', `${style ?? ''} animation: glow ${animation}ms`)
      setTimeout(() => {
        item.setAttribute('style', style ?? '')
      }, animation)
    },
    suitsResearch(collection: string[]): boolean {
      if (!this.research) return false

      for (let i = 0; i < collection.length; ++i) {
        if (collection[i].toLowerCase().trim().includes(this.research)) {
          return true
        }
      }
      return false
    }
  }))

  useEffect(() => {
    state.opened = false

    api.get<FilmHateoas[]>(`/films?language=${store.getUserLanguage('text')}`).then(films => {
      state.films = {}
      films.forEach(film => {
        if (!Array.isArray(state.films?.[film.collection[0]])) {
          ;(state.films as Record<string, FilmHateoas[]>)[film.collection[0]] = []
        }
        state.films?.[film.collection[0]].push(film)
      })
    })
    api.get<SerieHateoas[]>(`/series?language=${store.getUserLanguage('text')}`).then(series => {
      state.series = series
    })
  }, [store.user?.languages.text])

  useEffect(() => {
    document.body.style.overflowY = state.opened ? 'hidden' : 'auto'
  }, [state.opened])

  return (
    <>
      <span
        id="header-search-menu"
        onClick={() => {
          state.opened = !state.opened
        }}
      >
        <Icon name={IconName.MENU} size={IconSize.SMALL} />
      </span>
      <div id="search-menu" className={classNames('has-no-scrollbar', state.opened ? 'opened' : '')}>
        <div id="search-menu-bar">
          <input
            id="search-menu-input"
            type="text"
            onChange={e => {
              state.research = e.target.value.toLowerCase().trim()
            }}
          />
        </div>
        {state.opened && (
          <div id="search-menu-container">
            {!state.research ? (
              <div>
                <Accordion title={'Films'}>
                  {state.films &&
                    Object.keys(state.films).map((key: string, index: number) => (
                      <Accordion title={key} key={`subaccordion-${index}`}>
                        {state.films?.[key]?.map((film: FilmHateoas, index: number) => (
                          <div
                            className={'search-menu-item'}
                            key={`search-menu-film-${index}`}
                            onClick={() => {
                              state.opened = false
                              eventHandler.emit(ClientEvent.OpenBrowser, film)
                            }}
                          >
                            - {film.title}
                          </div>
                        ))}
                      </Accordion>
                    ))}
                </Accordion>
                <Accordion title={'Series'}>
                  {state.series?.map((serie: SerieHateoas, index: number) => (
                    <div
                      className={'search-menu-item'}
                      key={`search-menu-serie-${index}`}
                      onClick={() => {
                        state.opened = false
                        eventHandler.emit(ClientEvent.OpenBrowser, serie)
                      }}
                    >
                      - {serie.title}
                    </div>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div>
                <Accordion title={'Films'} defaultExtended={true}>
                  {state.films &&
                    Object.values(state.films)?.map((films: FilmHateoas[]) =>
                      films?.map(
                        (film: FilmHateoas, index: number) =>
                          state.suitsResearch(film.collection) && (
                            <div
                              className={'search-menu-item'}
                              key={`search-menu-searched-film-${index}`}
                              onClick={() => {
                                state.opened = false
                                eventHandler.emit(ClientEvent.OpenBrowser, film)
                              }}
                            >
                              - {film.title}
                            </div>
                          )
                      )
                    )}
                </Accordion>
                <Accordion title={'Series'} defaultExtended={true}>
                  {state.series?.map(
                    (serie: SerieHateoas, index: number) =>
                      state.suitsResearch(serie.collection) && (
                        <div
                          className={'search-menu-item'}
                          key={`search-menu-searched-serie-${index}`}
                          onClick={() => {
                            state.opened = false
                            eventHandler.emit(ClientEvent.OpenBrowser, serie)
                          }}
                        >
                          - {serie.title}
                        </div>
                      )
                  )}
                </Accordion>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
})

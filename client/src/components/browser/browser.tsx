import classNames from 'classnames'
import { Button, ButtonVariation } from 'components/common/button'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { useStore } from 'components/common/store'
import { useApi } from 'contexts/api'
import { sortByNumber } from 'helpers/array'
import { EpisodeHateoas, FilmHateoas, Genres, SeasonHateoas, SerieHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { createRef, useCallback, useEffect } from 'react'
import './browser.scss'
import { EpisodeInfos } from './episodeInfos'
import { SeasonSelector } from './seasonSelector'

export function formatDate(date?: string) {
  // Date is either yyyy-mm-dd or dd/mm/yyyy and we only want the year
  return date?.split('-').reverse().join('/').split('/').reverse()[0] ?? ''
}

export const BrowserComponent: React.FC<{ details: FilmHateoas | SerieHateoas }> = observer(({ details }) => {
  const store = useStore()
  const api = useApi()
  const eventHandler = useEventHandler()

  const state = useLocalObservable(() => ({
    trailer: undefined as string | undefined,
    seasons: undefined as SeasonHateoas[] | undefined,
    current: undefined as SeasonHateoas | undefined,
    episodes: undefined as EpisodeHateoas[] | undefined,
    video: createRef<HTMLVideoElement>()
  }))

  const requestCustomEpisode = useCallback(
    (season: number, episode: number) => {
      eventHandler.emit(ClientEvent.RequestCustomEpisode, { details, episode, season })
    },
    [details]
  )

  useEffect(() => {
    if (!details) return
    document.body.style.overflowY = 'hidden'

    api
      .href(details as FilmHateoas, 'getTrailer')
      .then(trailer => (state.trailer = trailer))
      .catch(() => {
        // Can throw error as well, but if it does we don't want to catch it
        api
          .href(details as SerieHateoas, 'getCurrentSeason.getTrailer')
          .then(trailer => (state.trailer = trailer))
          .catch(() => {
            console.error('No link to a poster in that object')
          })

        api.query<SeasonHateoas>(details, 'getCurrentSeason').then(season => {
          state.seasons = [season, ...(state.seasons ?? [])]
          state.current = season
        })
        api.query<SeasonHateoas[]>(details, 'getOtherSeasons').then(seasons => {
          state.seasons = [...(state.seasons ?? []), ...seasons].sort(sortByNumber)
        })
      })

    return () => {
      document.body.style.overflowY = 'auto'
    }
  }, [details])

  useEffect(() => {
    if (!state.current) return

    state.trailer = undefined

    api
      .href(state.current, 'getTrailer')
      .then(trailer => (state.trailer = trailer))
      .catch(() => {
        console.error('No link to a poster in that object')
      })

    api.query<EpisodeHateoas>(state.current, 'getCurrentEpisode').then(episode => {
      if (!state.current) return

      api.query<EpisodeHateoas[]>(state.current, 'getOtherEpisodes').then(episodes => {
        state.episodes = [episode, ...episodes].sort(sortByNumber)
      })
    })
  }, [state.current])

  useEffect(() => {
    state.video.current?.addEventListener('loadedmetadata', () => state.video.current?.play(), {
      once: true
    })
  }, [state.video])

  return (
    <div id="file-browser" className={classNames('no-filter')}>
      <div id={'file-browser-content'} className={classNames('content', 'has-no-scrollbar')}>
        <div className={'trailer-area'}>
          <button
            className="modal-close"
            aria-label="close"
            onClick={() => {
              eventHandler.emit(ClientEvent.CloseBrowser)
            }}
          ></button>
          <Button
            className={'file-browser-play-now'}
            variation={ButtonVariation.Octonary}
            onClick={() => {
              state.video.current?.pause()
              eventHandler.emit(ClientEvent.OpenPlayer, details)
              eventHandler.emit(ClientEvent.CloseBrowser)
            }}
          >
            <Icon name={IconName.PLAY} size={IconSize.HUGE} />
            {store.getUserLanguage('text') === 'fre-FR' ? 'Lecture' : 'Play now'}
          </Button>
          <video ref={state.video} src={state.trailer} autoPlay />
          <div
            className={'video-filter'}
            onClick={() => {
              state.video.current?.paused ? state.video.current?.play() : state.video.current?.pause()
            }}
          />
        </div>
        <div className="file-browser-first-row">
          <span id="file-browser-title">{details?.title}</span>
          <span id="file-browser-date">{formatDate(state.current?.release_date ?? details?.release_date)}</span>
          {/* @ts-ignore */}
          <span id="file-browser-genres">{details?.genres.map((genre: number) => Genres[genre]).join(', ')}</span>
        </div>
        <div id="file-browser-overview">{details?.overview}</div>
        {state.current && (
          <div id="file-browser-episodes">
            <div id="file-browser-episodes-header">
              <h3>{store.getUserLanguage('text') === 'fre-FR' ? 'Épisodes' : 'Episodes'}</h3>
              {state.seasons && (
                <SeasonSelector
                  seasons={state.seasons}
                  current={state.current}
                  setCurrent={(newSeason: SeasonHateoas) => {
                    state.current = newSeason
                  }}
                />
              )}
            </div>
            {state.episodes?.map((episode, index) => (
              <EpisodeInfos episode={episode} requestCustomEpisode={requestCustomEpisode} key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

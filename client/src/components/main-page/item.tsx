import { Item } from 'App'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Icon, IconHover, IconName } from 'components/common/icons/icon'
import { CustomSkeleton } from 'components/common/skeletons'
import { useStore } from 'components/common/store'
import { useApi } from 'contexts/api'
import { EpisodeHateoas, FilmHateoas, SerieHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useCallback, useEffect } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import './item.scss'

export function formatEpisode(episode: EpisodeHateoas): string {
  return `S${episode.season_number < 10 ? '0' : ''}${episode.season_number}:E${episode.number < 10 ? '0' : ''}${
    episode.number
  }`
}

export const ItemComponent: React.FC<{ item: Item | undefined }> = observer(({ item }) => {
  const api = useApi()
  const store = useStore()
  const eventHandler = useEventHandler()

  const state = useLocalObservable(() => ({
    episode: undefined as EpisodeHateoas | undefined,
    poster: undefined as string | undefined,
    loaded: false
  }))

  const browse = useCallback(() => {
    eventHandler.emit(ClientEvent.OpenBrowser, item)
  }, [item])

  const play = useCallback(() => {
    eventHandler.emit(ClientEvent.OpenPlayer, item)
  }, [item])

  useEffect(() => {
    state.poster = undefined
    state.loaded = false
    if (!item) return

    api
      .href(item as FilmHateoas, 'getPoster')
      .then(poster => (state.poster = poster))
      .catch(() => {
        if (!item) return

        // Can throw error as well, but if it does we don't want to catch it
        api
          .href(item as SerieHateoas, 'getCurrentSeason.getPoster')
          .then(poster => (state.poster = poster))
          .catch(() => {
            console.error('No link to a poster in that object')
          })
      })

    api
      .query<EpisodeHateoas>(item as SerieHateoas, 'getCurrentSeason.getCurrentEpisode')
      .then(episode => (state.episode = episode))
      .catch(() => (state.episode = undefined))
  }, [item])

  useEffect(() => {
    state.poster = undefined
    state.loaded = false
  }, [store.user?.languages.text])

  return (
    <div className="item" id={`${item?.tmdb_id}`} style={{ minHeight: `37vh` }}>
      {state.poster && (
        <LazyLoadImage
          style={{ minHeight: `37vh` }}
          afterLoad={() => (state.loaded = true)}
          className="item-thumbnail"
          src={state.poster}
        />
      )}
      <CustomSkeleton
        condition={!state.loaded}
        style={{ position: 'absolute', zIndex: 10, transform: 'scale(1)' }}
        height="100%"
        width="100%"
      >
        <div className="item-top">
          <span className="item-infos">
            <span>{item?.title}</span>
            {state.episode && <span>{formatEpisode(state.episode)}</span>}
          </span>
        </div>
        <div className="item-bottom">
          <span className="item-icons">
            <span onClick={play}>
              <Icon name={IconName.PLAY} />
              <span>Play</span>
            </span>
            <div onClick={browse}>
              <Icon name={IconName.INFO} hover={IconHover.GROW} />
            </div>
          </span>
        </div>
      </CustomSkeleton>
    </div>
  )
})

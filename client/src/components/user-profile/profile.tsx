import { Button, ButtonVariation } from 'components/common/button'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { CustomSkeleton } from 'components/common/skeletons'
import { useStore } from 'components/common/store'
import { formatEpisode } from 'components/main-page/item'
import { useApi } from 'contexts/api'
import { secondsToDuration } from 'helpers/time'
import { EpisodeHateoas, FilmHateoas, SeasonHateoas, SerieHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { ProfileCarouselComponent } from './carousel'
import './profile.scss'

export const VerticalCarouselComponent: React.FC<{
  title: string
  items: Array<FilmHateoas | SerieHateoas> | undefined
}> = observer(({ title, items }) => {
  const api = useApi()
  const eventHandler = useEventHandler()
  const store = useStore()

  const state = useLocalObservable(() => ({
    hateoas: {
      film: undefined as FilmHateoas | undefined,
      serie: undefined as SerieHateoas | undefined,
      season: undefined as SeasonHateoas | undefined,
      episode: undefined as EpisodeHateoas | undefined
    },
    backgroundColor: '#141414',
    backgroundImage: undefined as string | undefined
  }))

  useEffect(() => {
    state.hateoas = {
      film: undefined,
      serie: undefined,
      season: undefined,
      episode: undefined
    }
    state.backgroundImage = undefined
  }, [store.user?.languages])

  return (
    <>
      <div className="vertical-carousel">
        <div className="carousel-title">{title}</div>
        <div
          className="profile-section"
          style={
            state.backgroundImage == null
              ? {}
              : {
                  backgroundImage: `url(${state.backgroundImage})`
                }
          }
        >
          <div
            className="profile-backdrop"
            style={
              state.hateoas.film == null && state.hateoas.serie == null ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
            }
          >
            <CustomSkeleton
              condition={state.backgroundImage == null}
              height="100%"
              width="100%"
              style={{ position: 'absolute' }}
            />
            <div className="profile-current">
              {!state.hateoas.serie && !state.hateoas.episode && !state.hateoas.film && (
                <>
                  <h3>
                    <CustomSkeleton condition={true} height="1em" width="50%" />
                  </h3>
                  <p>
                    <CustomSkeleton condition={true} height="1em" width="75%" style={{ marginBottom: '0.5em' }} />
                    <CustomSkeleton condition={true} height="1em" width="75%" style={{ marginBottom: '0.5em' }} />
                    <CustomSkeleton condition={true} height="1em" width="75%" style={{ marginBottom: '0.5em' }} />
                  </p>
                  <div>
                    <CustomSkeleton condition={true} height="2em" width="7.5em" style={{ marginRight: '0.5em' }} />
                    <CustomSkeleton condition={true} height="2em" width="7.5em" style={{ marginRight: '0.5em' }} />
                  </div>
                </>
              )}
              {state.hateoas.film && (
                <>
                  <h3>
                    {state.hateoas.film.title}
                    <span>{state.hateoas.film.time > 0 && ` - ${secondsToDuration(state.hateoas.film.time)}`}</span>
                  </h3>
                  <p>{state.hateoas.film.overview}</p>
                </>
              )}
              {state.hateoas.serie && state.hateoas.episode && (
                <>
                  <h3>
                    {state.hateoas.serie.title}
                    {` - ${formatEpisode(state.hateoas.episode)}: ${state.hateoas.episode.title}`}
                    <span>
                      {state.hateoas.episode.time > 0 && ` - ${secondsToDuration(state.hateoas.episode.time)}`}
                    </span>
                  </h3>
                  <p>{state.hateoas.episode.overview}</p>
                </>
              )}
              {(state.hateoas.film || state.hateoas.serie) && (
                <div>
                  <Button
                    variation={ButtonVariation.Octonary}
                    onClick={() => {
                      eventHandler.emit(ClientEvent.OpenPlayer, state.hateoas.serie ?? state.hateoas.film)
                    }}
                  >
                    <Icon name={IconName.PLAY} size={IconSize.MEDIUM} />
                    {(state.hateoas.episode?.time && state.hateoas.episode.time > 0) ||
                    (state.hateoas.film?.time && state.hateoas.film.time > 0)
                      ? store.getUserLanguage('text') === 'fre-FR'
                        ? 'Reprendre'
                        : 'Resume'
                      : store.getUserLanguage('text') === 'fre-FR'
                      ? 'Lecture'
                      : 'Play'}
                  </Button>
                  <Button
                    variation={ButtonVariation.Secondary}
                    onClick={() => {
                      eventHandler.emit(ClientEvent.OpenBrowser, state.hateoas.serie ?? state.hateoas.film)
                    }}
                  >
                    <Icon name={IconName.INFO} size={IconSize.SMALL} />
                    {store.getUserLanguage('text') === 'fre-FR' ? "Plus d'infos" : 'More infos'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <ProfileCarouselComponent
            items={items}
            setCurrent={async (filmorserie: FilmHateoas | SerieHateoas, filmorseason: FilmHateoas | SeasonHateoas) => {
              if ((filmorseason as SeasonHateoas).episode_count) {
                api.query<EpisodeHateoas>(filmorseason, 'getCurrentEpisode').then(episode => {
                  state.hateoas.serie = filmorserie as SerieHateoas
                  state.hateoas.season = filmorseason as SeasonHateoas
                  state.hateoas.episode = episode
                  state.hateoas.film = undefined
                })
              } else {
                state.hateoas.film = filmorseason as FilmHateoas
                state.hateoas.serie = undefined
                state.hateoas.season = undefined
                state.hateoas.episode = undefined
              }
              state.backgroundImage = api.hrefSync(filmorseason, 'getBackdrop')
              return new Promise(resolve => resolve())
            }}
          />
        </div>
      </div>
    </>
  )
})

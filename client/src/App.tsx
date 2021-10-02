import { WelcomePage } from 'components/authentication-page/welcome'
import { BrowserComponent } from 'components/browser/browser'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Store, useStore } from 'components/common/store'
import { HeaderComponent } from 'components/header/header'
import { HorizontalCarouselComponent } from 'components/main-page/carousel'
import { ManagementPage } from 'components/management/managementPage'
import { PlayerComponent } from 'components/player/player'
import { VerticalCarouselComponent } from 'components/user-profile/profile'
import { itemsPerSlide, itemsPerVerticalCarousel, slidesPerCarousel } from 'config'
import { useApi } from 'contexts/api'
import { FilmHateoas, SerieHateoas, UserHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.scss'

export type Item = FilmHateoas | SerieHateoas
export type Slide = Array<Item | undefined>
export type HorizontalCarousel = Slide[]
export type VerticalCarousel = Item[]

function getCarouselTitle(index: number, store: Store): string {
  const language = store.getUserLanguage('text')
  let titles: Array<string> = []

  if (language === 'fre-FR') {
    titles = [
      'Les incontournables de Rachinflix',
      "Thriller à l'intrigue envoûtante",
      'Les plus gros succès sur Rachinflix',
      'Tendances actuelles',
      'Les programmes les plus chauds de ta région',
      'Programmes historiques avec des personnages et des combats violents',
      'Programmes originaux Rachinflix',
      'Notre sélection pour vous',
      'Programmes à regarder sans modérations',
      'Series primées aux Emmys Awards à regarder sans modération',
      'Nouveautés'
    ]
  } else if (language === 'eng-US') {
    titles = [
      "Rachinflix' must-haves",
      'Thriller with bewitching plot',
      'The biggest hits on Rachinflix',
      'Current Trends',
      'The hottest programs in your area',
      'Historical programs with characters and violent fights',
      'Original Rachinflix programs',
      'Our selection for you',
      'Programs to watch without moderation',
      'Emmy Award-winning series to watch without moderation',
      'News'
    ]
  }

  index %= titles.length
  return titles[index]
}

export const App = observer(() => {
  const store = useStore()
  const eventHandler = useEventHandler()
  const api = useApi()

  const state = useLocalObservable(() => ({
    carousels: {
      horizontal: undefined as HorizontalCarousel[] | undefined,
      vertical: undefined as VerticalCarousel[] | undefined,
      ratio: undefined as number | undefined
    },
    browsed: undefined as FilmHateoas | SerieHateoas | undefined,
    file: undefined as FilmHateoas | SerieHateoas | undefined,
    profile: undefined as Array<FilmHateoas | SerieHateoas> | undefined
  }))

  useEffect(() => {
    eventHandler.addListener(ClientEvent.OpenBrowser, (details: FilmHateoas | SerieHateoas) => {
      state.browsed = details
    })
    eventHandler.addListener(ClientEvent.CloseBrowser, () => {
      state.browsed = undefined
    })
    eventHandler.addListener(ClientEvent.OpenPlayer, (details: FilmHateoas | SerieHateoas) => {
      state.file = details
    })
    eventHandler.addListener(ClientEvent.ClosePlayer, () => {
      state.profile = undefined
      // Reload the profile
      setTimeout(() => {
        api.query<Array<FilmHateoas | SerieHateoas>>(store.getUser() as UserHateoas, 'getProfile').then(profile => {
          console.log(profile)
          state.profile = profile
        })
      }, 200)
      // Delete the player after it faded out
      setTimeout(() => {
        state.file = undefined
      }, 600)
    })
    eventHandler.addListener(
      ClientEvent.RequestCustomEpisode,
      (request: { details: SerieHateoas; season: number; episode: number }) => {
        const { details, season, episode } = request
        details._actions.requestCustomEpisode.body = {
          season,
          episode
        }
        api.query<SerieHateoas>(details, '@requestCustomEpisode').then(details => {
          state.browsed = undefined
          state.file = details
        })
      }
    )
  }, [])

  useEffect(() => {
    if (!store.user) {
      return
    }

    state.carousels.horizontal = undefined
    state.carousels.vertical = undefined
    state.carousels.ratio = undefined
    state.profile = undefined

    api.get<Array<FilmHateoas | SerieHateoas>>(`/carousels`).then(files => {
      console.log(files.length, itemsPerSlide, slidesPerCarousel)
      // Number of files that can't fit into a vertical carousel
      let overflow = files.length % (itemsPerSlide * slidesPerCarousel)
      if (overflow < itemsPerVerticalCarousel * 3) {
        overflow += itemsPerSlide * slidesPerCarousel
      }

      // All the files that will be put into vertical carousels
      const verticalItems = files.slice(0, overflow)
      // All the files that will be put into horizontal carousels
      const horizontalItems = files.slice(overflow)

      state.carousels.vertical = new Array(Math.floor(verticalItems.length / itemsPerVerticalCarousel)).fill([])

      while (verticalItems.length > 0) {
        for (let i = 0; i < state.carousels.vertical.length; ++i) {
          const item = verticalItems.pop()
          if (!item) break
          state.carousels.vertical[i].push(item)
        }
      }

      const slides = []
      for (let i = 0; i < horizontalItems.length; i += itemsPerSlide) {
        slides.push(horizontalItems.slice(i, i + itemsPerSlide))
      }

      const carousels = []
      for (let i = 0; i < slides.length; i += slidesPerCarousel) {
        carousels.push(slides.slice(i, i + slidesPerCarousel))
      }

      state.carousels.horizontal = carousels
      state.carousels.ratio = Math.floor(state.carousels.horizontal.length / state.carousels.vertical.length)
      api
        .query<Array<FilmHateoas | SerieHateoas>>(store.getUser() as UserHateoas, 'getProfile')
        .then(profile => (state.profile = profile))
    })
  }, [store.user, store.user?.languages.text])

  return (
    <>
      {!store.user ? (
        <div id={'container-unauthenticated'}>
          <WelcomePage />
        </div>
      ) : (
        <div id={'container-authenticated'}>
          <HeaderComponent />
          <div id="rachinflix-body">
            <Switch>
              <Route exact path="/">
                {state.browsed && <BrowserComponent details={state.browsed} />}
                {state.file && <PlayerComponent file={state.file} />}
                {state.profile && state.profile.length > 0 && (
                  <VerticalCarouselComponent
                    title={
                      store.getUser()
                        ? store.getUserLanguage('text') === 'fre-FR'
                          ? `Reprendre le profil de ${store.getUsername()}`
                          : `Resume ${store.getUsername()}'s profile`
                        : ''
                    }
                    items={state.profile}
                  />
                )}
                {!state.carousels.horizontal ? (
                  <>
                    <HorizontalCarouselComponent
                      title={getCarouselTitle(0, store)}
                      slides={new Array(slidesPerCarousel).fill(new Array(itemsPerSlide).fill(undefined))}
                    />
                    <HorizontalCarouselComponent
                      title={getCarouselTitle(1, store)}
                      slides={new Array(slidesPerCarousel).fill(new Array(itemsPerSlide).fill(undefined))}
                    />
                  </>
                ) : (
                  state.carousels.horizontal.map((slides: Slide[], i: number) => {
                    if (state.carousels.ratio == null || state.carousels.vertical == null) return

                    const addVerticalSlide = i > 0 && i % state.carousels.ratio === 0
                    return (
                      <>
                        <HorizontalCarouselComponent
                          key={`horizontal-carousel-${i}`}
                          title={getCarouselTitle(i, store)}
                          slides={slides}
                        />
                        {addVerticalSlide && (
                          <VerticalCarouselComponent
                            key={`vertical-carousel-${i}`}
                            title={getCarouselTitle(i + 4, store)}
                            items={state.carousels.vertical[i / state.carousels.ratio - 1]}
                          />
                        )}
                      </>
                    )
                  })
                )}
              </Route>
              <Route path="/management">
                <ManagementPage />
              </Route>
            </Switch>
          </div>
        </div>
      )}
    </>
  )
})

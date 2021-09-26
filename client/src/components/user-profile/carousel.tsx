import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { CustomSkeleton } from 'components/common/skeletons'
import { useApi } from 'contexts/api'
import { FilmHateoas, SeasonHateoas, SerieHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import './carousel.scss'

const SLIDE_ANIMATION = 250
const ITEM_HEIGHT_WITH_MARGIN = 50 // in percent
const TOP_IF_2_OR_MORE = -80
const TOP_IF_ONLY_1 = 20

export const ProfileCarouselComponent: React.FC<{
  items: Array<FilmHateoas | SerieHateoas> | undefined
  setCurrent: (filmorserie: FilmHateoas | SerieHateoas, filmorseason: FilmHateoas | SeasonHateoas) => Promise<void>
}> = observer(({ items, setCurrent }) => {
  const api = useApi()

  const state = useLocalObservable(() => ({
    transition: `top 0s`,
    items: [] as Array<FilmHateoas | SeasonHateoas>,
    top: 0,
    mintop: 0,
    maxtop: 0,
    current: 0,
    sliding: false,
    loading: true,
    slide(direction: 'top' | 'bottom') {
      if (state.sliding) {
        return
      }
      state.sliding = true

      if (direction === 'top') {
        if (state.top === state.maxtop - ITEM_HEIGHT_WITH_MARGIN) {
          state.top = state.maxtop
          setTimeout(() => {
            state.transition = 'top 0s'
            state.top = state.maxtop - ITEM_HEIGHT_WITH_MARGIN * state.items.length
            setTimeout(() => {
              state.transition = `top ${SLIDE_ANIMATION}ms ease-in-out`
            }, 100)
          }, SLIDE_ANIMATION)
        } else {
          state.top = state.top + ITEM_HEIGHT_WITH_MARGIN
        }
        setTimeout(() => {
          state.sliding = false
          state.current = state.current === 0 ? state.items.length - 1 : state.current - 1
        }, SLIDE_ANIMATION + 100)
      } else {
        if (state.top === state.mintop + ITEM_HEIGHT_WITH_MARGIN) {
          state.top = state.mintop
          setTimeout(() => {
            state.transition = 'top 0s'
            state.top = state.mintop + state.items.length * ITEM_HEIGHT_WITH_MARGIN
            setTimeout(() => {
              state.transition = `top ${SLIDE_ANIMATION}ms ease-in-out`
            }, 100)
          }, SLIDE_ANIMATION)
        } else {
          state.top = state.top - ITEM_HEIGHT_WITH_MARGIN
        }
        setTimeout(() => {
          state.sliding = false
          state.current = state.current === state.items.length - 1 ? 0 : state.current + 1
        }, SLIDE_ANIMATION + 100)
      }
    }
  }))

  useEffect(() => {
    if (!items) {
      state.top = TOP_IF_2_OR_MORE
      state.transition = 'top 0s'
      state.loading = true
      return
    }
    state.top = items.length > 1 ? TOP_IF_2_OR_MORE : TOP_IF_ONLY_1
    state.transition = `top ${SLIDE_ANIMATION}ms ease-in-out`
    state.mintop = TOP_IF_2_OR_MORE - items.length * ITEM_HEIGHT_WITH_MARGIN
    state.maxtop = TOP_IF_ONLY_1 - ITEM_HEIGHT_WITH_MARGIN

    state.items = []
    state.current = 0

    async function executor() {
      if (!items) return

      for (let i = 0; i < items.length; ++i) {
        const media = items[i]

        try {
          state.items.push(await api.query<SeasonHateoas>(media, 'getCurrentSeason'))
        } catch (e) {
          state.items.push(media as FilmHateoas)
        }
      }
    }

    executor()
  }, [items, items?.length])

  useEffect(() => {
    if (state.items.length != items?.length) return

    setCurrent(items[state.current], state.items[state.current]).then(() => (state.loading = false))
  }, [state.current, items?.length, state.items.length])

  return (
    <>
      {(state.items.length > 1 || state.loading) && (
        <div
          className="slider up-slider"
          onClick={() => {
            state.slide('top')
          }}
        >
          <Icon name={IconName.CHEVRON_UP} size={IconSize.MEDIUM} />
        </div>
      )}
      <div className="profile-items" style={{ transition: state.transition, top: `${state.top}%` }}>
        <CustomSkeleton condition={state.loading} className="profile-item">
          {state.items.length > 1 && (
            <>
              <div
                className="profile-item item-cloned"
                style={{
                  backgroundImage: `url('${api.hrefSync(state.items[state.items.length - 2], 'getBackdrop')}')`
                }}
              >
                <div></div>
              </div>
              <div
                className="profile-item item-cloned"
                style={{
                  backgroundImage: `url('${api.hrefSync(state.items[state.items.length - 1], 'getBackdrop')}')`
                }}
              >
                <div></div>
              </div>
            </>
          )}
        </CustomSkeleton>
        <CustomSkeleton condition={state.loading} className="profile-item" />
        <CustomSkeleton condition={state.loading} className="profile-item">
          {state.items.map((item, index) => (
            <div
              className="profile-item"
              key={`profile-item-${index}`}
              style={{ backgroundImage: `url('${api.hrefSync(item, 'getBackdrop')}')` }}
            >
              <div></div>
            </div>
          ))}
        </CustomSkeleton>
        <CustomSkeleton condition={state.loading} className="profile-item">
          {state.items.length > 1 && (
            <>
              <div
                className="profile-item item-cloned"
                style={{ backgroundImage: `url('${api.hrefSync(state.items[0], 'getBackdrop')}')` }}
              >
                <div></div>
              </div>
              <div
                className="profile-item item-cloned"
                style={{ backgroundImage: `url('${api.hrefSync(state.items[1], 'getBackdrop')}')` }}
              >
                <div></div>
              </div>
            </>
          )}
        </CustomSkeleton>
        <CustomSkeleton condition={state.loading} className="profile-item" />
      </div>
      {(state.items.length > 1 || state.loading) && (
        <div
          className="slider down-slider"
          onClick={() => {
            state.slide('bottom')
          }}
        >
          <Icon name={IconName.CHEVRON_DOWN} size={IconSize.MEDIUM} />
        </div>
      )}
    </>
  )
})

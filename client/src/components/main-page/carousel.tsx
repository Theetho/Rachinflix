import { Item, Slide } from 'App'
import classNames from 'classnames'
import { itemsPerSlide, slidesPerCarousel } from 'config'
import { observer, useLocalObservable } from 'mobx-react'
import React, { createRef, useCallback, useEffect } from 'react'
import './carousel.scss'
import { ItemComponent } from './item'
import { SliderComponent } from './slider'

export const HorizontalCarouselComponent: React.FC<{ title: string; slides: Slide[] }> = observer(
  ({ title, slides }) => {
    const slideElement = createRef<HTMLDivElement>()

    const state = useLocalObservable(() => ({
      index: 2,
      scroll: 0
    }))

    useEffect(() => {
      slideElement.current?.addEventListener('wheel', event => {
        if (event.deltaX !== 0) {
          event.stopPropagation()
          event.preventDefault()
          event.stopImmediatePropagation()
        }
      })

      if (!slideElement.current || state.scroll != 0) return

      const children = slideElement.current.getElementsByClassName('slide')[0]

      if (!children) return

      state.scroll = children.getBoundingClientRect().width

      slideElement.current.scrollBy({ left: state.index * state.scroll })
    }, [slideElement, slideElement.current])

    const slide = useCallback(
      (direction: 'left' | 'right') => {
        if (direction === 'left') {
          if (state.index === 1) {
            slideElement.current?.scrollTo({
              left: 4 * state.scroll,
              behavior: 'auto'
            })
            state.index = 3
            slideElement.current?.scrollTo({
              left: state.index * state.scroll,
              behavior: 'smooth'
            })
          } else {
            state.index -= 1
            slideElement.current?.scrollTo({
              left: state.index * state.scroll,
              behavior: 'smooth'
            })
          }
        } else {
          if (state.index === 5) {
            slideElement.current?.scrollTo({
              left: 2 * state.scroll,
              behavior: 'auto'
            })
            state.index = 3
            slideElement.current?.scrollTo({
              left: state.index * state.scroll,
              behavior: 'smooth'
            })
          } else {
            state.index += 1
            slideElement.current?.scrollTo({
              left: state.index * state.scroll,
              behavior: 'smooth'
            })
          }
        }
      },
      [slideElement, slideElement.current]
    )

    return (
      <div className={'carousel'}>
        <div className="carousel-title">{title}</div>
        <SliderComponent
          side={'left'}
          onClick={() => {
            slide('left')
          }}
        />
        <div
          className="slides has-no-scrollbar"
          ref={slideElement}
          /*style={{ left: `${state.left}%`, transition: state.transition }}*/
        >
          <div className={classNames('slide', `has-${itemsPerSlide}-items`, 'slide-cloned')}>
            {slides[slidesPerCarousel - 2].map((item: Item | undefined, index) => (
              <ItemComponent key={index} item={item} />
            ))}
          </div>
          <div className={classNames('slide', `has-${itemsPerSlide}-items`, 'slide-cloned')}>
            {slides[slidesPerCarousel - 1].map((item: Item | undefined, index) => (
              <ItemComponent key={index} item={item} />
            ))}
          </div>
          {slides.map((items: Slide, index) => (
            <div
              key={index}
              className={classNames(
                'slide',
                `has-${items.length}-items`,

                state.index === index && 'active'
              )}
            >
              {items.map((item, i) => (
                <ItemComponent key={i} item={item} />
              ))}
            </div>
          ))}
          <div className={classNames('slide', `has-${itemsPerSlide}-items`, 'slide-cloned')}>
            {slides[0].map((item: Item | undefined, index) => (
              <ItemComponent key={index} item={item} />
            ))}
          </div>
          <div className={classNames('slide', `has-${itemsPerSlide}-items`, 'slide-cloned')}>
            {slides[1].map((item: Item | undefined, index) => (
              <ItemComponent key={index} item={item} />
            ))}
          </div>
        </div>
        <SliderComponent
          side={'right'}
          onClick={() => {
            slide('right')
          }}
        />
      </div>
    )
  }
)

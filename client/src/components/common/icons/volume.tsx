import classNames from 'classnames'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import { IconHover, IconSize } from './icon'

export const VolumeIcon: React.FC<{
  video: HTMLVideoElement | null
  size?: IconSize
  hover?: IconHover
}> = observer(({ video, size = IconSize.SMALL, hover = IconHover.STILL }) => {
  const state = useLocalObservable(() => ({
    muted: false,
    volume: 1
  }))

  useEffect(() => {
    const handler = () => {
      state.volume = video?.volume ?? 1
      state.muted = video?.muted ?? false
    }

    video?.addEventListener('volumechange', handler)
    return () => video?.removeEventListener('volumechange', handler)
  }, [video])

  return (
    <div className={classNames('icon', size, hover)}>
      <div className={'icon-volume'}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className={!state.muted && state.volume > 0.5 ? 'fade-in' : 'fade-out'}
        >
          <path
            fill="currentColor"
            fillRule="nonzero"
            stroke="none"
            d="M 10.667969 28 L 16 28 L 22.667969 34.667969 L 22.667969 13.332031 L 16 20 L 10.667969 20 Z M 25.332031 18.667969 L 25.332031 29.332031 C 27.308594 28.425781 28.667969 26.359375 28.667969 24 C 28.667969 21.679688 27.308594 19.652344 25.332031 18.667969 Z M 25.332031 15.054688 C 29.1875 16.199219 32 19.773438 32 24 C 32 28.226562 29.1875 31.800781 25.332031 32.945312 L 25.332031 35.691406 C 30.679688 34.480469 34.667969 29.707031 34.667969 24 C 34.667969 18.292969 30.679688 13.519531 25.332031 12.308594 Z M 25.332031 15.054688 "
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className={
            !state.muted && state.volume > 0 && state.volume <= 0.5 ? 'fade-in' : 'fade-out'
          }
        >
          <path
            fill="currentColor"
            fillRule="nonzero"
            stroke="none"
            d="M 10.667969 28 L 16 28 L 22.667969 34.667969 L 22.667969 13.332031 L 16 20 L 10.667969 20 Z M 25.332031 18.667969 L 25.332031 29.332031 C 27.308594 28.425781 28.667969 26.359375 28.667969 24 C 28.667969 21.679688 27.308594 19.652344 25.332031 18.667969 Z M 25.332031 18.667969 "
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className={state.muted || state.volume === 0 ? 'fade-in' : 'fade-out'}
        >
          <path
            fill="currentColor"
            fillRule="nonzero"
            stroke="none"
            d="M 10.667969 28 L 16 28 L 22.667969 34.667969 L 22.667969 13.332031 L 16 20 L 10.667969 20 Z M 25.332031 18.667969 L 25.332031 29.332031 C 27.308594 28.425781 28.667969 26.359375 28.667969 24 C 28.667969 21.679688 27.308594 19.652344 25.332031 18.667969 Z M 25.332031 15.054688 C 29.1875 16.199219 32 19.773438 32 24 C 32 28.226562 29.1875 31.800781 25.332031 32.945312 L 25.332031 35.691406 C 30.679688 34.480469 34.667969 29.707031 34.667969 24 C 34.667969 18.292969 30.679688 13.519531 25.332031 12.308594 Z M 25.332031 15.054688 "
          />
          <path
            fill="currentColor"
            fillRule="nonzero"
            stroke="none"
            d="M 12.332031 12 L 10.640625 13.691406 L 32.945312 36 L 34.640625 34.308594 Z M 12.332031 12 "
          />
        </svg>
      </div>
    </div>
  )
})

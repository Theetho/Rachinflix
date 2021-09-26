import { secondsToDuration } from 'helpers/time'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useCallback, useEffect } from 'react'

export enum DisplayMode {
  Current,
  Remaining
}

export const TimeHandler: React.FC<{
  video: HTMLVideoElement | null
}> = observer(({ video }) => {
  const state = useLocalObservable(() => ({
    current: undefined as string | undefined,
    remaining: undefined as string | undefined,
    duration: undefined as string | undefined,
    displaymode: DisplayMode.Current
  }))

  const update = useCallback(() => {
    if (!video) return

    const time = video.currentTime
    const duration = video.duration
    const remaining = Number.parseInt((duration - time).toFixed(0))

    state.duration = secondsToDuration(duration)
    state.remaining = secondsToDuration(remaining)
    state.current = secondsToDuration(time)
  }, [video])

  useEffect(() => {
    video?.addEventListener('durationchange', update)
    video?.addEventListener('timeupdate', update)
    video?.addEventListener('seeking', update)

    return () => {
      video?.addEventListener('durationchange', update)
      video?.addEventListener('timeupdate', update)
      video?.addEventListener('seeking', update)
    }
  }, [update])

  return (
    <span
      id="player-time-remaining"
      onClick={() => {
        state.displaymode =
          state.displaymode === DisplayMode.Current ? DisplayMode.Remaining : DisplayMode.Current
      }}
    >
      {state.displaymode === DisplayMode.Current && state.current && state.duration && (
        <>
          {state.current}
          <span id="player-video-duration">/ {state.duration}</span>
        </>
      )}
      {state.displaymode === DisplayMode.Remaining && state.remaining && <>-{state.remaining}</>}
    </span>
  )
})

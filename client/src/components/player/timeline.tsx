import { ClientEvent, useEventHandler } from 'components/common/events'
import { secondsToDuration } from 'helpers/time'
import { observer, useLocalObservable } from 'mobx-react'
import React, { createRef, useCallback, useEffect } from 'react'
import { TimeHandler } from './timehandler'
import './timeline.scss'
import { Tooltip } from './tooltip'

export const TimelineComponent: React.FC<{
  video: HTMLVideoElement | null
  startime?: number
}> = observer(({ video, startime }) => {
  const eventHandler = useEventHandler()
  const state = useLocalObservable(() => ({
    timeline: createRef<HTMLDivElement>(),

    buffered: 0,
    played: 0,
    tooltip: {
      text: '00:00',
      position: 0,
      width: 0,
      show: false
    },
    interval: undefined as number | undefined
  }))

  const moveTimeline = useCallback(() => {
    if (!video) return

    const buffered = video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0
    state.buffered = buffered / video.duration

    state.played = video.currentTime / video.duration
  }, [video])

  const moveTooltip = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>, seek?: boolean) => {
      if (!video) return
      if (!state.timeline.current) return

      const timelinestart = state.timeline.current.getBoundingClientRect().left
      const timelineend = state.timeline.current.getBoundingClientRect().right
      const timelinelength = timelineend - timelinestart

      const ratio = (event.clientX - timelinestart) / timelinelength
      const time = ratio < 0 ? 0 : ratio * video.duration

      state.tooltip.text = secondsToDuration(time)
      // Un peu dégueux le 75 en dur
      state.tooltip.position = event.clientX - 75
      state.tooltip.show = true
      state.tooltip.width = 0

      if (seek) {
        video.currentTime = time
      }
    },
    [moveTimeline]
  )

  useEffect(() => {
    eventHandler.addListener(ClientEvent.Tooltip, (tooltip: Tooltip) => {
      if (!tooltip) {
        state.tooltip.show = false
        return
      }
      if (!tooltip.show) {
        if (state.tooltip.text === tooltip.text) state.tooltip.show = false
        return
      }

      state.tooltip.text = tooltip.text ?? ''
      state.tooltip.position = tooltip.position ?? 0
      state.tooltip.width = tooltip.width ?? 0
      state.tooltip.show = true
    })
  }, [])

  useEffect(() => {
    window.clearInterval(state.interval)

    console.log('Setting movetimeline interval')
    state.interval = window.setInterval(() => moveTimeline, 5000)
    video?.addEventListener('seeking', moveTimeline)

    return () => {
      window.clearInterval(state.interval)
      console.log('Clearing movetimeline interval')
      state.interval = undefined
    }
  }, [moveTimeline])

  return (
    <div id={'player-timeline'}>
      <div
        id="player-total-time"
        ref={state.timeline}
        onMouseEnter={() => (state.tooltip.show = true)}
        onMouseLeave={() => (state.tooltip.show = false)}
        onMouseMoveCapture={moveTooltip}
        onClick={event => moveTooltip(event, true)}
      >
        <div id="player-current-time" style={{ width: `${state.played}%` }}>
          <div className="circle-container">
            <div className="circle-button" />
          </div>
        </div>
        <div id="player-buffered-time" style={{ width: `${state.buffered}%` }}></div>
      </div>
      {state.tooltip.show && (
        <div
          id="player-time-tooltip"
          style={{ left: `${state.tooltip.position}px`, minWidth: `${state.tooltip.width}px` }}
        >
          <div>{state.tooltip.text}</div>
        </div>
      )}
      <TimeHandler video={video} />
    </div>
  )
})

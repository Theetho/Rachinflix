import classNames from 'classnames'
import { useEventHandler } from 'components/common/events'
import { IconSize } from 'components/common/icons/icon'
import { VolumeIcon } from 'components/common/icons/volume'
import { observer, useLocalObservable } from 'mobx-react'
import React, { createRef, useCallback, useEffect } from 'react'
import { constructTooltip, deconstructTooltip, Tooltip, TooltipComponent } from './tooltip'

export const VolumeHandler: React.FC<{ video: HTMLVideoElement | null }> = observer(({ video }) => {
  const eventHandler = useEventHandler()
  const state = useLocalObservable(() => ({
    muted: false,
    hovered: false,
    volume: 1,
    timeline: createRef<HTMLDivElement>(),
    moving: false,
    listener: undefined as number | undefined,
    tooltip: undefined as Tooltip
  }))

  useEffect(() => {
    const handler = () => {
      state.volume = video?.volume ?? 1
      state.muted = video?.muted ?? false
    }

    video?.addEventListener('volumechange', handler)
    return () => video?.removeEventListener('volumechange', handler)
  }, [video])

  const move = useCallback(
    (event: MouseEvent) => {
      if (!video) return
      if (!state.timeline.current) return

      const timelinestart = state.timeline.current.getBoundingClientRect().left
      const timelineend = state.timeline.current.getBoundingClientRect().right
      const timelinelength = timelineend - timelinestart

      const ratio = (event.clientX - timelinestart) / timelinelength
      video.volume = ratio < 0 ? 0 : ratio > 1 ? 1 : ratio
    },
    [video, state.timeline]
  )

  useEffect(() => {
    if (!state.moving) {
      window.removeEventListener('mousemove', move)
      return
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', () => (state.moving = false), { once: true })

    return () => window.removeEventListener('mousemove', move)
  }, [state.moving, move])

  return (
    <div
      className={classNames('controls-volume', (state.hovered || state.moving) && 'hovered')}
      onMouseEnter={e => {
        state.tooltip = constructTooltip(e, 'Volume (m)', 0.5)
        state.hovered = true
      }}
      onMouseLeave={() => {
        state.tooltip = deconstructTooltip('Volume (m)')
        state.hovered = false
      }}
    >
      <TooltipComponent tooltip={state.tooltip} />
      <div
        onClick={() => {
          if (video) video.muted = !video.muted
        }}
      >
        <VolumeIcon video={video} size={IconSize.BIG} />
      </div>
      <div
        className={classNames('volume-handler')}
        onMouseDown={() => {
          state.moving = true
        }}
      >
        <div className={'volume-total'} ref={state.timeline}>
          <div className={'volume-current'} style={{ width: `${state.volume * 100}%` }}>
            <div className="circle-container">
              <div className="circle-button" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

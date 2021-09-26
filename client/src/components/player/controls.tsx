import { useEventHandler } from 'components/common/events'
import { BackRotatorIcon } from 'components/common/icons/back'
import { ForwardRotatorIcon } from 'components/common/icons/forward'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import './controls.scss'
import { constructTooltip, deconstructTooltip, Tooltip, TooltipComponent } from './tooltip'
import './volumehandler.scss'

export const ControlsComponent: React.FC<{ video: HTMLVideoElement | null }> = observer(({ video }) => {
  const eventHandler = useEventHandler()
  const state = useLocalObservable(() => ({
    playing: false,
    tooltip: undefined as Tooltip
  }))

  useEffect(() => {
    video?.addEventListener('play', () => {
      state.playing = true
    })
    video?.addEventListener('pause', () => {
      state.playing = false
    })
  }, [video])

  return (
    <>
      <TooltipComponent tooltip={state.tooltip} />
      <div
        className="controls-icon"
        onClick={() => {
          if (video) video.currentTime -= 10
        }}
        onMouseEnter={e => (state.tooltip = constructTooltip(e, 'Back (←)', 0.5))}
        onMouseLeave={() => (state.tooltip = deconstructTooltip('Back (←)'))}
      >
        <BackRotatorIcon size={IconSize.MEDIUM} />
      </div>
      <div
        className="controls-icon"
        onClick={() => (video?.paused ? video?.play() : video?.pause())}
        onMouseEnter={e => (state.tooltip = constructTooltip(e, state.playing ? 'Pause (k)' : 'Play (k)', 0.5))}
        onMouseLeave={() => (state.tooltip = deconstructTooltip(state.playing ? 'Pause (k)' : 'Play (k)'))}
      >
        <Icon name={IconName.PAUSE_CIRCLE} size={IconSize.MEDIUM} className={state.playing ? 'fade-in' : 'fade-out'} />
        <Icon name={IconName.PLAY_CIRCLE} size={IconSize.MEDIUM} className={state.playing ? 'fade-out' : 'fade-in'} />
      </div>
      <div
        className="controls-icon"
        onClick={() => {
          if (video) video.currentTime += 10
        }}
        onMouseEnter={e => (state.tooltip = constructTooltip(e, 'Forward (→)', 0.5))}
        onMouseLeave={() => (state.tooltip = deconstructTooltip('Forward (→)'))}
      >
        <ForwardRotatorIcon size={IconSize.MEDIUM} />
      </div>
    </>
  )
})

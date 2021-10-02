import { Oval, useLoading } from '@agney/react-loading'
import classNames from 'classnames'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { useStore } from 'components/common/store'
import { formatEpisode } from 'components/main-page/item'
import { useApi } from 'contexts/api'
import { EpisodeHateoas, FileHateoas, FilmHateoas, SeasonHateoas, SerieHateoas, SubtitleHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { createRef, useEffect } from 'react'
import { ControlsComponent } from './controls'
import './player.scss'
import { ShortcutComponent } from './shortcut'
import { TimelineComponent } from './timeline'
import { constructTooltip, deconstructTooltip, Tooltip, TooltipComponent } from './tooltip'
import { Track, TracksComponent } from './tracks'
import { VolumeHandler } from './volumeHandler'

function format(
  file: FilmHateoas | SerieHateoas | undefined,
  details: FilmHateoas | EpisodeHateoas | SerieHateoas | undefined
): string {
  if (!details || !file) return ''

  const toFormat = details as EpisodeHateoas

  return (toFormat?.number ? `${file.title} - ${formatEpisode(toFormat)} - ` : '') + details.title
}

export const PlayerComponent: React.FC<{
  file: FilmHateoas | SerieHateoas | undefined
}> = observer(({ file }) => {
  const store = useStore()
  const api = useApi()
  const eventHandler = useEventHandler()

  const state = useLocalObservable(() => ({
    visible: false,
    hovered: false,
    fullscreen: false,
    loading: true,
    progress: 0,
    interval: undefined as number | undefined,
    backdrop: undefined as string | undefined,
    starttime: undefined as number | undefined,
    player: createRef<HTMLDivElement>(),
    video: createRef<HTMLVideoElement>(),
    url: undefined as string | undefined,
    subtitles: {
      selected: undefined as number | undefined,
      values: undefined as SubtitleHateoas[] | undefined
    },
    timeouts: {
      slide: 0
    },
    tooltip: undefined as Tooltip,
    details: undefined as FilmHateoas | EpisodeHateoas | SerieHateoas | undefined,
    file: undefined as FileHateoas | undefined,
    async stop() {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
      this.url = undefined
      this.visible = false
      document.body.style.overflowY = 'auto'
      document.body.style.marginRight = '0'
      eventHandler.emit(ClientEvent.ClosePlayer)
    },
    freeze() {
      this.hovered = true
      window.clearTimeout(this.timeouts.slide)
    },
    slide() {
      if (state.loading) return
      window.clearTimeout(this.timeouts.slide)

      this.hovered = true

      this.timeouts.slide = window.setTimeout(() => {
        this.hovered = false
      }, 1500)
    },
    query() {}
  }))

  const { containerProps, indicatorEl } = useLoading({
    loading: state.loading,
    // @ts-ignore
    indicator: <Oval width="50" />
  })

  // Toggle the player and retrieve the details of the film or episode and
  // the corresponding file
  useEffect(() => {
    state.visible = file != null
    document.body.style.overflowY = file != null ? 'hidden' : 'auto'
    document.body.style.marginRight = file != null ? '1vw' : '0'

    if (!file) {
      return
    }

    state.freeze()

    window.clearInterval(state.interval)
    state.interval = window.setInterval(() => {
      const video = state.video.current
      if (video == null || video.duration === 0 || video.currentTime === 0) return
      const ratio = (video.currentTime / video.duration) * 100
      if (ratio < 5) return

      // Register the progress every 5 secs
      file._actions.registerProgress.body = {
        time: video.currentTime,
        episode: (state.details as EpisodeHateoas).number,
        season: (state.details as EpisodeHateoas).season_number,
        delete: false
      }
      if (ratio > 90) {
        file._actions.registerProgress.body.delete = true
        window.clearInterval(state.interval)
      }
      api.query(file, '@registerProgress')
    }, 5000)

    new Promise<EpisodeHateoas | FilmHateoas | SerieHateoas>((resolve, reject) => {
      api
        .query<SeasonHateoas>(file, 'getCurrentSeason')
        .then(season => {
          state.backdrop = api.hrefSync(season, 'getBackdrop')
          api.query<EpisodeHateoas>(season, 'getCurrentEpisode').then(resolve)
        })
        .catch(() => {
          state.backdrop = api.hrefSync(file, 'getBackdrop')
          resolve(file as FilmHateoas | SerieHateoas)
        })
    }).then(details => {
      state.details = details
      api.query<FileHateoas>(state.details, 'getFile').then(file => (state.file = file))
      state.starttime = (state.details as FilmHateoas | SerieHateoas).time
    })

    return () => {
      window.clearInterval(state.interval)
    }
  }, [file])

  // Reset the url when the user set the audio track
  useEffect(() => {
    eventHandler.addListener(ClientEvent.ChangeVideoUrl, (url: string) => {
      const time = state.starttime ?? state.video.current?.currentTime
      state.starttime = undefined

      state.url = url
      state.video.current?.addEventListener(
        'loadeddata',
        () => {
          if (!state.video.current) return

          state.loading = false
          state.video.current.currentTime = time ?? 0
          state.video.current.play()
        },
        { once: true }
      )
    })

    eventHandler.addListener(ClientEvent.ChangeVideoSubtitle, (selected: number) => {
      state.subtitles.selected = selected
    })

    eventHandler.addListener(ClientEvent.LoadSubtitles, (subtitles: Track<SubtitleHateoas[]>) => {
      state.subtitles = subtitles
    })

    eventHandler.addListener(ClientEvent.RemuxProgress, (progress: number) => {
      state.progress = progress ? Number.parseInt(progress.toFixed(0)) : state.progress
    })
  }, [])

  // Move the cues up a little
  useEffect(() => {
    if (!state.video.current) {
      return
    }

    const tracks = state.video.current.getElementsByTagName('track')
    for (let i = 0; i < tracks.length; ++i) {
      const track = tracks.item(i)

      track?.addEventListener('cuechange', event => {
        // @ts-ignore
        let cues = event.target?.track.cues
        if (!cues || !cues.length) return
        let index = 0
        for (index = 0; index < cues.length; ++index) {
          let cue = cues[index]
          cue.snapToLines = false
          cue.line = 85
        }
      })
    }
  }, [state.video.current, state.video.current?.textTracks.length])

  useEffect(() => {
    if (!state.video.current || state.subtitles.selected == null) return

    const tracks = state.video.current.textTracks
    if (tracks.length === 0) return

    for (let i = 0; i < tracks.length; ++i) {
      tracks[i].mode = 'disabled'
    }
    if (state.subtitles.selected >= 0) {
      tracks[state.subtitles.selected].mode = 'showing'
    }
  }, [state.subtitles.selected, state.video.current])

  useEffect(() => {
    state.fullscreen = document.fullscreenElement != null
  }, [document.fullscreenElement])

  return (
    <div id="player" ref={state.player} className={classNames(state.visible && 'visible')}>
      <div
        id="player-top"
        className={classNames(state.hovered && 'hovered')}
        onMouseEnter={state.freeze}
        onMouseLeave={state.slide}
      >
        <div id="player-back-arrow" onClick={state.stop}>
          <Icon name={IconName.ARROW_LEFT} size={IconSize.MEDIUM} />
          <div id="player-back-text">
            {store.getUserLanguage('text') === 'fre-FR' ? 'Retour à la navigation' : 'Back to navigation'}
          </div>
        </div>
      </div>
      <video
        ref={state.video}
        id="player-video"
        className={classNames(state.hovered && 'hovered')}
        src={state.url}
        poster={state.backdrop}
        onMouseMove={state.slide}
        onClick={() => {
          state.video.current?.paused ? state.video.current?.play() : state.video.current?.pause()
        }}
      >
        {state.subtitles.values?.map((subtitle, index) => (
          <track
            kind="captions"
            key={`video-subtitle-${index}`}
            label={`video-subtitle-${index}`}
            src={api.hrefSync(subtitle, 'getSubtitle')}
          />
        ))}
      </video>
      <div {...containerProps} className={'player-video-loader'}>
        {indicatorEl}
        {state.loading && <div className="player-loader-progress">{state.progress}%</div>}
      </div>

      <div
        id="player-bottom"
        className={classNames(state.hovered && 'hovered')}
        onMouseEnter={state.freeze}
        onMouseLeave={state.slide}
      >
        <TimelineComponent video={state.video.current} />
        <TooltipComponent tooltip={state.tooltip} />
        <ShortcutComponent video={state.video.current} player={state.player.current} />
        <div className="player-controls">
          <div className="player-controls-left">
            <ControlsComponent video={state.video.current} />
            <VolumeHandler video={state.video.current} />
            <div>{format(file, state.details)}</div>
          </div>
          <div className="player-controls-right">
            <TracksComponent file={state.file} />
            <div
              onMouseEnter={e => (state.tooltip = constructTooltip(e, 'Fullscreen (f)', 0.75))}
              onMouseLeave={() => (state.tooltip = deconstructTooltip('Fullscreen (f)'))}
              onClick={() => {
                state.fullscreen ? document.exitFullscreen() : state.player.current?.requestFullscreen()
              }}
            >
              <Icon name={state.fullscreen ? IconName.FULLSCREEN_OUT : IconName.FULLSCREEN_IN} size={IconSize.MEDIUM} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

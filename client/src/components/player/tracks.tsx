import classNames from 'classnames'
import { ClientEvent, useEventHandler } from 'components/common/events'
import { Icon, IconName, IconSize } from 'components/common/icons/icon'
import { useStore } from 'components/common/store'
import { useApi } from 'contexts/api'
import { AudioHateoas, FileHateoas, RemuxHateoas, SubtitleHateoas } from 'interface'
import { observer, useLocalObservable } from 'mobx-react'
import React, { useEffect } from 'react'
import { constructTooltip, deconstructTooltip, Tooltip, TooltipComponent } from './tooltip'
import './tracks.scss'

export type Track<T extends SubtitleHateoas[] | AudioHateoas[]> = {
  selected: number
  values: T
}

export const TracksComponent: React.FC<{ file?: FileHateoas }> = observer(({ file }) => {
  const api = useApi()
  const store = useStore()
  const eventHandler = useEventHandler()

  const state = useLocalObservable(() => ({
    tooltip: undefined as Tooltip,
    toggle: false,
    audios: undefined as Track<AudioHateoas[]> | undefined,
    subtitles: undefined as Track<SubtitleHateoas[]> | undefined,
    query(remux: RemuxHateoas) {
      if (!remux.done) {
        eventHandler.emit(ClientEvent.RemuxProgress, remux.progress)
        setTimeout(() => {
          api.query<RemuxHateoas>(remux, 'continue').then(state.query)
        }, 1000)
      } else {
        api.href(remux, 'continue').then(url => {
          eventHandler.emit(ClientEvent.ChangeVideoUrl, url)
        })
      }
    }
  }))

  useEffect(() => {
    if (!file) return

    api.query<SubtitleHateoas[]>(file, 'getSubtitles').then(subtitles => {
      let selected = subtitles.findIndex(({ language }) => language === store.getUserLanguage('text'))
      state.subtitles = {
        selected,
        values: subtitles
      }

      eventHandler.emit(ClientEvent.LoadSubtitles, {
        selected,
        values: subtitles
      })
    })
    api.query<AudioHateoas[]>(file, 'getAudios').then(audios => {
      let selected = audios.findIndex(({ language }) => language === store.getUserLanguage('audio'))
      if (selected === -1) {
        selected = 0
      }
      state.audios = {
        selected,
        values: audios
      }
    })
  }, [file])

  useEffect(() => {
    if (state.audios?.selected == null) return

    api.query<RemuxHateoas>(state.audios?.values[state.audios.selected], 'getAudio').then(state.query)
  }, [state.audios?.selected])

  useEffect(() => {
    if (state.subtitles?.selected == null) return

    eventHandler.emit(ClientEvent.ChangeVideoSubtitle, state.subtitles?.selected)
  }, [state.subtitles?.selected])

  return (
    <>
      <div
        onMouseEnter={e =>
          (state.tooltip = state.toggle
            ? deconstructTooltip('Audio (b) & Subtitles (v)')
            : constructTooltip(e, 'Audio (b) & Subtitles (v)'))
        }
        onMouseLeave={() => (state.tooltip = deconstructTooltip('Audio (b) & Subtitles (v)'))}
        className={classNames('player-tracks', state.toggle && 'toggled')}
      >
        <div id="player-tracks-container">
          <div>
            <div>Audios</div>
            <ul>
              {state.audios?.values.map(({ title }, index) => (
                <li
                  key={`audio-track-${index}`}
                  className={classNames(index === state.audios?.selected && 'selected')}
                  onClick={() => {
                    if (!state.audios) return

                    state.audios.selected = index
                  }}
                >
                  {title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div>Subtitles</div>
            <ul>
              <li
                className={classNames(state.subtitles?.selected === -1 && 'selected')}
                onClick={() => {
                  if (!state.subtitles) return

                  state.subtitles.selected = -1
                }}
              >
                Off
              </li>
              {state.subtitles?.values.map(({ title }, index) => (
                <li
                  key={`subtitle-track-${index}`}
                  className={classNames(index === state.subtitles?.selected && 'selected')}
                  onClick={() => {
                    if (!state.subtitles) return

                    state.subtitles.selected = index
                  }}
                >
                  {title}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <TooltipComponent tooltip={state.tooltip} />
        <div
          onClick={() => {
            state.toggle = !state.toggle
            state.tooltip = deconstructTooltip('Audio (b) & Subtitles (v)')
          }}
        >
          <Icon name={state.toggle ? IconName.TRACKS_REVERSE : IconName.TRACKS} size={IconSize.MEDIUM} />
        </div>
      </div>
    </>
  )
})

import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

export const ShortcutComponent: React.FC<{ video: HTMLVideoElement | null; player: HTMLDivElement | null }> = observer(
  ({ video, player }) => {
    useEffect(() => {
      function keylistener(event: KeyboardEvent) {
        if (player) {
          if (event.key === 'f') {
            document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen()
          }
        }

        if (!video) return

        if (event.key === ' ' || event.key === 'k') {
          video.paused ? video.play() : video.pause()
        } else if (event.key === 'm') {
          video.muted = !video.muted
        } else if (event.key === 'v') {
        } else if (event.key === 'b') {
        } else if (event.key === 'ArrowLeft') {
          video.currentTime -= 10
        } else if (event.key === 'ArrowRight') {
          video.currentTime += 10
        }
      }

      function clicklistener(event: MouseEvent) {
        document.fullscreenElement ? document.exitFullscreen() : player?.requestFullscreen()
      }

      if (!video || !player) {
        window.removeEventListener('keydown', keylistener)
        window.removeEventListener('dblclick', clicklistener)
      } else {
        window.addEventListener('keydown', keylistener)
        window.addEventListener('dblclick', clicklistener)
      }
    }, [video, player])

    return <></>
  }
)

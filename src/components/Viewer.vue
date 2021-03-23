<template>
  <div id="viewer">
    <span id="viewer-info-top" @mouseenter="stayVisible" @mouseleave="slide">
      <span id="viewer-back-arrow" @click="stop" @mouseenter="showBackLabel(true)" @mouseleave="showBackLabel(false)">
        <i class="fa fa-arrow-left fa-lg" id="viewer-back-arrow"></i>
      </span>
      <span id="viewer-back-text" @click="stop">{{ $store.state.user.languages.text == 'eng-US' ? 'Back to navigation' : 'Retour à la navigation' }}</span>
    </span>
    <Spinner v-show="isLoading" id="viewer-loading-spinner" />
    <video id="viewer-video" @click="toggle" @dblclick="handleDoubleClick" @mousemove="slide">
      <source src="" type="video/mp4" />
      <track
        v-for="subtitle in subtitles"
        kind="captions"
        :default="subtitle.default"
        :key="subtitle.index"
        :id="subtitle.id"
        :label="subtitle.label"
        :src="subtitle.src"
        @load="subtitle.callback"
      />
    </video>
    <span id="viewer-info-bottom" @mouseenter="stayVisible" @mouseleave="slide">
      <span
        id="viewer-total-time"
        @mousemove="
          hoverTime(true)
          moveSeeker($event)
        "
        @mouseleave="hoverTime(false)"
        @click="seek($event)"
      >
      </span>
      <span
        id="viewer-buffered-time"
        @mousemove="
          hoverTime(true)
          moveSeeker($event)
        "
        @mouseleave="hoverTime(false)"
        @click="seek($event)"
      ></span>
      <span
        id="viewer-current-time"
        @mousemove="
          hoverTime(true)
          moveSeeker($event)
        "
        @mouseleave="hoverTime(false)"
        @click="seek($event)"
      ></span>
      <span id="viewer-time-seeked">
        {{ this.timeSeeked }}
      </span>
      <span id="viewer-time-seeker"></span>
      <span
        ref="time_remaining"
        id="viewer-time-remaining"
        @click="current_file.time_display_format = current_file.time_display_format == 'Current' ? 'Remaining' : 'Current'"
      >
        {{ GetDisplayedTime }}
        <span id="viewer-video-duration" v-if="current_file.time_display_format == 'Current'"> {{ duration_formatted }}</span>
      </span>
      <span id="viewer-play-pause">
        <div v-show="!this.isPaused" @click="toggle">
          <svg class="pause-icon">
            <path d="M8 3H4v14h4V3zM16 3h-4v14h4V3z" fill="#ddd"></path>
          </svg>
        </div>
        <div v-show="this.isPaused" @click="toggle">
          <svg class="play-icon">
            <path d="M5 17.066V2.934a.5.5 0 01.777-.416L17 10 5.777 17.482A.5.5 0 015 17.066z" fill="#ddd"></path>
          </svg>
        </div>
      </span>
      <span id="viewer-last-10sec">
        <div ref="backward" style="position: relative; width: 100%; height: 100%" @click="MoveBackward">
          <div
            style="
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              width: 100%; height: 100%;
              border-radius: 16.875px;
            "
          >
            <svg class="rotator" viewBox="0 0 48 48" width="60%" height="60%" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                fill="#ddd"
                d="M19.4211 8.19399C18.8596 8.58264 18.8596 9.41736 19.4211 9.80601L22.1423 11.6898L24.5061 13.3262C25.1506 13.7724 26.0278 13.3078 26.0278 12.5202V10.1359C33.353 11.1258 39 17.4035 39 25C39 33.2843 32.2843 40 24 40C15.7157 40 9 33.2843 9 25C9 20.9362 10.6161 17.2498 13.2406 14.5484C13.8491 13.9221 13.9054 12.9122 13.2919 12.2907C12.7434 11.735 11.8538 11.6928 11.3005 12.2437C8.02646 15.5032 6 20.015 6 25C6 34.9411 14.0589 43 24 43C33.9411 43 42 34.9411 42 25C42 15.7444 35.0143 8.12046 26.0278 7.11295V5.4798C26.0278 4.69224 25.1506 4.22761 24.5061 4.67379L22.1423 6.31019L19.4211 8.19399Z"
              ></path>
            </svg>
          </div>
          <div
            style="
              position: absolute;
              display: flex;
              top: 0px;
              left: 0px;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              pointer-events: none;
              font-weight: 700;
            "
          >
            <span
              ref="backward_ten_label"
              style="position: absolute; opacity: 0; transform: translate3d(0px, 0px, 0px); font-size: 0.5em; transition: all 0.2s ease-in-out 0s; left: 40%"
              >-10</span
            >
            <svg class="ten-label" viewBox="0 0 48 48" width="60%" height="60%" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                fill="#ddd"
                d="M17.5531 23.4722L19.6271 22.3056V28.1944H17V29.8611H23.7751V28.1944H21.4937V20.1389H20.1802L17.5531 21.6944V23.4722Z"
              ></path>
              <path
                fill-rule="evenodd"
                fill="#ddd"
                d="M32 25C32 21.875 30.5897 20 28.3636 20C26.1374 20 24.7271 21.875 24.7271 25C24.7271 28.125 26.1374 30 28.3636 30C30.5897 30 32 28.125 32 25ZM30.1334 25C30.1334 27.0139 29.4835 28.3333 28.3636 28.3333C27.2436 28.3333 26.5937 27.0139 26.5937 25C26.5937 22.9861 27.2436 21.6667 28.3636 21.6667C29.4835 21.6667 30.1334 22.9861 30.1334 25Z"
              ></path>
            </svg>
          </div>
        </div>
      </span>
      <span id="viewer-next-10sec">
        <div ref="forward" style="position: relative; width: 100%; height: 100%" @click="MoveForward">
          <div
            style="
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              width: 100%; height: 100%;
              border-radius: 16.875px;
            "
          >
            <svg class="rotator" viewBox="0 0 48 48" width="60%" height="60%" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                fill="#ddd"
                d="M28.5789 8.19399C29.1404 8.58264 29.1404 9.41736 28.5789 9.80601L25.8577 11.6898L23.4939 13.3262C22.8494 13.7724 21.9722 13.3078 21.9722 12.5202V10.1359C14.647 11.1258 9 17.4035 9 25C9 33.2843 15.7157 40 24 40C32.2843 40 39 33.2843 39 25C39 20.9362 37.3839 17.2498 34.7594 14.5484C34.1509 13.9221 34.0946 12.9122 34.7081 12.2907C35.2566 11.735 36.1462 11.6928 36.6995 12.2437C39.9735 15.5032 42 20.015 42 25C42 34.9411 33.9411 43 24 43C14.0589 43 6 34.9411 6 25C6 15.7444 12.9857 8.12046 21.9722 7.11295V5.4798C21.9722 4.69224 22.8494 4.22761 23.4939 4.67379L25.8577 6.31019L28.5789 8.19399Z"
              ></path>
            </svg>
          </div>
          <div
            style="
              position: absolute;
              display: flex;
              top: 0px;
              left: 0px;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              pointer-events: none;
              font-weight: 700;
            "
          >
            <span
              ref="forward_ten_label"
              style="position: absolute; opacity: 0; transform: translate3d(0px, 0px, 0px); font-size: 0.5em; transition: all 0.2s ease-in-out 0s; left: 40%"
              >+10</span
            >
            <svg class="ten-label" viewBox="0 0 48 48" width="60%" height="60%" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                fill="#ddd"
                d="M17.5531 23.4722L19.6271 22.3056V28.1944H17V29.8611H23.7751V28.1944H21.4937V20.1389H20.1802L17.5531 21.6944V23.4722Z"
              ></path>
              <path
                fill-rule="evenodd"
                fill="#ddd"
                d="M32 25C32 21.875 30.5897 20 28.3636 20C26.1374 20 24.7271 21.875 24.7271 25C24.7271 28.125 26.1374 30 28.3636 30C30.5897 30 32 28.125 32 25ZM30.1334 25C30.1334 27.0139 29.4835 28.3333 28.3636 28.3333C27.2436 28.3333 26.5937 27.0139 26.5937 25C26.5937 22.9861 27.2436 21.6667 28.3636 21.6667C29.4835 21.6667 30.1334 22.9861 30.1334 25Z"
              ></path>
            </svg>
          </div>
        </div>
      </span>
      <span
        id="viewer-volume"
        @mousemove="volumeStates.isHovered = true"
        @mouseleave="volumeStates.isHovered = false"
        :style="'background-color: ' + (volumeStates.isHovered || volumeStates.isBeingChanged ? '#141414' : 'transparent')"
      >
        <svg
          height="100%"
          version="1.1"
          viewBox="0 0 36 36"
          width="100%"
          v-show="!this.isMuted && this.volume > 50"
          style="position: absolute;"
          @click="
            isMuted = !isMuted
            video.muted = !video.muted
          "
        >
          <path
            class="svg-vol-max"
            d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"
            fill="#ddd"
          ></path>
        </svg>
        <svg
          height="100%"
          version="1.1"
          viewBox="0 0 36 36"
          width="100%"
          v-show="!this.isMuted && this.volume > 0 && this.volume < 50"
          style="position: absolute;"
          @click="
            isMuted = !isMuted
            video.muted = !video.muted
          "
        >
          <path
            class="svg-vol-mid"
            d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z"
            fill="#ddd"
          ></path>
        </svg>
        <svg
          height="100%"
          version="1.1"
          viewBox="0 0 36 36"
          width="100%"
          v-show="this.isMuted || this.volume == 0"
          style="position: absolute;"
          @click="
            isMuted = !isMuted
            video.muted = !video.muted
          "
        >
          <path
            class="svg-vol-zero"
            d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"
            fill="#ddd"
          ></path>
          <path class="svg-vol-bar" d="M 9.25,9 7.98,10.27 24.71,27 l 1.27,-1.27 Z" fill="#ddd"></path>
        </svg>
        <div
          id="viewer-volume-handler"
          v-show="volumeStates.isHovered || volumeStates.isBeingChanged"
          @mouseenter="volumeStates.isHovered = true"
          @mouseleave="volumeStates.isHovered = false"
        >
          <div id="viewer-total-volume" @click="setVolume($event)" @mousedown="OnClickOnVolumeBar">
            <div id="viewer-current-volume">
              <i id="viewer-current-volume-circle" class="fa fa-circle" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </span>
      <span id="viewer-title"> {{ current_file.title }} </span>
      <span id="viewer-episodes">
        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
          <line y2="6.55086" x2="30.28169" y1="6.45697" x1="10.28169" stroke-width="1.5" stroke="#ddd" fill="none" />
          <line y2="16.9734" x2="29.56808" y1="6.55086" x1="29.56808" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#ddd" fill="none" />
          <line y2="9.17997" x2="27.55869" y1="9.08607" x1="6.28169" stroke-width="1.5" stroke="#ddd" fill="none" />
          <line y2="19.60251" x2="26.84507" y1="9.17997" x1="26.84507" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#ddd" fill="none" />
          <rect height="12.86385" width="22" y="11.90298" x="1.96245" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#ddd" fill="none" />
        </svg>
      </span>
      <span id="viewer-tracks">
        <i class="fa fa-cc fa-lg" aria-hidden="true" @click="showTracks = !showTracks"></i>
        <div id="viewer-tracks-wrapper" v-show="showTracks" @mouseleave="showTracks = false">
          <span class="viewer-tracks-section">
            <span class="viewer-tracks-title">Subtitles</span>
            <div class="viewer-subtitle" @click="setSubtitles(-1)" :class="subtitles.length == 0 || lastSubtitleIndex == -1 ? 'selected-track' : ''">
              Off
            </div>
            <div
              v-for="subtitle in subtitles"
              :class="subtitle.index == lastSubtitleIndex ? 'viewer-subtitle selected-track' : 'viewer-subtitle'"
              :key="subtitle.index"
              @click="setSubtitles(subtitle.index)"
            >
              {{ subtitle.label }}
            </div>
          </span>
          <span class="viewer-tracks-section">
            <span class="viewer-tracks-title">Audio</span>
            <div
              v-for="language in languages"
              :class="language.index == currentLanguageIndex ? 'viewer-language selected-track' : 'viewer-language'"
              :key="language.index"
              @click="setLanguage(language.index)"
            >
              {{ language.label }}
            </div>
          </span>
        </div>
      </span>
      <span id="viewer-fullscreen">
        <svg class="svg-fullscreen" height="80%" version="1.1" viewBox="0 0 36 36" width="100%" @click="toggleFullscreen" v-show="!this.is_fullscreen">
          <path fill="#ddd" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z" />
          <path fill="#ddd" d="m 26,10 0,2 4,0 0,4 2,0 L 32,10 l -6,0 0,0 z" />
          <path fill="#ddd" d="m 30,24 -4,0 0,2 L 32,26 l 0,-6 -2,0 0,4 0,0 z" />
          <path fill="#ddd" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z" />
        </svg>
        <svg class="svg-fullscreen" height="80%" version="1.1" viewBox="0 0 36 36" width="100%" @click="toggleFullscreen" v-show="this.is_fullscreen">
          <path fill="#ddd" d="m 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z"></path>
          <path fill="#ddd" d="m 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z"></path>
          <path fill="#ddd" d="m 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z"></path>
          <path fill="#ddd" d="m 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z"></path>
        </svg>
        <!-- <i class="fa fa-arrows-alt fa-lg" aria-hidden="true" @click="toggleFullscreen"></i> -->
      </span>
      <div id="viewer-next-episode" ref="next_episode" @click="OnClickOnNext">
        {{ $store.state.user.languages.text == 'eng-US' ? 'Next episode' : 'Épisode suivant' }}
      </div>
    </span>
  </div>
</template>

<script>
import Constants from '../constantsClient.js'
import Spinner from './Spinner.vue'

const SecondsToTime = (timeInSecond) => {
  const hours = Number.parseInt(timeInSecond / 3600)
  timeInSecond -= hours * 3600
  const minutes = Number.parseInt(timeInSecond / 60)
  timeInSecond -= minutes * 60
  const seconds = (timeInSecond % 60).toFixed(0)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  return `${hours ? hours + ':' : ''}${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

export default {
  name: 'Viewer',
  components: {
    Spinner,
  },
  mounted() {
    this.wrapper = document.getElementById('viewer')
    this.video = document.getElementById('viewer-video')
    this.video.addEventListener('play', () => {
      this.isPaused = false
    })
    this.video.addEventListener('pause', () => {
      this.isPaused = true
    })
    this.video.addEventListener('canplay', () => {
      const timeRemaining = SecondsToTime(this.video.duration)

      if (timeRemaining) this.current_file.time_remaining = timeRemaining
      this.isLoading = false
    })
    this.video.addEventListener(['seeking', 'waiting'], () => {
      this.isLoading = true
    })
    // Adds an interval to update the remaining time every seconds
    this.video.addEventListener('timeupdate', () => {
      // If the video if paused, no need to continue
      if (this.video.paused) return

      const duration = this.video.duration
      const currentTime = this.video.currentTime
      const bufferedTime = this.video.buffered.length ? this.video.buffered.end(this.video.buffered.length - 1) : 0

      // See the css at 'viewer-total-time' at 'width'
      const timeBarWidth = 94

      let ratio = (bufferedTime * timeBarWidth) / duration
      document.getElementById('viewer-buffered-time').style.width = `${ratio}%`

      ratio = (currentTime * timeBarWidth) / duration
      document.getElementById('viewer-current-time').style.width = `${ratio}%`

      let timeRemainingInSeconds = (duration - currentTime).toFixed(0)

      if (timeRemainingInSeconds) this.current_file.time_remaining = `${SecondsToTime(timeRemainingInSeconds)}`
      this.current_file.current_time = SecondsToTime(this.video.currentTime)
    })
    this.infos.top = document.getElementById('viewer-info-top')
    this.infos.bottom = document.getElementById('viewer-info-bottom')
  },
  data() {
    return {
      wrapper: null,
      video: null,
      infos: {},
      isPaused: false,
      isLoading: false,
      isMuted: false,
      is_fullscreen: false,
      show_button_next: false,
      subtitles: [],
      languages: [],
      lastSubtitleIndex: 0,
      currentLanguageIndex: 0,
      timeSeeked: '',
      volumeStates: {
        isHovered: false,
        isBeingChanged: false,
      },
      current_file: {
        title: 'No title',
        time_remaining: null,
        current_time: null,
        time_display_format: 'Current',
        episode: null,
        season: null,
        id: -1,
      },
      timeouts: {
        showInfos: null,
        launchVideo: null,
      },
      showTracks: false,
      progress_registerer: null,
      duration_formatted: '',
      volume: 100,
    }
  },
  methods: {
    MoveBackward() {
      const ten_label = this.$refs.backward_ten_label

      ten_label.style.transform = 'translate3d(0, -180%, 0)'
      ten_label.style.opacity = '1'
      this.$refs.backward.getElementsByClassName('ten-label')[0].style.opacity = '0'
      this.$refs.backward.getElementsByClassName('rotator')[0].style.transform = 'rotate(-45deg)'
      setTimeout(() => {
        ten_label.style.transform = 'translate3d(0, 0, 0)'
        ten_label.style.opacity = '0'
      }, 800)
      setTimeout(() => {
        this.$refs.backward.getElementsByClassName('ten-label')[0].style.opacity = '1'
      }, 850)
      setTimeout(() => {
        this.$refs.backward.getElementsByClassName('rotator')[0].style.transform = 'rotate(0)'
        this.video.currentTime -= 10
      }, 400)
    },
    MoveForward() {
      const ten_label = this.$refs.forward_ten_label

      ten_label.style.transform = 'translate3d(0, -180%, 0)'
      ten_label.style.opacity = '1'
      this.$refs.forward.getElementsByClassName('ten-label')[0].style.opacity = '0'
      this.$refs.forward.getElementsByClassName('rotator')[0].style.transform = 'rotate(+45deg)'
      setTimeout(() => {
        ten_label.style.transform = 'translate3d(0, 0, 0)'
        ten_label.style.opacity = '0'
      }, 800)
      setTimeout(() => {
        this.$refs.forward.getElementsByClassName('ten-label')[0].style.opacity = '1'
      }, 850)
      setTimeout(() => {
        this.$refs.forward.getElementsByClassName('rotator')[0].style.transform = 'rotate(0)'
        this.video.currentTime += 10
      }, 400)
    },
    OnClickOnVolumeBar() {
      this.volumeStates.isBeingChanged = true

      document.addEventListener('mousemove', this.setVolume)
      document.addEventListener('mouseup', () => {
        this.volumeStates.isBeingChanged = false
        document.removeEventListener('mousemove', this.setVolume)
      })
    },
    OnKeyUp(event) {
      if (event.key == ' ') this.toggle()
      else if (event.key == 'ArrowLeft') this.video.currentTime -= 10
      else if (event.key == 'ArrowRight') this.video.currentTime += 10
      else if (event.key == 'f') this.toggleFullscreen()
    },
    OnClickOnNext() {
      this.current_file.episode = null
      this.current_file.season = null

      this.Play({ file_id: this.current_file.id })
    },
    handleDoubleClick() {
      this.toggleFullscreen()
    },
    Play(event) {
      document.body.addEventListener('keyup', this.OnKeyUp)

      this.wrapper.style.top = '0'
      document.body.style.overflowY = 'hidden'

      this.isLoading = true
      this.show_button_next = false
      this.infos.top.style.top = '0%'
      this.infos.bottom.style.bottom = '0%'
      document.body.style.cursor = 'default'
      this.current_file.id = event.file_id
      this.current_file.season = event.season
      this.current_file.episode = event.episode

      // Fetch the name
      fetch(`/api/info/${event.file_id}/${this.$store.state.user.languages.text}${this.GetFetchQuery}`)
        .then((res) => {
          if (res.ok) return res.json()
        })
        .then((file) => {
          if (file && file.title) {
            this.current_file.title = `${file.season != null && file.episode != null ? `S${file.season}:E${file.episode} - ` : ''}${file.title}`
            this.current_file.season = this.current_file.season || file.season
            this.current_file.episode = this.current_file.episode || file.episode
          }
        })

      this.video.children[0].src = `/api/file/${event.file_id}/${this.$store.state.user.languages.audio}${this.GetFetchQuery}`
      this.video.load()

      this.video.addEventListener(
        'loadedmetadata',
        () => {
          this.duration_formatted = ` / ${SecondsToTime(this.video.duration)}`
          // Get the time where the user stopped last time
          fetch(`/api/beginning/${event.file_id}${this.GetFetchQuery}`)
            .then((string) => {
              return string.json()
            })
            .then((beginning) => {
              this.video.currentTime = Number.parseInt((beginning.time / 100) * this.video.duration)
            })
        },
        { once: true }
      )

      // Fetch the subs available for the file
      fetch(`/api/subtitles/${event.file_id}${this.GetFetchQuery}`)
        .then((res) => {
          if (res.ok) return res.json()
        })
        .then((res) => {
          this.subtitles = []
          this.lastSubtitleIndex = -1
          for (let i = 0; i < res.length; ++i) {
            const subtitle = res[i]
            this.subtitles.push({
              index: i,
              src: `/api/subtitle/${event.file_id}/${subtitle.index}${this.GetFetchQuery}`,
              id: `sub-video-${subtitle.language}`,
              label: `${subtitle.title}${subtitle.is_forced ? ' (forced)' : ''}`,
              callback: (event) => {
                // Move the subtitles up so it is better
                let cues = event.target.track.cues
                if (!cues || !cues.length) return

                let index = 0

                for (index = 0; index < cues.length; ++index) {
                  let cue = cues[index]
                  cue.snapToLines = false
                  cue.line = 90
                }
              },
            })
          }

          this.setTrackWrapperHeight(res.length + 1)
        })

      // Fetch the languages available for the file
      fetch(`/api/languages/${event.file_id}${this.GetFetchQuery}`)
        .then((res) => {
          if (res.ok) return res.json()
        })
        .then((res) => {
          this.languages = []
          for (let i = 0; i < res.length; ++i) {
            const track = res[i]
            if (track.language == this.$store.state.user.languages.audio) this.currentLanguageIndex = i
            this.languages.push({
              index: i,
              src: `/api/file/${event.file_id}/${track.language}${this.GetFetchQuery}`,
              id: `language-video-${track.language}`,
              label: track.title,
            })
          }

          this.setTrackWrapperHeight(res.length)
        })

      this.timeouts.launchVideo = setTimeout(() => {
        this.video.play()
      }, 1500)

      this.video.addEventListener(
        'play',
        () => {
          this.timeouts.showInfos = setTimeout(() => {
            if (this.volumeStates.isHovered || this.volumeStates.isBeingChanged || this.showTracks) return

            this.infos.top.style.top = '-100%'
            this.infos.bottom.style.bottom = '-100%'
            document.body.style.cursor = 'none'
          }, 1000)
        },
        { once: true }
      )

      this.RegisterProgress()
    },
    stop() {
      const is_fullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen

      if (is_fullscreen) this.toggleFullscreen()
      // Clear the video's launch if the user click before on "Back" before
      // the video was lauded
      if (this.timeouts.launchVideo) clearTimeout(this.timeouts.launchVideo)

      // Hide the viewer
      this.wrapper.style.top = '-100%'
      document.body.style.overflowY = 'inherit'

      this.video.children[0].src = null
      this.video.pause()
      this.isPaused = true
      document.getElementById('viewer-buffered-time').style.width = `0%`
      document.getElementById('viewer-current-time').style.width = `0%`
      this.current_file.time_remaining = ''

      // 0 < progress < 100 => In percent
      const progress = (100 * this.video.currentTime) / this.video.duration
      console.log('Progress before end: ', progress)

      this.UpdateItemsOnStop()

      if (Number.isNaN(progress) || progress < 5 || progress > 90) fetch(`/api/end/${this.current_file.id}${this.GetFetchQuery}`)

      document.body.removeEventListener('keyup', this.OnKeyUp)
    },
    toggle() {
      if (this.timeouts.showInfos) clearTimeout(this.timeouts.showInfos)

      if (this.video.paused) {
        this.video.play()
        this.infos.top.style.top = '-100%'
        this.infos.bottom.style.bottom = '-100%'
        document.body.style.cursor = 'none'
      } else {
        this.video.pause()
        this.infos.top.style.top = '0%'
        this.infos.bottom.style.bottom = '0%'
        document.body.style.cursor = 'default'
      }
    },
    toggleFullscreen() {
      const is_fullscreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen

      if (!is_fullscreen) {
        if (this.video.parentNode.requestFullscreen) {
          this.video.parentNode.requestFullscreen()
        } else if (this.video.parentNode.mozRequestFullScreen) {
          this.video.parentNode.mozRequestFullScreen()
        } else if (this.video.parentNode.webkitRequestFullscreen) {
          this.video.parentNode.webkitRequestFullscreen()
        } else if (this.video.parentNode.msRequestFullscreen) {
          this.video.parentNode.msRequestFullscreen()
        }
        this.is_fullscreen = true
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozExitFullScreen) {
          document.mozExitFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        this.is_fullscreen = false
      }
    },
    slide() {
      this.infos.top.style.top = '0%'
      this.infos.bottom.style.bottom = '0%'
      this.$refs.next_episode.style.display = this.show_button_next ? 'flex' : 'none'
      document.body.style.cursor = 'default'

      if (this.timeouts.showInfos) clearTimeout(this.timeouts.showInfos)

      if (this.video.paused) return

      this.timeouts.showInfos = setTimeout(() => {
        this.infos.top.style.top = '-100%'
        this.infos.bottom.style.bottom = '-100%'
        document.body.style.cursor = 'none'
        this.$refs.next_episode.style.display = 'none'
      }, 1500)
    },
    stayVisible() {
      clearTimeout(this.timeouts.showInfos)
    },
    showBackLabel(toggle) {
      const backLabel = document.getElementById('viewer-back-text')

      backLabel.style.color = toggle ? 'white' : 'transparent'
    },
    moveSeeker(event) {
      // From https://stackoverflow.com/questions/5227909/how-to-get-an-elements-padding-value-using-javascript
      const getStyle = (oElm, strCssRule) => {
        var strValue = ''
        if (document.defaultView && document.defaultView.getComputedStyle) {
          strValue = document.defaultView.getComputedStyle(oElm, '').getPropertyValue(strCssRule)
        } else if (oElm.currentStyle) {
          strCssRule = strCssRule.replace(/-(\w)/g, function(strMatch, p1) {
            return p1.toUpperCase()
          })
          strValue = oElm.currentStyle[strCssRule]
        }
        return strValue
      }

      let seeker_position_in_pixel =
        Math.min(
          Math.max(event.clientX, document.getElementById('viewer-total-time').getBoundingClientRect().x),
          document.getElementById('viewer-total-time').getBoundingClientRect().right
        ) - Number.parseFloat(getStyle(this.infos.bottom, 'padding-left'))

      let seeker_position_in_percent = Math.max(0, event.clientX - document.getElementById('viewer-total-time').getBoundingClientRect().x)

      // console.log(timeSeekerPos)

      document.getElementById('viewer-time-seeker').style.left = `${seeker_position_in_pixel}px`

      const timeSeeked = document.getElementById('viewer-time-seeked')
      const timeSeekedWidth = timeSeeked.clientWidth

      timeSeeked.style.left = `${seeker_position_in_pixel - timeSeekedWidth / 2}px`

      // Same code as below in 'seek'
      const totalTimeSize = document.getElementById('viewer-total-time').clientWidth

      const requestedTime = (seeker_position_in_percent / totalTimeSize) * this.video.duration

      this.timeSeeked = SecondsToTime(requestedTime)
    },
    hoverTime(isHovered) {
      const totalTime = document.getElementById('viewer-total-time')
      const currentTime = document.getElementById('viewer-current-time')
      const bufferedTime = document.getElementById('viewer-buffered-time')
      const timeSeeker = document.getElementById('viewer-time-seeker')
      const timeSeeked = document.getElementById('viewer-time-seeked')
      totalTime.style.transform = isHovered ? 'scaleY(2.5)' : 'scale(1)'
      currentTime.style.transform = isHovered ? 'scaleY(2.5)' : 'scale(1)'
      bufferedTime.style.transform = isHovered ? 'scaleY(2.5)' : 'scale(1)'
      timeSeeker.style.display = isHovered ? 'flex' : 'none'
      timeSeeked.style.display = isHovered ? 'flex' : 'none'
    },
    seek() {
      const totalTimeSize = document.getElementById('viewer-total-time').clientWidth
      const initialOffset = document.getElementById('viewer-total-time').getBoundingClientRect().x

      const timeSeekerPos = document.getElementById('viewer-time-seeker').getBoundingClientRect().x - initialOffset
      const requestedTime = (timeSeekerPos / totalTimeSize) * this.video.duration

      this.video.currentTime = requestedTime
    },
    setVolume(event) {
      event.preventDefault()
      event.stopImmediatePropagation()

      if (!event.buttons && event.type != 'click') return

      const totalVolume = document.getElementById('viewer-total-volume')
      const currentVolume = document.getElementById('viewer-current-volume')
      const top = totalVolume.getBoundingClientRect().y
      const bottom = top + totalVolume.getBoundingClientRect().height

      const ratio = Math.max(0, Math.min(1, (bottom - event.y) / (bottom - top)))
      this.volume = ratio * 100
      currentVolume.style.height = `${this.volume}%`
      currentVolume.style.bottom = `${(ratio - 1) * 100}%`
      this.video.volume = ratio
    },
    setSubtitles(subIndex) {
      if (this.lastSubtitleIndex >= 0) this.video.textTracks[this.lastSubtitleIndex].mode = 'disabled'

      if (subIndex >= 0) this.video.textTracks[subIndex].mode = 'showing'

      this.lastSubtitleIndex = subIndex
    },
    setLanguage(languageIndex) {
      if (languageIndex < 0) return

      const currentTime = this.video.currentTime

      this.video.children[0].src = this.languages[languageIndex].src
      this.isLoading = true
      this.video.load()
      this.video.play()
      this.video.currentTime = currentTime
      this.currentLanguageIndex = languageIndex
    },
    setTrackWrapperHeight(trackCount) {
      // Heights in VH
      const titleHeight = 3
      const tracksLabelHeight = 6.5

      const finalHeight = titleHeight + trackCount * tracksLabelHeight
      const wrapper = document.getElementById('viewer-tracks-wrapper')
      const currentWrapperHeight = Number.parseFloat(wrapper.style.height)

      if (Number.isNaN(currentWrapperHeight) || currentWrapperHeight < finalHeight) wrapper.style.height = `${finalHeight}vh`
    },
    RegisterProgress() {
      if (this.progress_registerer != null) clearInterval(this.progress_registerer)

      // Signal the server every 10 secondes about the progress of the file that is being watched.
      this.progress_registerer = setInterval(() => {
        if (this.video.paused) return

        const progress = (100 * this.video.currentTime) / this.video.duration

        // We don't register if user watched less than 5%
        if (Number.isNaN(progress) || progress < 5) return

        fetch(`/api/progress/${this.current_file.id}/${progress}${this.GetFetchQuery}`)

        // We stop registering this file when 90% of it has been watched.
        if (progress >= 90) {
          clearInterval(this.progress_registerer)
          this.progress_registerer = null
          if (this.current_file.season != null && this.current_file.episode != null) this.show_button_next = true
        }
      }, 10000)
    },
    UpdateItemsOnStop() {
      const carousel_id = Number.parseInt(this.current_file.id / (Constants.slidesPerCarousel * Constants.itemsPerSlide))

      const carousel = this.$root.$children[0].$refs[`carousel-${carousel_id}`][0]
      // Udapte the infos of the item for the serie
      const item = carousel.$refs[`item-${this.current_file.id}`][0]
      item.GetInfos()

      // Update the continue watching area
      this.$root.$children[0].$refs.continue_watching.OnCreate()
    },
  },
  computed: {
    GetFetchQuery() {
      return `${
        this.current_file.season != null && this.current_file.episode != null ? `?season=${this.current_file.season}&episode=${this.current_file.episode}` : ''
      }`
    },
    GetDisplayedTime() {
      return this.current_file != null && this.video != null
        ? this.current_file.time_display_format == 'Current'
          ? `${this.current_file.current_time}`
          : `-${this.current_file.time_remaining}`
        : '00:00'
    },
  },
}
</script>

<style>
::cue {
  background-color: transparent;
}
#viewer::-webkit-media-controls {
  display: none !important;
  cursor: none;
}
#viewer {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: black;

  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  font-size: 18pt;

  display: grid;
  grid-template-columns: 10% 15% 21% 8% 21% 15% 10%;
  grid-template-rows: 10% 78% 2% 10%;

  top: -100%;

  transition: 0.5s all;
  z-index: 999;

  user-select: none;
}
#viewer-info-top {
  position: relative;
  grid-row: 1;
  grid-column: 1 / 8;
  z-index: 1;

  display: grid;
  grid-template-rows: 25% 65% 10%;
  grid-template-columns: 5% 25% 70%;

  padding: 0% 1%;
  font-weight: normal;

  transition: 0.5s all;
  top: -100%;
}

#viewer-back-arrow {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  user-select: none;

  transition: 0.25s all;
  z-index: 1;
}
#viewer-back-arrow:hover > i {
  transform: scale(1.2);
}
#viewer-back-text {
  grid-column: 2;
  grid-row: 2;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  color: transparent;
  transition: 0.25s all;
}
#viewer-video {
  position: absolute;

  grid-row: 1 / 8;
  grid-column: 1 / 8;

  height: 100%;
  width: 100%;
  margin: auto;

  transition: filter 2s;

  z-index: 0;
}
#viewer-loading-spinner {
  position: absolute;
  top: 35%;
  grid-row: 2;
  grid-column: 4 / 5;

  z-index: 2;
}
#viewer-info-bottom {
  position: relative;
  grid-row: 3 / 5;
  grid-column: 1 / 8;
  z-index: 1;

  background: linear-gradient(0deg, black, transparent);

  font-weight: normal;
  padding: 0% 1%;

  transition: 0.5s all;

  display: grid;
  grid-template-columns: 5% 5% 5% 5% 65% 5% 5% 5%;
  grid-template-rows: 25% 65% 10%;
}
#viewer-info-bottom > span:not(#viewer-time-seeker):not(#viewer-time-seeked):not(#viewer-time-remaining) {
  display: flex;
  justify-content: center;
  align-items: center;
}
#viewer-info-bottom > span > i {
  cursor: pointer;
  transition: 0.25s all;
}
#viewer-info-bottom > span:not(#viewer-tracks) > i:hover {
  transform: scale(1.05);
}
#viewer-total-time,
#viewer-current-time,
#viewer-buffered-time {
  height: 25%;
  grid-row: 1;
  grid-column: 1 / 7;
  margin-left: 2%;
  width: 94%;
  align-self: flex-end;
}
#viewer-total-time {
  background-color: #444444;
}
#viewer-current-time {
  background-color: red;
  width: 0%;
}
#viewer-buffered-time {
  background-color: #888888;
  width: 0%;
}
#viewer-time-seeker {
  pointer-events: none;
  display: none;

  position: relative;
  height: 25%;
  grid-row: 1;
  grid-column: 1 / 7;
  background-color: white;
  align-self: flex-end;
  width: 3px;

  left: -100%;

  transform: scaleY(2.5);
}
#viewer-time-seeked {
  position: absolute;
  top: -20%;

  pointer-events: none;
  display: none;

  grid-column: 1 / 7;
  align-self: flex-end;
  width: fit-content;
  left: -100%;
}
#viewer-time-remaining {
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  bottom: -30%;
  grid-row: 1;
  grid-column: 6 / 9;
  cursor: pointer;
  z-index: -1;
  left: 20%;
  margin-left: 10%;
}
#viewer-video-duration {
  color: #888;
  margin-left: 5%;
}
#viewer-play-pause {
  grid-column: 1;
  grid-row: 2;
  position: relative;
  top: 5%;
}
#viewer-play-pause > div {
  width: 100%;
  height: 100%;
  position: absolute;
}
.play-icon,
.pause-icon {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transform: scale(0.9);
}
.play-icon:hover > path,
.pause-icon:hover > path {
  transform: translate(20%, 10%) scale(2.7);
}
.play-icon > path,
.pause-icon > path {
  transform: translate(25%, 15%) scale(2.5);
  transition: 0.25s all;
}

#viewer-last-10sec {
  grid-column: 2;
  grid-row: 2;
}
#viewer-next-10sec {
  grid-column: 3;
  grid-row: 2;
}
#viewer-last-10sec svg,
#viewer-next-10sec svg {
  transition: all 0.25s;
}
#viewer-last-10sec svg.ten-label,
#viewer-next-10sec svg.ten-label {
  transform: translate3d(0, 0, 0);
  transition: transform 0.2s ease-out 0s;
}
#viewer-last-10sec svg.rotator,
#viewer-next-10sec svg.rotator {
  transform: translate3d(0, 0, 0);
  transition: transform 0.2s ease-out 0s;
}

#viewer-last-10sec:hover div,
#viewer-next-10sec:hover div {
  transform: scale(1.05);
  transition: 0.25s;
}
#viewer-volume {
  grid-column: 4;
  grid-row: 2;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
}
#viewer-volume > svg {
  transition: 0.25s;
  z-index: 2;
}
#viewer-volume:hover > svg {
  transform: scale(1.05);
}
#viewer-volume-handler {
  position: relative;
  height: 250%;
  width: 100%;
  background-color: #141414;
  border-radius: 15px 15px 0 0;
  bottom: 150%;
}
#viewer-total-volume {
  position: absolute;
  background-color: #444444;
  height: 70%;
  width: 10%;
  top: 15%;
  left: 45%;
}
#viewer-current-volume {
  background-color: red;
  position: relative;
  width: 100%;
  height: 100%;
  bottom: 0%;
}
#viewer-current-volume-circle {
  position: relative;
  transform: scale(0.7);
  left: -80%;
  top: -1vh;
}

#viewer-total-volume:hover,
#viewer-current-volume:hover {
  cursor: pointer;
}
#viewer-title {
  grid-column: 5;
  grid-row: 2;

  justify-self: flex-start;
  padding: 0% 2%;
}
#viewer-episodes {
  grid-column: 6;
  grid-row: 2;
  cursor: pointer;
  transition: 0.25s all;
}
#viewer-episodes > svg {
  transform: scale(1.5);
  transition: 0.25s all;
}
#viewer-episodes:hover > svg {
  transform: scale(1.6);
}
#viewer-tracks {
  grid-column: 7;
  grid-row: 2;
  position: relative;
}
#viewer-tracks > i {
  transform: scale(1.2);
  transition: 0.25s all;
}
#viewer-tracks:hover > i {
  transform: scale(1.3);
}
.selected-track:before {
  position: absolute;
  left: -25%;
  content: '\2714';
}
.selected-track {
  color: white;
}
#viewer-tracks-wrapper {
  position: absolute;
  bottom: 90%;
  width: 15vw;
  min-height: 15vh;
  font-size: 15pt;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #444444;
  border-radius: 5px;
}

.viewer-tracks-section {
  color: #888;
  min-width: 7.5vw;
  height: 85%;
  margin-top: 15%;
  font-size: 20pt;
}
.viewer-tracks-title {
  position: absolute;
  top: 1vh;
  margin-left: 1.5vw;
}
.viewer-language,
.viewer-subtitle {
  position: relative;
  height: 1.5vh;
  padding: 3vh 0 1vh 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15pt;
  margin-left: 30%;
}
.viewer-language > i,
.viewer-subtitle > i {
  color: transparent;
  margin: 0 10% 0 5%;
}
.viewer-language:hover,
.viewer-subtitle:hover {
  color: white;
}
#viewer-fullscreen {
  grid-column: 8;
  grid-row: 2;
}
.svg-fullscreen {
  cursor: pointer;
  transition: 0.25s all;
}
.svg-fullscreen:hover {
  transform: scale(1.05);
}

#viewer-next-episode {
  position: absolute;
  width: 12%;
  height: 50%;
  border: 1px grey solid;
  color: grey;
  background-color: #141414;
  display: none;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  right: 10%;
  top: -50%;
  cursor: pointer;
}
#viewer-next-episode:hover {
  color: black;
  background-color: white;
}
</style>

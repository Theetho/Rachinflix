<template>
  <div id="file-browser" class="no-filter">
    <div id="trailer-area">
      <div class="close-icon" @click="OnClose"></div>
      <div id="file-browser-play-now" @click="TriggerPlaying">
        <i class="fa fa-play" aria-hidden="true"></i>
        {{ GetPlayLabel }}
      </div>
      <video
        ref="trailer"
        @click="
          (e) => {
            e.target.paused ? e.target.play() : e.target.pause()
          }
        "
      ></video>
    </div>
    <div class="file-browser-first-row">
      <span id="file-browser-title">{{ this.title }}</span>
      <span id="file-browser-date">{{ this.date }}</span>
      <span id="file-browser-genres">{{ this.GetGenres }}</span>
    </div>
    <div id="file-browser-overview">{{ this.season ? this.season.overview || this.overview : this.overview }}</div>
    <div id="file-browser-episodes" v-if="this.season">
      <div id="file-browser-episodes-header">
        <h3>{{ this.$store.state.user.languages.text == 'fre-FR' ? 'Épisodes' : 'Episodes' }}</h3>
        <SeasonSelector :seasons_available="seasons_available" />
      </div>
      <EpisodeInfos
        v-for="(episode, index) of season.episodes"
        :key="index"
        :id_serie="id"
        :title="episode.title"
        :overview="episode.overview"
        :number="episode.number"
        :season_number="episode.season_number"
        :date="episode.date"
        :average_vote="episode.average_vote"
        :vote_count="episode.vote_count"
        :duration="episode.duration"
      />
    </div>
  </div>
</template>
<script>
import EpisodeInfos from './EpisodeInfos.vue'
import SeasonSelector from './SeasonSelector.vue'

export default {
  name: 'FileBrowser',
  components: { EpisodeInfos, SeasonSelector },
  data() {
    return {
      id: null,
      type: null,
      title: null,
      date: null,
      genres: null,
      overview: null,
      current_season_number: null,
      seasons_available: [],
      season: null,
    }
  },
  watch: {
    current_season_number(new_value) {
      setTimeout(() => {
        const selector = this.$children.find((e) => {
          return e.$el.className.includes('season-selector')
        })

        if (!selector) return

        selector.SetCurrentSeason(new_value)
      }, 250)
    },
  },
  methods: {
    Browse(event, { id }) {
      this.id = id
      this.Fetch().type(id)

      Object.assign(this.$el.style, {
        top: `${event.view.pageYOffset}px`,
      })
      document.getElementsByTagName('body')[0].classList.add('apply-filter')
      document.getElementsByTagName('body')[0].style.overflowY = 'hidden'

      this.LoadTrailer(id)
    },
    OnMouseWheel(event) {
      event.preventDefault()
      event.stopImmediatePropagation()
    },
    OnClose() {
      Object.assign(this.$el.style, {
        top: '-100vh',
      })
      document.getElementsByTagName('body')[0].classList.remove('apply-filter')
      document.getElementsByTagName('body')[0].style.overflowY = null

      if (!this.$refs.trailer.paused) this.$refs.trailer.pause()

      this.id = null
      this.title = null
      this.date = null
      this.genres = null
      this.overview = null
      this.current_season_number = null
      this.seasons_available = []
      this.season = null

      this.ResetTrailer()
    },
    LoadTrailer(id) {
      fetch(`/api/trailer/${id}/${this.$store.state.user.languages.audio}${this.current_season_number ? `?season=${this.current_season_number}` : ''}`)
        .then((res) => {
          if (res.ok) return res.blob()
        })
        .then((blob) => {
          // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
          if ('srcObject' in this.$refs.trailer) {
            try {
              this.$refs.trailer.srcObject = blob
            } catch (err) {
              if (err.name != 'TypeError') {
                console.log(err.message)
              }
              // Even if they do, they may only support MediaStream
              this.$refs.trailer.src = URL.createObjectURL(blob)
            }
          } else {
            // Avoid using this in new browsers, as it is going away.
            this.$refs.trailer.src = URL.createObjectURL(blob)
          }

          this.$refs.trailer.play()
        })
        .catch(() => {
          this.ResetTrailer()
        })
    },
    ResetTrailer() {
      if ('srcObject' in this.$refs.trailer) {
        try {
          this.$refs.trailer.srcObject = null
        } catch (err) {
          if (err.name != 'TypeError') {
            console.log(err.message)
          }
          // Even if they do, they may only support MediaStream
          this.$refs.trailer.src = null
        }
      }
      this.$refs.trailer.src = null
    },
    Fetch() {
      const type = (id) => {
        fetch(`/api/type/${id}`).then(async (res) => {
          const { type } = await res.json()
          this.type = type
          this.Fetch()[type](id)
        })
      }
      const film = (id) => {
        fetch(`/api/browse/film/${id}/${this.$store.state.user.languages.text}`).then(async (res) => {
          const infos = await res.json()

          this.title = infos.title
          this.date = infos.date
          this.genres = infos.genres
          this.overview = infos.overview
        })
      }
      const serie = (id) => {
        fetch(
          `/api/browse/serie/${id}/${this.$store.state.user.languages.text}${this.current_season_number ? `?season=${this.current_season_number}` : ''}`
        ).then(async (res) => {
          const infos = await res.json()

          this.title = infos.title
          this.date = infos.date
          this.genres = infos.genres
          this.overview = infos.overview
          this.seasons_available = infos.seasons_available.sort((e1, e2) => {
            return e1.number < e2.number ? -1 : 1
          })
          this.season = infos.season

          if (this.current_season_number != this.season.number) {
            this.current_season_number = this.season.number
          }
        })
      }
      return { type, film, serie }
    },
    ChangeToSeason(number) {
      if (this.type != 'serie') return

      this.current_season_number = number
      this.Fetch()[this.type](this.id)
      this.LoadTrailer(this.id)
    },
    TriggerPlaying() {
      const id = this.id
      this.OnClose()
      this.$root.$children[0].$refs.viewer.Play({ file_id: id })
    },
  },
  computed: {
    GetGenres() {
      return this.genres
        ? this.genres.reduce((acc, cur) => {
            return `${acc}, ${cur}`
          })
        : ''
    },
    GetPlayLabel() {
      if (this.season) return this.$store.state.user.languages.text == 'fre-FR' ? 'Épisode suivant' : 'Next episode'

      return this.$store.state.user.languages.text == 'fre-FR' ? 'Lecture' : 'Play now'
    },
  },
}
</script>
<style>
#file-browser::-webkit-scrollbar,
#file-browser::-webkit-scrollbar-thumb {
  display: none;
}

#file-browser {
  position: absolute;
  background-color: #141414;
  width: 60vw;
  height: 80vh;
  z-index: 998;
  left: 20vw;
  top: -100vh;

  font-size: 16pt;
  overflow-y: scroll;
}
#trailer-area {
  position: relative;
  width: 100%;
}
#file-browser-play-now {
  width: 20%;
  height: 10%;
  position: absolute;
  background-color: #fff;
  left: 10%;
  bottom: 10%;
  color: black;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  font-weight: bold;
  cursor: pointer;
  z-index: 1;
  border-radius: 5px;
}
#file-browser-play-now > i {
  transform: rotate(0deg);
  transition: 0.25s all;
}
#file-browser-play-now:hover > i {
  transform: rotate(90deg) translateX(10%);
}
/* from https://stackoverflow.com/questions/10019797/pure-css-close-button */
.close-icon {
  position: absolute;
  right: 1%;
  margin-top: 15px;
  margin-right: 15px;
  cursor: pointer;
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.75);
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.75);
  font-size: 30px;
  font-weight: lighter;
  line-height: 0px;
  width: 2rem;
  padding: 0.02rem;
  height: 2rem;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.close-icon:before {
  content: '×';
}
#trailer-area > video {
  width: 100%;
  top: 0;
  z-index: -1;
}
.file-browser-first-row {
  margin: 2vh 0;
  width: 100%;
  position: relative;
}
#file-browser-title {
  margin-left: 5%;
}
#file-browser-date {
  color: #555;
  margin-left: 5%;
  font-style: italic;
}
#file-browser-genres {
  font-size: 12pt;
  position: absolute;
  right: 5%;
}
#file-browser-genres::before {
  content: 'Genres: ';
  color: #555;
}
#file-browser-overview {
  width: 80%;
  position: relative;
  left: 5%;
  margin-bottom: 4vh;
  font-size: 12pt;
}
#file-browser-episodes {
  position: relative;
  margin-bottom: 5%;
  width: 90%;
  left: 5%;
}
#file-browser-episodes-header {
  border-bottom: 1px solid #555;
  display: flex;
  justify-content: space-between;
  position: relative;
}
.apply-filter {
  background-color: black;
}
.apply-filter > div > div > *:not(.no-filter) *:not(.carousel-hidder) {
  opacity: 0.75;
}
.apply-filter > div > div > *:not(.no-filter) {
  background-color: black;
}
</style>

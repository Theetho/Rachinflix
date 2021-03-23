<template>
  <div class="episode-infos" @mouseenter="is_hovered = true" @mouseleave="is_hovered = false">
    <div class="episode-number">{{ this.number }}</div>
    <img class="episode-thumbnail" :src="GetThumbnailSource" />
    <div class="episode-hover" v-show="is_hovered" @click="TriggerPlaying">
      <i class="fa fa-play-circle fa-2x"></i>
    </div>
    <div class="episode-title">{{ this.title }}</div>
    <div class="episode-duration">{{ this.GetFormatedDuration }} min</div>
    <div class="episode-overview">{{ this.overview }}</div>
  </div>
</template>
<script>
export default {
  name: 'EpisodeInfos',
  props: ['id_serie', 'title', 'overview', 'number', 'season_number', 'date', 'average_vote', 'vote_count', 'duration'],
  data() {
    return {
      is_hovered: false,
    }
  },
  methods: {
    TriggerPlaying() {
      this.$parent.OnClose()
      this.$root.$children[0].$refs.viewer.Play({ file_id: this.id_serie, season: this.season_number, episode: this.number })
    },
  },
  computed: {
    GetThumbnailSource() {
      return this.id_serie ? `/api/thumbnail/${this.id_serie}/${this.season_number}/${this.number}` : null
    },
    GetFormatedDuration() {
      const [, minutes, hours] = this.duration.split(':').reverse()

      return Number.isNaN(Number.parseInt(hours)) ? Number.parseInt(minutes) : Number.parseInt(hours) * 60 + Number.parseInt(minutes)
    },
  },
}
</script>
<style>
.episode-infos {
  position: relative;
  width: 100%;
  padding: 2% 0;
  border-bottom: 1px solid #555;
  display: grid;
  grid-template-rows: 3.5vh 10vh;
  grid-template-columns: 0.5fr 2fr 0.2fr 6fr;
  font-size: 12pt;
  color: #aaa;
  cursor: default;
  overflow: hidden;
}
.episode-number {
  grid-row: 1 / 3;
  grid-column: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.episode-thumbnail {
  height: 100%;
  width: 100%;
  grid-row: 1 / 3;
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.episode-hover {
  height: 100%;
  width: 100%;
  grid-row: 1 / 3;
  grid-column: 2;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.episode-title {
  grid-row: 1;
  grid-column: 4;
  position: relative;
  color: white;
  font-weight: bold;
  font-style: italic;
}
.episode-duration {
  position: absolute;
  grid-row: 1;
  grid-column: 4;
  right: 5%;
}
.episode-overview {
  grid-row: 2;
  grid-column: 4;
}
</style>

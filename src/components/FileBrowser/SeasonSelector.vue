<template>
  <div class="season-selector">
    <div class="season-selector-content">
      <button ref="button" class="is-not-toggle" @click="Toggle">
        {{ GetSeason(current_season) }}
      </button>
      <ul class="season-list" v-show="is_toggle">
        <li class="season-item" v-for="(season, index) in seasons_available" :key="index" @click="ChangeToSeason(season.number)">
          <div class="season-option">
            {{ GetSeason(season.number) }}<span class="season-option-episodes">{{ GetEpisodeCount(season.episode_count) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
// This component is inspired from the season selector on netflix.
export default {
  name: 'SeasonSelector',
  props: ['seasons_available'],
  data() {
    return {
      is_toggle: false,
      current_season: null,
    }
  },
  methods: {
    Toggle() {
      this.is_toggle = !this.is_toggle
      this.$refs.button.setAttribute('class', this.is_toggle ? 'is-toggle' : 'is-not-toggle')
    },
    ChangeToSeason(number) {
      this.Toggle()
      if (number == this.current_season) return
      this.SetCurrentSeason(number)
      this.$parent.ChangeToSeason(number)
    },
    SetCurrentSeason(number) {
      this.current_season = number
    },
    GetSeason(number) {
      return `${this.$store.state.user.languages.text == 'fre-FR' ? 'Saison' : 'Season'} ${number}`
    },
    GetEpisodeCount(episode_count) {
      return `( ${episode_count} ${this.$store.state.user.languages.text == 'fre-FR' ? 'épisodes' : 'episodes'})`
    },
  },
}
</script>
<style>
.season-selector {
  font-size: 12px;
  font-weight: 600;
  box-sizing: inherit;
  line-height: 1.2;
  cursor: default;
}
.season-selector-content {
  position: relative;
  z-index: 1;
}
.is-not-toggle,
.is-toggle {
  display: flex;
  -moz-box-align: center;
  align-items: center;
  min-width: 4em;
  position: relative;
  font-size: 16pt;
  background-color: rgb(36, 36, 36);
  padding: 0.5em 1em;
  color: white;
  cursor: pointer;
  border: 0.1em solid rgb(77, 77, 77);
  border-radius: 0.2em;
  outline: none;
}
.is-not-toggle::after {
  content: '';
  border-left: 0.3em solid transparent;
  border-right: 0.3em solid transparent;
  border-top: 0.4em solid rgb(255, 255, 255);
  transition: transform 0.2s linear 0s;
  margin-left: 2em;
  transform: none;
}
.is-toggle::after {
  content: '';
  border-left: 0.3em solid transparent;
  border-right: 0.3em solid transparent;
  border-top: 0.4em solid rgb(255, 255, 255);
  transition: transform 0.2s linear 0s;
  margin-left: 2em;
  transform: rotate(180deg);
}
.season-list {
  min-width: 4em;
  position: absolute;
  right: 0px;
  cursor: pointer;
  color: white;
  list-style-type: none;
  border: 0.1em solid rgb(77, 77, 77);
  margin-top: 0.1em;
  font-size: 14pt;
  z-index: 1;
  background-color: rgb(36, 36, 36);
  white-space: nowrap;
  column-gap: 1.8em;
  max-height: max(10em, 96.7667px - 2rem);
  overflow: auto;
  padding: 1rem 0px;
}
.season-item {
  min-width: 4em;
  padding: 0.5em 0.8em;
  display: block;
  break-inside: avoid;
}
.season-item:hover {
  background-color: rgb(66, 66, 66);
}

.season-option {
  display: flex;
  align-items: center;
}
.season-option-episodes {
  margin-left: 10px;
  font-size: 12pt;
  font-weight: 400;
}
</style>

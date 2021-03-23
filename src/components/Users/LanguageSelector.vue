<template>
  <div class="user-language-selector">
    {{ label }}
    <div class="user-language-selector-content">
      <button ref="button" class="is-not-toggle" @click="Toggle">
        {{ this.current }}
      </button>
      <ul class="user-language-list" v-show="is_toggle">
        <li class="user-language-item" v-for="(language, index) in GetLanguages" :key="index" @click="ChangeLanguage(language)">
          <div class="user-language-option">
            {{ language }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LanguageSelector',
  props: ['label'],
  data() {
    return {
      current: null,
      languages: { English: 'eng-US', Francais: 'fre-FR' },
      is_toggle: false,
    }
  },
  mounted() {
    this.current = Object.keys(this.languages)[0]
  },
  methods: {
    Toggle() {
      this.is_toggle = !this.is_toggle
      this.$refs.button.setAttribute('class', this.is_toggle ? 'is-toggle' : 'is-not-toggle')
    },
    ChangeLanguage(language) {
      this.current = language
      this.Toggle()
    },
    Reset() {
      this.current = Object.keys(this.languages)[0]
      this.is_toggle = false
    },
  },
  computed: {
    GetSelectedLanguage() {
      return this.languages[this.current]
    },
    GetLanguages() {
      return Object.keys(this.languages)
    },
  },
}
</script>
<style>
.user-language-selector {
  position: relative;
  left: 5%;
  box-sizing: inherit;
  line-height: 1.2;
  cursor: default;
}
.user-language-selector-content {
  margin-top: 1vh;
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
.user-language-list {
  min-width: 4em;
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
.user-language-item {
  min-width: 4em;
  padding: 0.5em 0.8em;
  display: block;
  break-inside: avoid;
}
.user-language-item:hover {
  background-color: rgb(66, 66, 66);
}

.user-language-option {
  display: flex;
  align-items: center;
}
</style>

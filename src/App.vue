<template>
  <div id="app">
    <div id="container-not-authenticated" v-if="!$store.state.user">
      <WelcomePage ref="welcome_page" />
    </div>
    <div id="container-authenticated" v-else>
      <Header ref="header" />
      <SearchMenu ref="search-menu" />
      <Viewer ref="viewer" />
      <FileBrowser ref="file_browser" />
      <ContinueWatching ref="continue_watching" />
      <CarouselHidder :left="'-2.5%'" />
      <Carousel v-for="i in this.carouselCount" :ref="'carousel-' + (i - 1)" :key="i - 1" :id="i - 1" :title="GetCarouselTitle(i)" />
      <CarouselHidder :left="'92.5%'" />
    </div>
  </div>
</template>

<script>
import WelcomePage from './components/Users/WelcomePage.vue'
import Carousel from './components/Carousel.vue'
import Viewer from './components/Viewer.vue'
import Constants from './constantsClient'
import Header from './components/Header/Header.vue'
import ContinueWatching from './components/ContinueWatching.vue'
import SearchMenu from './components/SearchMenu.vue'
import CarouselHidder from './components/CarouselHidder.vue'
import FileBrowser from './components/FileBrowser/FileBrowser.vue'

export default {
  name: 'App',
  created() {
    fetch('/api/count')
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        this.itemCount = res.count
        this.carouselCount = Number.parseInt(res.count / (Constants.itemsPerSlide * Constants.slidesPerCarousel) + 1)
      })
  },
  components: {
    Carousel,
    Viewer,
    Header,
    ContinueWatching,
    SearchMenu,
    CarouselHidder,
    FileBrowser,
    WelcomePage,
  },
  data() {
    return {
      carouselCount: 0,
      itemCount: 0,
      itemBeingPreviewed: null,
    }
  },
  methods: {
    GetCarouselTitle(index) {
      const language = this.$store.state.user.languages.text

      if (language == 'fre-FR') {
        var titles = [
          'Les incontournables de Rachinflix',
          "Thriller à l'intrigue envoûtante",
          'Les plus gros succès sur Rachinflix',
          'Tendances actuelles',
          'Les programmes les plus chauds de ta région',
          'Programmes historiques avec des personnages et des combats violents',
          'Programmes originaux Rachinflix',
          'Notre sélection pour vous',
          'Programmes à regarder sans modérations',
          'Series primées aux Emmys Awards à regarder sans modération',
          'Nouveautés',
        ]
      } else if (language == 'eng-US') {
        titles = [
          "Rachinflix' must-haves",
          'Thriller with bewitching plot',
          'The biggest hits on Rachinflix',
          'Current Trends',
          'The hottest programs in your area',
          'Historical programs with characters and violent fights',
          'Original Rachinflix programs',
          'Our selection for you',
          'Programs to watch without moderation',
          'Emmy Award-winning series to watch without moderation',
          'News',
        ]
      }

      index %= titles.length
      return titles[index]
    },
  },
}
</script>

<style>
@font-face {
  font-family: operatormono;
  src: url(../fonts/OperatorMono-Medium.otf);
}
@font-face {
  font-family: operatormonolight;
  src: url(../fonts/OperatorMono-Light.otf);
}
@font-face {
  font-family: operatormonobold;
  src: url(../fonts/OperatorMono-Bold.otf);
}
@font-face {
  font-family: operatormonoitalic;
  src: url(../fonts/OperatorMono-MediumItalic.otf);
}
@font-face {
  font-family: operatormonolightitalic;
  src: url(../fonts/OperatorMono-LightItalic.otf);
}
@font-face {
  font-family: operatormonobolditalic;
  src: url(../fonts/OperatorMono-BoldItalic.otf);
}
::-webkit-scrollbar {
  background-color: black;
  width: 1vw;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(40, 40, 40);
  width: 1vw;
}
video {
  outline: none;
}
img {
  outline: none;
}
a {
  color: inherit;
  text-decoration: none;
  outline: 0;
}
a:visited {
  color: inherit;
}
/* From netflix */
select {
  outline: 0;
  height: 2.5rem;
  margin-left: 2%;
  padding-left: 10px;
  line-height: 2.5rem;
  letter-spacing: 1px;
  font-size: 1.25rem;
  font-weight: bold;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.9);
  display: inline-block;
  color: #fff;
  background-color: #000;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0;
  position: relative;
  padding-right: 10px;
}
body {
  overflow-x: hidden;
  margin: 0;
  color: #ddd;
  background-color: #141414;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  scroll-behavior: smooth;
}
#app {
  position: relative;
  width: 99vw;
}
.blur-background > div > div > div > *:not(.unblur) {
  filter: grayscale(100%);
}
#container-authenticated {
  margin-top: 5%;
}

@media screen and (min-width: 1250px) {
  body {
    font-size: 12pt;
  }
}
@media screen and (max-width: 1249px) {
  body {
    font-size: 8pt;
  }
}
</style>

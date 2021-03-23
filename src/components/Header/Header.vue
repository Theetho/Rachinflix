<template>
  <header id="header">
    <div id="header-left">
      <span id="header-search-menu">
        <i class="fa fa-bars fa-2x" aria-hidden="true" @click="ToggleSearchMenu()"></i>
      </span>
      <img
        id="header-logo"
        src="https://fontmeme.com/permalink/201018/a77c5e25e3d37d60b42a875cdcfbcf99.png"
        alt="Rachinflix"
        border="0"
        @click="OnClickOnLogo"
      />
    </div>
    <div id="header-right">
      <UserMenu></UserMenu>
    </div>
  </header>
</template>

<script>
import UserMenu from './UserMenu'

export default {
  name: 'Header',
  data() {
    return {
      logo: null,
    }
  },
  components: {
    UserMenu,
  },
  methods: {
    OnClickOnLogo() {
      window.location = '/'
    },
    OnChange(event) {
      const language = event.srcElement.selectedOptions[0].value
      this.$store.commit('SetLanguage', language)
    },
    ToggleSearchMenu() {
      const left = Number.parseInt(this.$root.$children[0].$refs['search-menu'].$el.style.left)

      this.$root.$children[0].$refs['search-menu'].$el.style.left = left == 0 ? '-21vw' : '0%'
    },
  },
}
</script>

<style>
#header {
  position: fixed;
  width: 100vw;
  height: 5vh;
  top: 0;
  background-color: black;
  z-index: 998;
  font-size: 1em;
  font-family: operatormono;
  user-select: none;
  display: flex;
  justify-content: space-between;
}

#header-left,
#header-right {
  position: relative;
  width: 33%;
  height: 100%;
  display: flex;
  align-items: center;
}
#header-search-menu {
  position: relative;
  cursor: pointer;
}
#header-search-menu:hover {
  color: #bbb;
}
#header-logo {
  position: relative;
  margin: 0 15% 0 20%;
  height: 70%;
  cursor: pointer;
}

@media screen and (min-width: 1250px) {
  #header-search-menu {
    left: 1%;
  }
}
@media screen and (max-width: 1249px) {
  #header-search-menu {
    left: 10%;
    transform: scale(1.5);
  }
}
</style>

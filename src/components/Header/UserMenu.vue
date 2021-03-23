<template>
  <div id="user-menu">
    <div id="user-menu-avatar" @click="!is_toggle ? ShowMenu($event) : HideMenu()">
      <img :src="'/api/sprite/' + $store.state.user.sprite" alt="" />
    </div>
    <div ref="content" id="user-menu-content">
      <div ref="section" id="user-section">
        <img :src="'/api/sprite/' + $store.state.user.sprite" alt="" /><span>{{ $store.state.user.name }} </span>
      </div>
      <div ref="languages" id="user-languages">
        <div
          id="user-audio"
          class="user-menu-section"
          @click="
            language_index = 'audio'
            ShowLanguages()
          "
        >
          Audio<span> {{ $store.state.user.languages.audio == 'eng-US' ? 'English' : 'Français' }} </span> <i class="fas fa-chevron-right"></i>
        </div>
        <div
          id="user-text"
          class="user-menu-section"
          @click="
            language_index = 'text'
            ShowLanguages()
          "
        >
          {{ $store.state.user.languages.text == 'eng-US' ? 'Text' : 'Texte' }}
          <span> {{ $store.state.user.languages.text == 'eng-US' ? 'English' : 'Français' }}</span> <i class="fas fa-chevron-right"></i>
        </div>
      </div>
      <div ref="logout" id="user-logout" class="user-menu-section" @click="LogOut">
        <svg version="1.1" viewBox="0 0 32 32">
          <path
            d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
            fill="#ddd"
          ></path>
        </svg>
        {{ $store.state.user.languages.text == 'eng-US' ? 'Sign out' : 'Deconnexion' }}
      </div>
    </div>
    <div ref="languages_content" id="user-languages-content">
      <span @click="HideLanguages"><i class="fas fa-chevron-left"></i> {{ $store.state.user.languages.text == 'eng-US' ? 'Back' : 'Retour' }}</span>
      <div
        :class="$store.state.user.languages[language_index] == 'eng-US' ? 'selected-language user-menu-section' : 'user-menu-section'"
        @click="SelectLanguage($event, 'eng-US')"
      >
        English
      </div>
      <div
        :class="$store.state.user.languages[language_index] == 'fre-FR' ? 'selected-language user-menu-section' : 'user-menu-section'"
        @click="SelectLanguage($event, 'fre-FR')"
      >
        Français
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UserMenu',
  data() {
    return {
      is_toggle: false,
      language_index: 'audio',
      initial_text_language: null,
    }
  },
  methods: {
    ShowMenu(event) {
      event.stopImmediatePropagation()

      this.is_toggle = true
      this.$refs.content.style.right = '2%'

      this.initial_text_language = this.$store.state.user.languages.text

      window.addEventListener('click', this.OnClickOnBody)
    },
    HideMenu() {
      this.is_toggle = false
      this.$refs.content.style.right = '-132%'
      window.removeEventListener('click', this.OnClickOnBody)
    },
    LogOut() {
      fetch('/api/logout')
      this.$store.commit('SetCurrentUser', null)
    },
    ShowLanguages() {
      event.stopImmediatePropagation()

      this.$refs.languages_content.style.right = '2%'
      window.addEventListener('click', this.OnClickOnBody)
    },
    HideLanguages() {
      this.$refs.languages_content.style.right = '-132%'
    },
    OnClickOnBody(e) {
      if (e.path.includes(this.$el)) return
      this.HideLanguages()
      this.HideMenu()
    },
    SelectLanguage(event, language) {
      const selected = document.getElementsByClassName('selected-language')[0]

      if (selected == event.target) return

      if (selected) selected.classList.remove('selected-language')
      event.target.classList.add('selected-language')

      this.$store.commit('SetUserLanguage', { type: this.language_index, language })
    },
  },
}
</script>
<style>
#user-menu {
  --avatar-bg-color: #aaa;
  --border-color: #aaa;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}
#user-menu-avatar {
  position: relative;
  right: 10%;
  background-color: var(--avatar-bg-color);
  overflow: hidden;
  cursor: pointer;
}
#user-menu-avatar > img {
  position: relative;
}
#user-menu-content,
#user-languages-content {
  position: absolute;
  right: 2%;
  background-color: #282828;
  right: -132%;
  transition: right 0.25s;
  padding: 5%;
  color: #ddd;
}
#user-languages-content > span {
  position: absolute;
  display: flex;
  align-items: center;
  left: 3%;
  top: 2%;
  cursor: pointer;
}
#user-languages-content > span > i {
  margin-right: 25%;
}
.selected-language:before {
  position: absolute;
  left: 3%;
  content: '\2714';
}
#user-languages-content > span:hover,
.selected-language {
  color: white;
}
#user-section {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding: 0% 3% 5% 3%;
  height: 30%;
}
#user-section > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#user-section > img {
  display: flex;
  align-items: center;
  background-color: var(--avatar-bg-color);
  padding: 2%;
  border-radius: 60px;
  margin-right: 5%;
  height: 70%;
}
.user-menu-section {
  height: 20%;
  width: 100%;
  margin-top: 2%;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 2%;
}
.user-menu-section:hover {
  background-color: #444;
  color: white;
}
#user-languages {
  border-bottom: 1px solid var(--border-color);
}
#user-languages > div > span {
  position: absolute;
  right: 15%;
  color: #777;
}
#user-languages > div > i {
  position: absolute;
  right: 9%;
  margin-top: 0.5%;
  color: #777;
}
#user-text {
  margin-bottom: 2%;
}
#user-logout > svg {
  width: 12%;
  padding-left: 0;
  align-self: flex-start;
}
@media screen and (min-width: 1250px) {
  #user-menu-avatar {
    border-radius: 30px;
    width: 32px;
    height: 32px;
  }
  #user-menu-avatar > img {
    width: 65px;
    height: 65px;
    left: -50%;
  }
  #user-menu-content,
  #user-languages-content {
    top: 150%;
    width: 40%;
    height: 300%;
  }
  #user-logout > svg {
    margin-top: 2%;
  }
}
@media screen and (max-width: 1249px) {
  #user-menu-avatar {
    border-radius: 25px;
    width: 24px;
    height: 24px;
  }
  #user-menu-avatar > img {
    width: 32px;
    height: 32px;
    left: -10%;
  }
  #user-menu-content,
  #user-languages-content {
    top: 110%;
    width: 120%;
    height: 400%;
  }
  #user-logout > svg {
    margin-top: 2.5%;
  }
  #user-languages {
    height: 30%;
  }
  #user-languages > div {
    height: 50%;
  }
}
</style>

<template>
  <div id="user-modifier">
    <div id="user-modifier-title">{{ GetMainTitle }}</div>
    <div id="user-infos">
      <div id="user-avatar">
        <img :src="'/api/sprite/' + this.sprite" />
        <div class="avatar-edit-icon">
          <svg class="svg-icon svg-icon-edit" focusable="true" @click="edit_avatar = !edit_avatar">
            <path
              fill="currentColor"
              d="M16 0c8.833 0 16 7.167 16 16 0 8.8-7.167 16-16 16s-16-7.2-16-16c0-8.833 7.167-16 16-16zM16 1.7c-7.9 0-14.3 6.4-14.3 14.3s6.4 14.3 14.3 14.3 14.3-6.4 14.3-14.3-6.4-14.3-14.3-14.3zM22.333 12.9l0.3-0.267 0.867-0.867c0.467-0.5 0.4-0.767 0-1.167l-1.767-1.767c-0.467-0.467-0.767-0.4-1.167 0l-0.867 0.867-0.267 0.3zM18.3 11.1l-8.6 8.6-0.833 3.767 3.767-0.833 0.967-1 7.633-7.6z"
            ></path>
          </svg>
          <div id="avatar-list" v-show="edit_avatar">
            <img
              v-for="index in avatar_count + 1"
              :key="index - 1"
              :src="'/api/sprite/' + (index - 1)"
              @click="
                sprite = index - 1
                edit_avatar = false
              "
            />
          </div>
        </div>
      </div>
      <input ref="input_text" type="text" name="username" id="user-modifier-name" v-model="name" :placeholder="GetPlaceholder" />
      <LanguageSelector ref="text_selecter" id="first-selecter" :label="$store.state.language == 'eng-US' ? 'Language :' : 'Langue :'" />
      <LanguageSelector ref="audio_selecter" id="second-selecter" :label="$store.state.language == 'eng-US' ? 'Audio language :' : 'Langue audio :'" />
    </div>
    <div id="user-modifier-buttons">
      <button id="save" @click="OnSave">{{ $store.state.language == 'eng-US' ? 'Save' : 'Enregistrer' }}</button>
      <button id="cancel" @click="OnCancel">{{ $store.state.language == 'eng-US' ? 'Cancel' : 'Annuler' }}</button>
      <button id="delete" @click="OnDelete" v-if="!this.new">{{ $store.state.language == 'eng-US' ? 'Delete this user' : 'Supprimer le profil' }}</button>
    </div>
  </div>
</template>
<script>
import LanguageSelector from './LanguageSelector'

export default {
  name: 'UserModifier',
  props: ['new'],
  components: {
    LanguageSelector,
  },
  mounted() {
    fetch('/api/sprite/count').then(async (res) => {
      this.avatar_count = (await res.json()).count

      this.sprite = Number.parseInt(Math.random() * this.avatar_count)
    })
  },
  methods: {
    async OnSave() {
      if (this.name == '') {
        this.$refs.input_text.placeholder = this.$store.state.language == 'eng-US' ? 'This user needs a name' : 'Il faut un nom pour ce profil'
        this.$refs.input_text.classList.add('name-incorrect')

        this.$refs.input_text.addEventListener(
          'click',
          () => {
            this.$refs.input_text.placeholder = this.GetPlaceholder
            this.$refs.input_text.classList.remove('name-incorrect')
          },
          { once: true }
        )

        return
      }

      const user = {
        name: this.name,
        languages: {
          text: this.$refs.text_selecter.GetSelectedLanguage,
          audio: this.$refs.audio_selecter.GetSelectedLanguage,
        },
        sprite: this.sprite,
      }

      fetch('/api/user/create', {
        method: 'POST',
        body: JSON.stringify({
          user,
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      await this.OnCreationCompleted()
    },
    async OnCancel() {
      await this.OnCreationCompleted()
    },
    async OnDelete() {
      await this.OnCreationCompleted()
    },
    async OnCreationCompleted() {
      await this.$parent.CreationCompleted()

      this.name = ''
      this.sprite = Number.parseInt(Math.random() * this.avatar_count)

      for (let ref of ['text_selecter', 'audio_selecter']) {
        this.$refs[ref].Reset()
      }
    },
  },
  data() {
    return {
      user: {},
      name: '',
      edit_avatar: false,
      avatar_count: 0,
      sprite: 0,
    }
  },
  computed: {
    GetMainTitle() {
      return this.$store.state.language == 'eng-US' ? 'New profil' : 'Nouveau profil'
    },
    GetPlaceholder() {
      return this.$store.state.language == 'eng-US' ? 'Your name' : 'Ton nom'
    },
  },
}
</script>
<style>
#user-modifier {
  position: relative;
  top: 3%;
  width: 100%;
  height: 90%;
  color: white;
  display: grid;
  grid-template-columns: 25% 50% 25%;
  grid-template-rows: 10% 45% 15%;
  justify-content: center;
  font-size: 18pt;
}
#user-modifier button:not(.is-not-toggle):not(.is-toggle) {
  margin: 2vh 0 0 1vw;
  height: 5vh;
  border: 1px grey solid;
  font-weight: 600;
  color: grey;
  background-color: #141414;
  font-size: 18pt;
  outline: none;
  cursor: pointer;
}
#user-modifier button:hover:not(.is-not-toggle):not(.is-toggle) {
  color: black;
  background-color: white;
}
#user-modifier #save {
  margin: 2vh 0 0 0vw;
}
#user-modifier-title,
#user-infos {
  border-bottom: 1px #999 solid;
}
#user-modifier-title,
#user-infos,
#user-modifier-buttons {
  grid-column: 2;
}
#user-modifier-title {
  font-size: 48pt;
  grid-row: 1;
}
#user-infos {
  grid-row: 2;
  display: grid;
  grid-template-columns: 20% 80%;
  grid-template-rows: 15% 15% 30% 40%;
}
#user-avatar {
  position: relative;
  grid-column: 1;
  grid-row: 1 / 4;
  display: flex;
  justify-content: center;
  align-items: center;
}
#user-avatar > img {
  height: 130px;
  width: 130px;
}
.svg-icon-edit {
  position: absolute;
  width: 2rem;
  height: 2rem;
  max-width: 45px;
  max-height: 45px;
  background-color: #141414;
  left: 15%;
  bottom: 15%;
  cursor: pointer;
}
#avatar-list {
  background-color: #141414;
  border-top: 1px solid grey;
  position: absolute;
  width: 962px;
  height: 30vw;
  overflow-y: scroll;
  left: 0;
  top: 100%;
}
#avatar-list > img {
  height: 130px;
  width: 130px;
  margin: 2px;
}
#avatar-list > img:hover {
  border: 2px white solid;
  margin: 0;
  cursor: pointer;
}
#user-modifier-name {
  position: relative;
  grid-column: 2;
  grid-row: 1;
  width: 60%;
  height: 55%;
  left: 5%;
  top: 2vh;
  outline: none;
  border: 1px solid white;
  font-size: 18pt;
  color: white;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}
.name-incorrect::placeholder {
  color: white;
  font-weight: bold;
  font-style: normal;
}
.name-incorrect {
  background-color: rgb(231, 69, 69);
}
input::placeholder {
  font-style: italic;
}
input {
  background-color: #141414;
}
#first-selecter,
#second-selecter {
  grid-column: 2;
  grid-row: 3;
  width: 25%;
}

#second-selecter {
  position: relative;
  left: 45%;
}
#user-modifier-buttons {
  grid-row: 3;
  display: grid;
  grid-template-columns: 2fr 2fr 3fr;
}
</style>

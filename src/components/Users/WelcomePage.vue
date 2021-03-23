<template>
  <div id="welcome-page">
    <div id="main-page" v-show="!create_new_user">
      <img
        ref="animated_logo"
        id="welcome-page-logo-animated"
        src="https://fontmeme.com/permalink/201018/a77c5e25e3d37d60b42a875cdcfbcf99.png"
        alt="Rachinflix"
        border="0"
      />
      <div ref="user_slots" id="user-slots">
        <UserSlot v-for="(user, index) in users" :key="index" :ref="'user_' + index" :click="[LogIn, user]" />
        <UserSlot
          ref="add_new"
          v-if="users.length < $store.state.max_user_count"
          id="add-new-user"
          :click="[
            () => {
              create_new_user = true
            },
          ]"
        />
      </div>
    </div>
    <div id="modify-user-page" v-show="create_new_user">
      <img id="welcome-page-logo" src="https://fontmeme.com/permalink/201018/a77c5e25e3d37d60b42a875cdcfbcf99.png" alt="Rachinflix" border="0" />
      <UserModifier :new="true" />
    </div>
  </div>
</template>
<script>
import UserSlot from './UserSlot'
import UserModifier from './UserModifier'

export default {
  name: 'WelcomePage',
  components: {
    UserSlot,
    UserModifier,
  },
  mounted() {
    fetch('/api/users').then(async (res) => {
      this.users = await res.json()
    })

    this.$refs.animated_logo.style.animation = 'logoappear 1.2s'
    for (let ref in this.$refs) {
      const user = this.$refs[ref][0] || this.$refs[ref]

      if (!user.$el) continue

      user.$el.style.borderColor = 'transparent'
    }
    this.item_width = this.$refs.user_slots.offsetWidth * 0.15

    // Wait the "rachinflix" animation to be complete
    setTimeout(() => {
      this.SetUsers()
      this.$refs.animated_logo.style.animation = null
    }, 1200)
  },
  data() {
    return {
      users: [],
      user_width: 0,
      create_new_user: false,
      item_width: 0,
    }
  },
  methods: {
    async CreationCompleted() {
      const res = await fetch('/api/users')
      this.users = await res.json()

      return new Promise((resolve) => {
        setTimeout(() => {
          this.SetUsers()
          this.create_new_user = false
          resolve()
        }, 500)
      })
    },
    SetUsers() {
      for (let index in this.users) {
        const user = this.users[index]
        const ref = this.$refs[`user_${index}`][0]

        ref.Set({ name: user.name, sprite: user.sprite, width: this.item_width })
        ref.$el.style.borderColor = null
      }
      const add_new = this.$refs.add_new

      if (!add_new) return

      add_new.Set({ name: this.GetNewUsernameLabel, sprite: null, width: this.item_width })
      add_new.$el.style.borderColor = null
      add_new.is_not_profil = true
    },
    LogIn(user) {
      this.$store.commit('SetCurrentUser', user)
    },
  },
  computed: {
    GetNewUsernameLabel() {
      return this.$store.state.language == 'eng-US' ? 'New user' : 'Nouveau profil'
    },
  },
}
</script>
<style>
#welcome-page {
  height: 100vh;
}
#main-page,
#modify-user-page {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
@keyframes logoappear {
  0% {
    transform: scale(0);
  }
  80% {
    transform: scale(3);
  }
  100% {
    transform: scale(2) translateY(-200%);
  }
}
#welcome-page-logo-animated {
  position: absolute;
  /* animation: logoappear 1.2s; */
  transform: scale(2) translateY(-200%);
}
#welcome-page-logo {
  position: absolute;
  height: 4vh;
  top: 1vh;
  left: 5vw;
}
#user-slots {
  width: 70%;
  height: 40%;
  margin: 5%;
  display: flex;
}
#add-new-user {
  border: 2px dotted white;
}
#add-new-user {
  border: 2px solid white;
}
</style>

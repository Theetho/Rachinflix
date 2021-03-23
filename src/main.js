import Vue from 'vue'
import Vuex from 'vuex'
import VueCookies from 'vue-cookies'
import App from './App.vue'

window.scrollX = 0
window.scrollY = 0

Vue.config.productionTip = true
Vue.use(Vuex)
Vue.use(VueCookies)

const store = new Vuex.Store({
  state: {
    user: Vue.$cookies.get('current_user') || null,
    max_user_count: 5,
  },
  mutations: {
    SetCurrentUser(state, user) {
      if (user) {
        fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({
            userid: user.id,
          }),
          headers: { 'Content-Type': 'application/json' },
        })
      }

      state.user = user
      user ? Vue.$cookies.set('current_user', user, 3600) : Vue.$cookies.remove('current_user')
    },
    SetUserLanguage(state, { type, language }) {
      state.user.languages[type] = language

      fetch(`/api/user/${state.user.id}`, {
        method: 'POST',
        body: JSON.stringify({
          user: state.user,
        }),
        headers: { 'Content-Type': 'application/json' },
      }).then(async (res) => {
        const user = await res.json()
        this.commit('SetCurrentUser', user)
        window.location = '/'
      })
    },
  },
})

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app')

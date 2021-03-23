<template>
  <div id="continue-watching" v-if="this.item_ids.length > 0">
    <div id="continue-watching-title">{{ getTitle }}</div>
    <div id="continue-watching-carousel" @mousewheel="OnMouseWheel($event)" @click="OnClickOnItem($event)">
      <Item
        v-for="(id, index) in this.item_ids"
        :key="index"
        :id="'item-' + index + '-profil'"
        :class="index === 0 ? 'selected' : index === 1 ? 'next' : index === 2 ? 'next-second' : 'hide-right'"
        :unique_id="id"
        :id_suffix="'-profil'"
        :allow_mouse_input="false"
        :ref="'item_' + id"
      />
    </div>
    <div id="continue-items-selecter">
      <div
        v-for="i in this.item_ids.length"
        class="item-selecter"
        :key="i"
        :id="'item-selecter-' + (i - 1)"
        :style="i - 1 == 0 ? 'color: #888' : ''"
        @click="OnClickOnSelecter(i - 1)"
      >
        <i class="fa fa-circle" aria-hidden="true"></i>
      </div>
    </div>
  </div>
</template>
<script>
import Item from './Item.vue'

export default {
  name: 'ContinueWatching',
  components: {
    Item,
  },
  created() {
    this.OnCreate()
  },
  data() {
    return {
      item_ids: [],
      is_moving: false,
      time_outs: {
        reset_moving: null,
        playing: null,
      },
    }
  },
  methods: {
    OnCreate() {
      this.item_ids = []
      this.is_moving = false
      this.time_outs = {
        reset_moving: null,
        playing: null,
      }

      fetch('api/profil/continue')
        .then((res) => {
          return res.json()
        })
        .then((data) => {
          this.item_ids = data
        })
    },
    OnClickOnItem(event) {
      if (event.target.localName == 'img' || event.target.localName == 'video') var item = event.target.parentElement
      else {
        console.log('From ContinueWatching::OnClickOnItem(): Click on an element (' + event.target.id + ') that has not been taken into account')
        return
      }

      const classList = item.classList

      if (classList.contains('selected')) {
        let current_selected_id = Number.parseInt(item.id.replace(/item-([0-9]+)-profil/, '$1'))
        this.$children[current_selected_id].TriggerPlaying(true)
      } else if (classList.contains('next')) {
        this.MoveToSelectedItem('next')
      } else if (classList.contains('next-second')) {
        this.MoveToSelectedItem('next')
        if (this.time_outs.reset_moving) clearTimeout(this.time_outs.reset_moving)
        this.is_moving = false
        this.MoveToSelectedItem('next')
      } else if (classList.contains('prev')) {
        this.MoveToSelectedItem('prev')
      } else if (classList.contains('prev-second')) {
        this.MoveToSelectedItem('prev')
        if (this.time_outs.reset_moving) clearTimeout(this.time_outs.reset_moving)
        this.is_moving = false
        this.MoveToSelectedItem('prev')
      }
    },
    OnMouseWheel(event) {
      event.preventDefault()

      this.MoveToSelectedItem(event.deltaY < 0 ? 'prev' : 'next')
    },
    OnClickOnSelecter(index) {
      let selected = this.$el.getElementsByClassName('selected')[0]
      let current_selected_id = Number.parseInt(selected.id.replace(/item-([0-9]+)-profil/, '$1'))

      for (let i = 0; i < Math.abs(index - current_selected_id); ++i) {
        if (index < current_selected_id) this.MoveToSelectedItem('prev')
        else if (index > current_selected_id) this.MoveToSelectedItem('next')

        if (this.time_outs.reset_moving) clearTimeout(this.time_outs.reset_moving)
        this.is_moving = false
      }
    },
    MoveToSelectedItem(element) {
      if (this.is_moving) return

      const selected = document.getElementsByClassName('selected')[0]
      const next = document.getElementsByClassName('next')[0]
      const prev = document.getElementsByClassName('prev')[0]
      const next_second = document.getElementsByClassName('next-second')[0]
      const prev_second = document.getElementsByClassName('prev-second')[0]

      if (element == 'next') {
        if (!next) return

        this.is_moving = true

        let current_selected_id = Number.parseInt(selected.id.replace(/item-([0-9]+)-profil/, '$1'))
        document.getElementById(`item-selecter-${current_selected_id}`).style.color = ''
        if (this.time_outs.playing) clearTimeout(this.time_outs.playing)

        next.className = next.className.replace('next', 'selected')
        current_selected_id = Number.parseInt(next.id.replace(/item-([0-9]+)-profil/, '$1'))
        document.getElementById(`item-selecter-${current_selected_id}`).style.color = '#888'
        if (selected) selected.className = selected.className.replace('selected', 'prev')
        if (prev) prev.className = prev.className.replace('prev', 'prev-second')
        if (next_second) next_second.className = next_second.className.replace('next-second', 'next')
        if (prev_second) prev_second.className = prev_second.className.replace('prev-second', 'hide-left')

        if (next_second) var new_next_second_id = Number.parseInt(next_second.id.replace(/item-([0-9]+)-profil/, '$1'))
        if (new_next_second_id) var new_next_second = document.getElementById(`item-${new_next_second_id + 1}-profil`)

        if (new_next_second) new_next_second.className = new_next_second.className.replace('hide-right', 'next-second')
      } else if (element == 'prev') {
        if (!prev) return

        this.is_moving = true

        let current_selected_id = Number.parseInt(selected.id.replace(/item-([0-9]+)-profil/, '$1'))
        document.getElementById(`item-selecter-${current_selected_id}`).style.color = ''
        if (this.time_outs.playing) clearTimeout(this.time_outs.playing)

        prev.className = prev.className.replace('prev', 'selected')
        current_selected_id = Number.parseInt(prev.id.replace(/item-([0-9]+)-profil/, '$1'))
        document.getElementById(`item-selecter-${current_selected_id}`).style.color = '#888'

        if (selected) selected.className = selected.className.replace('selected', 'next')
        if (next) next.className = next.className.replace('next', 'next-second')
        if (next_second) next_second.className = next_second.className.replace('next-second', 'hide-right')
        if (prev_second) prev_second.className = prev_second.className.replace('prev-second', 'prev')

        if (prev_second) var new_prev_second_id = Number.parseInt(prev_second.id.replace(/item-([0-9]+)-profil/, '$1'))
        if (new_prev_second_id) var new_prev_second = document.getElementById(`item-${new_prev_second_id - 1}-profil`)

        if (new_prev_second) new_prev_second.className = new_prev_second.className.replace('hide-left', 'prev-second')
      }

      this.time_outs.reset_moving = setTimeout(() => {
        this.is_moving = false
      }, 100)
    },
  },
  computed: {
    getTitle() {
      const language = this.$root.$children[0].$refs.header.language
      if (language == 'fre') {
        return 'Reprendre la lecture'
      } else {
        return 'Continue watching'
      }
    },
  },
}
</script>
<style>
#continue-watching,
#continue-watching-carousel {
  position: relative;
  width: 100%;
  height: 40vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 3vh;
}
#continue-watching {
  padding-bottom: 5%;
  padding-top: 2%;
}
#continue-watching-title {
  position: absolute;
  top: -5%;
  width: 100%;
  height: 2rem;
  font-size: 20pt;
  font-family: operatormonoitalic;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item-profil,
.item-profil-hover {
  position: absolute;
  transition: transform 0.5s, left 0.5s, opacity 0.5s, z-index 0s, width 0.5s, height 0.5s;
  opacity: 1;
  width: 15vw;
  height: 100%;
}

.item-bottom-profil {
  position: absolute;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  background-color: rgba(0, 0, 0, 0.8);
  height: 13%;
  width: 100%;
  font-size: 12px;
  bottom: 0%;
  z-index: -1;
}

.item-thumbnail-profil,
.item-preview-profil {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.item-univers-film-profil,
.item-univers-serie-profil {
  position: absolute;
  transform: translateY(-36.5vh);
  left: 5%;
  font-family: operatormonoitalic;
}
.hide-left {
  left: 0%;
  opacity: 0;
  transform: translateY(0%) translateX(-50%) scale(0.2);
  pointer-events: none;
}
.hide-right {
  left: 100%;
  opacity: 0;
  transform: translateY(0%) translateX(-50%) scale(0.2);
  pointer-events: none;
}
.prev {
  z-index: 5;
  left: 35%;
  transform: translateY(0%) translateX(-25%) scale(0.8);
  font-size: 12pt;
}
.prev-second {
  z-index: 4;
  left: 25%;
  transform: translateY(0%) translateX(-25%) scale(0.6);
  opacity: 0.7;
  font-size: 6pt;
}
.selected {
  z-index: 10;
  left: 50%;
  transform: translateY(0px) translateX(-50%);
  font-size: 20pt;
  cursor: pointer;
}

.selected > .item-bottom-profil {
  z-index: 0;
}

.next {
  z-index: 5;
  left: 60%;
  transform: translateY(0%) translateX(-50%) scale(0.8);
  font-size: 12pt;
}
.next-second {
  z-index: 4;
  left: 70%;
  transform: translateY(0%) translateX(-50%) scale(0.6);
  opacity: 0.7;
  font-size: 6pt;
}
#continue-items-selecter {
  position: absolute;
  width: 100%;
  height: 10%;
  bottom: 10%;
  display: flex;
  justify-content: center;
}
.item-selecter {
  position: relative;
  width: 1.5%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #444;
}
.item-selecter:hover {
  color: #888;
  cursor: pointer;
}
</style>

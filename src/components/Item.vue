<template>
  <div
    :class="'item' + this.id_suffix"
    :data-search="GetSearchKey"
    :data-update="GetUpdateKey"
    :id="'item-' + this.unique_id + this.id_suffix"
    @mouseenter="OnMouseEnter"
    @mouseleave="OnMouseLeave"
  >
    <img
      ref="image"
      :class="'item-thumbnail' + this.id_suffix"
      :id="'thumbnail-' + this.unique_id + this.id_suffix"
      :src="'/api/poster/' + this.file.id + '/' + this.$store.state.user.languages.text"
      @click="TriggerPlaying(false)"
    />
    <div ref="item_bottom" :class="'item-bottom' + this.id_suffix" :id="'item-bottom-' + this.unique_id + this.id_suffix">
      <span class="item-infos">
        <span class="item-univers" v-if="this.file.type != 'film'">
          {{ this.file.univers }}
        </span>
        <span :class="'item-' + this.file.type">
          {{ GetFormatedTitle }}
        </span>
      </span>
      <span class="item-browse"><i class="fas fa-chevron-down" @click="BrowseFile"></i></span>
    </div>
  </div>
</template>

<script>
import Constants from '../constantsClient'

export default {
  name: 'Item',
  props: ['unique_id', 'id_suffix', 'allow_mouse_input'],
  created() {
    this.GetInfos()
  },
  data() {
    return {
      file: {
        id: null,
        title: null,
        univers: null,
        type: null,
        episode: null,
        season: null,
      },
      isHovered: false,
      isPreviewing: false,
      previewHasBeenFetched: false,
      infos: {
        element: null,
        isNeeded: false,
      },
      timeouts: {
        previewManager: null,
        growThumbnail: null,
      },
    }
  },
  methods: {
    SetWidth(width) {
      this.$el.style.width = `${width}px`
      this.$refs.item_bottom.style.width = `${width}px`
    },
    OnMouseEnter() {
      if (!this.allow_mouse_input) return

      Object.assign(this.$refs.item_bottom.style, {
        bottom: '-16%',
        animation: 'appear 0.5s',
      })
    },
    OnMouseLeave() {
      if (!this.allow_mouse_input) return

      Object.assign(this.$refs.item_bottom.style, {
        bottom: '0%',
        animation: 'disappear 0.5s',
      })
    },
    GetInfos() {
      const count = this.$root.$children[0].itemCount

      // If count is 0, it means it hasn't been totaly fetched yet
      // so we try again in 500ms
      if (count == 0) {
        setTimeout(() => {
          this.GetInfos()
        }, 500)
        return
      }

      if (this.unique_id >= count) {
        // Get the id in this slide
        const localId = this.unique_id % Constants.itemsPerSlide
        // Get the lowest id in this slide
        let lowestId = this.unique_id - localId

        // If the lowest id is equal to the id, it means that this item
        // is the last of its slide
        if (lowestId == this.unique_id) lowestId -= Constants.itemsPerSlide - 1

        // Generate a random id inferior to the lowest id of the slide
        // This avoids having 2 items with the same file in the same slide
        this.file.id = Number.parseInt(Math.random() * lowestId)
      } else {
        this.file.id = this.unique_id
      }

      // Fetch the name
      fetch(`/api/info/${this.file.id}/${this.$store.state.user.languages.text}`)
        .then((res) => {
          if (res.ok) return res.json()
        })
        .then((file) => {
          Object.assign(this.file, file)
        })
    },
    TriggerPlaying(override) {
      // Was done with an event but it doesn't work has wanted so we have to do this
      if ((!this.$el.classList.contains('item-profil') && !this.$el.classList.contains('item-profil-hover')) || override)
        this.$root.$children[0].$refs.viewer.Play({ file_id: this.file.id, episode: this.file.episode, season: this.file.season })
    },
    BrowseFile(event) {
      this.$root.$children[0].$refs.file_browser.Browse(event, { id: this.file.id })
    },
  },
  computed: {
    GetFormatedTitle() {
      return this.file.season && this.file.episode
        ? `S${this.file.season < 10 ? '0' + this.file.season : this.file.season}:E${this.file.episode < 10 ? '0' + this.file.episode : this.file.episode}`
        : this.file.title
    },
    GetSearchKey() {
      return this.id_suffix ? '' : escape(this.file.type == 'film' ? this.file.title : this.file.univers)
    },
    GetUpdateKey() {
      return this.id_suffix ? escape(this.file.type == 'film' ? this.file.title : this.file.univers) : ''
    },
  },
}
</script>

<style>
@keyframes slideIn {
  0% {
    color: white;
    opacity: 0;
    bottom: -100%;
  }
  90% {
    color: white;
    opacity: 0;
    bottom: -5%;
  }
  100% {
    color: white;
    bottom: 5%;
  }
}

@keyframes appear {
  0% {
    bottom: 0%;
  }
  90% {
    bottom: 0%;
  }
  100% {
    bottom: -16%;
  }
}
@keyframes disappear {
  0% {
    bottom: -16%;
    color: transparent;
  }
  10% {
    bottom: 0%;
    color: transparent;
  }
}

.item {
  position: relative;
  height: 100%;
  margin: 0 1px;
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}

.item-thumbnail {
  position: absolute;
  height: 100%;
  width: 100%;
  object-fit: fill;
}

.item-preview {
  position: absolute;
  transition: 0.25s all;
  object-fit: fill;
}

.item-bottom {
  position: absolute;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  font-weight: bold;
  font-size: 0.7em;
  background-color: #222;
  z-index: -1;
  height: 16%;
  bottom: 0%;
  animation: disappear 0.5s;
  cursor: default;
}

.item-infos {
  position: relative;
  height: 66%;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.item-serie {
  margin-right: 4%;
  margin-top: 3%;
}

.item-film {
  margin-top: 3%;
  width: 100%;
  text-align: center;
}

.item-univers {
  margin-left: 4%;
  margin-top: 3%;
}

.item-browse {
  position: absolute;
  height: 33%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.item-browse > i {
  transform: scaleX(1.5);
  cursor: pointer;
}

.item-browse > i:hover {
  transform: translateY(5%) scaleX(2) scaleY(1.5);
}
</style>

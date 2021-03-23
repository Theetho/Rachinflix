<template>
  <div class="carousel" :id="'carousel-' + this.id" @mouseenter="ShowSliders(true)" @mouseleave="ShowSliders(false)">
    <div :id="'carousel-title-' + this.id" class="carousel-title">
      {{ this.title }}
    </div>
    <div class="slider left-slider" @click="SlideTo(-1)">
      <i class="chevron fa fa-chevron-left" aria-hidden="true" style="transform: scaleX(1.8) scaleY(2.5);"></i>
    </div>
    <div class="slide" v-for="slide in GetSlidesIds" :key="slide" :style="GetStyle(slide)" :id="'slide-' + slide">
      <Item
        v-for="item in GetItemsForThisSlide(slide)"
        :key="item"
        :ref="'item-' + item"
        :unique_id="item"
        :id_suffix="''"
        :allow_mouse_input="true"
        @play="$emit('play', $event)"
      />
    </div>
    <div class="slider right-slider" @click="SlideTo(1)">
      <i class="chevron fa fa-chevron-right" aria-hidden="true" style="transform: scaleX(1.8) scaleY(2.5);"></i>
    </div>
  </div>
</template>

<script>
import Item from './Item.vue'
import Constants from '../constantsClient'

export default {
  name: 'Carousel',
  components: {
    Item,
  },
  props: ['id', 'title'],
  mounted() {
    const item_width = (this.$el.offsetWidth * 0.9) / Constants.itemsPerSlide
    for (const item of this.$children) {
      item.SetWidth(item_width)
    }
  },
  data() {
    return {
      is_sliding: false,
      slide_duration: 500,
      current_slide_index: 1,
    }
  },
  methods: {
    GetStyle(slideId) {
      switch (slideId % 3) {
        case 0:
          return 'left: -100%'
        case 1:
          return 'left: 0%'
        case 2:
          return 'left: 100%'
        default:
          return 'left: 0%'
      }
    },
    SlideTo(direction) {
      // If it is already sliding, we wait (avoid spamming the carousel's buttons)
      if (this.is_sliding) return

      this.is_sliding = true
      document.body.style.pointerEvents = 'none'

      const slides = this.$el.getElementsByClassName('slide')

      // Update the position of each slide to toggle the animation
      for (let slide of slides) {
        const currentPosition = Number.parseInt(slide.style.left.replace('%', ''))

        let positionInPercent = currentPosition - direction * 100
        // We want the slide that goes out and the one that goes in
        // to be over the one that is looping.
        slide.style.zIndex = 1
        // Default for the two visible slides of the animation
        slide.style.transition = `0.${this.slide_duration / 10}s left`

        if (positionInPercent == 0) {
          this.current_slide_index = Number.parseInt(slide.id.replace('slide-', '')) % Constants.slidesPerCarousel
        } else if (positionInPercent < -100) {
          // This one is the looping slide so it goes 'under'
          slide.style.zIndex = 0
          // We want to see it move out, and then move in on
          // the other side, so we reduce the transition time
          slide.style.transition = `0.${this.slide_duration / 20}s left`
          positionInPercent = 100
        } else if (positionInPercent > 100) {
          // Same thing here but from the other side
          slide.style.zIndex = 0
          slide.style.transition = `0.${this.slide_duration / 20}s left`
          positionInPercent = -100
        }

        slide.style.left = `${positionInPercent}%`
      }

      // Wait for the animation to finish before sliding again
      setTimeout(() => {
        this.is_sliding = false
        document.body.style.pointerEvents = 'initial'
      }, this.slide_duration)
    },
    GetItemsForThisSlide(slide) {
      const id = slide * Constants.itemsPerSlide + Constants.itemsPerSlide - 1

      const result = []
      for (let i = 0; i < Constants.itemsPerSlide; ++i) {
        result.push(id - i)
      }

      return result.reverse()
    },
    ShowSliders(show) {
      for (let chevron of this.$el.getElementsByClassName('chevron')) {
        chevron.style.color = show ? 'rgba(255, 255, 255, 0.7)' : 'transparent'
      }
    },
  },
  computed: {
    GetSlidesIds() {
      const id = this.id * Constants.slidesPerCarousel + Constants.slidesPerCarousel - 1

      const result = []
      for (let i = 0; i < Constants.slidesPerCarousel; ++i) {
        result.push(id - i)
      }

      return result.reverse()
    },
  },
}
</script>

<style>
.carousel {
  position: relative;
  margin: 8% 0% 8% 0%;
  width: 85%;
  left: 7.5%;
  height: 360px;

  display: grid;
  grid-template-columns: 5% 90% 5%;

  z-index: 0;
}
.carousel::-webkit-scrollbar {
  display: none;
}
.carousel::-webkit-scrollbar-thumb {
  display: none;
}

.carousel-title {
  position: absolute;
  top: -12%;
  left: 1%;
  font-size: 20pt;
  user-select: none;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}
.slider {
  height: 14.5vh;
  height: 100%;
  width: 100%;
  z-index: 2;
  transition: 0.3s all;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  user-select: none;

  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(0, 0, 0, 0.5);
}
.slider:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
.left-slider {
  grid-column: 1;
}
.right-slider {
  grid-column: 3;
}
.slide {
  display: flex;
  position: absolute;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 0;
  transition: zIndex 0s;

  grid-column: 2 / 3;
}
.chevron {
  transition: 0.3s all;
  color: transparent;
}
</style>

<template>
  <div id="search-menu" @mousewheel="OnMouseWheel">
    <div id="search-menu-bar">
      <input id="search-menu-input" type="text" v-model="research" />
      <i class="fa fa-search" aria-hidden="true"></i>
    </div>
    <!-- Section when user is browsing (no input in the search bar) -->
    <div id="search-menu-container" v-if="research == ''">
      <div class="collapsible base-section" v-for="(section, i) in GetSections" :key="i">
        <i class="fa fa-caret-right" aria-hidden="true" @click="ExtendOrCollapse($event)"></i>
        <span class="search-menu-section" @click="ExtendOrCollapse($event)">{{ section }}</span>
        <div class="collapsible-content">
          <div v-for="(univers, j) in GetSubsection(section)" :class="section == 'Films' ? 'collapsible' : ''" :key="j">
            <i v-if="section == 'Films'" class="fa fa-caret-right" aria-hidden="true" @click="ExtendOrCollapse($event)"></i>
            <span v-if="section == 'Films'" class="search-menu-section" @click="ExtendOrCollapse($event)">{{ univers.title || univers }} </span>
            <span class="search-menu-item" v-else :id="'link-' + GetCounter()" @click="ScrollToItem($event, univers)">
              {{ '- ' + univers }}
            </span>
            <div class="collapsible-content">
              <span v-for="(film, k) in univers.items" :key="k" class="search-menu-item" :id="'link-' + GetCounter()" @click="ScrollToItem($event, film.title)">
                - {{ film.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Section when user is searching -->
    <div id="search-menu-container" v-else>
      <div class="collapsible-open" :id="'collapsible-open-' + i" v-for="(section, i) in GetSections" :key="i">
        <i class="fa fa-caret-down" aria-hidden="true"></i>
        <span class="search-menu-section">{{ section }} </span>
        <div class="content">
          <div v-for="(univers, j) in GetSubsection(section)" :key="j">
            <span
              v-if="section == 'Series'"
              class="search-menu-item"
              :id="'link-' + GetCounter()"
              v-show="Compare(univers)"
              @click="ScrollToItem($event, univers)"
            >
              {{ '- ' + univers }}
            </span>
            <div v-else>
              <span
                v-for="(film, k) in univers.items"
                :key="k"
                class="search-menu-item"
                :id="'link-' + GetCounter()"
                v-show="Compare(film.title, film.univers)"
                @click="ScrollToItem($event, film.title)"
              >
                - {{ film.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Constants from '../constantsClient'
let counter = 0

export default {
  name: 'SearchMenu',
  created() {
    fetch(`/api/collections/${this.$store.state.user.languages.text}`).then(async (res) => {
      const collections = await res.json()
      this.collections = collections
    })
  },
  updated() {
    counter = 0
  },
  data() {
    return {
      collections: null,
      previousItemsSearched: null,
      research: '',
    }
  },
  computed: {
    GetSections() {
      return this.collections ? Object.keys(this.collections) : ['']
    },
  },
  methods: {
    GetSubsections(key) {
      return this.collections ? Object.keys(this.collections[key]) : ['']
    },
    GetCounter() {
      if (!this.collections) return counter
      return ++counter
    },
    GetSubsection(key) {
      return this.collections ? this.collections[key] : ['']
    },
    ScrollToItem(event, data_to_search) {
      event.stopImmediatePropagation()

      // From https://www.kirupa.com/html5/get_element_position_using_javascript.htm
      const GetElementPosition = (element) => {
        var xPos = 0
        var yPos = 0

        while (element) {
          if (element.tagName == 'BODY') {
            // deal with browser quirks with body/window/document and page scroll
            var xScroll = element.scrollLeft || document.documentElement.scrollLeft
            var yScroll = element.scrollTop || document.documentElement.scrollTop

            xPos += element.offsetLeft - xScroll + element.clientLeft
            yPos += element.offsetTop - yScroll + element.clientTop
          } else {
            // for all other non-BODY elements
            xPos += element.offsetLeft - element.scrollLeft + element.clientLeft
            yPos += element.offsetTop - element.scrollTop + element.clientTop
          }

          element = element.offsetParent
        }
        return {
          x: xPos,
          y: yPos,
        }
      }

      // Untoggle the menu
      this.$root.$children[0].$refs.header.ToggleSearchMenu()

      // Wait for it to be hidden
      const closure_animation_duration =
        Number.parseFloat(
          window
            .getComputedStyle(this.$el, null)
            .getPropertyValue('transition')
            .replace(/left ([0-9]+\.*[0-9]*)s.+/, '$1')
        ) * 1000

      // When it is closed
      setTimeout(() => {
        const item = document.querySelector(`div.item[data-search='${escape(data_to_search)}']`)

        const top = GetElementPosition(item).y - window.outerHeight * 0.45 // 0*45 => to scroll to the middle of the page

        let timeout = null
        // Launch the carousel and item animation after the window has finished scrolling
        const ScrollHandler = () => {
          if (timeout) clearTimeout(timeout)
          timeout = setTimeout(() => {
            // Get the carousel element
            const carousel = item.parentElement.parentElement
            // Get the slide index of the item
            const slide_index = Number.parseInt(item.parentElement.id.replace('slide-', '')) % Constants.slidesPerCarousel
            const carousel_component = this.$root.$children[0].$refs[carousel.id][0]

            if (carousel_component.current_slide_index != slide_index) {
              const x = slide_index - carousel_component.current_slide_index
              // Generated from https://www.dcode.fr/function-equation-finder
              // with x:1 => 1, x:-1 => -1, x:2 => -1, x:-2 => 1
              // where x is the direction and number of slide to move
              const direction = (3 * x) / 2 - Math.pow(x, 3) / 2

              carousel_component.SlideTo(direction)
              setTimeout(() => {
                this.BlurBackground(item)
              }, carousel_component.slide_duration)
            } else {
              this.BlurBackground(item)
            }

            document.body.style.pointerEvents = 'initial'

            document.body.addEventListener(
              'mousemove',
              () => {
                this.UnblurBackground(item)
              },
              { once: true }
            )

            window.removeEventListener('scroll', ScrollHandler)
          }, 250)
        }

        document.body.style.pointerEvents = 'none'

        if (top) {
          window.addEventListener('scroll', ScrollHandler)
          window.scrollBy({ top: top, behavior: 'smooth' })
        } else {
          ScrollHandler()
          timeout = null
        }
      }, closure_animation_duration)

      // Close every collapsible that were open
      for (let content of document.getElementsByClassName('open')) this.ExtendOrCollapse(null, content, true)

      // Reset the research as well
      this.research = ''
    },
    BlurBackground(item) {
      this.$root.$children[0].$el.classList.add('blur-background')
      item.classList.add('unblur')
    },
    UnblurBackground(item) {
      this.$root.$children[0].$el.classList.remove('blur-background')
      item.classList.remove('unblur')
    },
    ExtendOrCollapse(event, content = null, dont_change_class = false) {
      const collapsible = event ? event.target.parentElement : content.parentElement

      if (event) event.stopImmediatePropagation()

      // Allow to send the content we want to extend/collapse from the outside
      content = content || collapsible.getElementsByClassName('collapsible-content')[0]

      if (!content) return
      const contentHeight = content.scrollHeight

      let icon = collapsible.getElementsByTagName('i')[0]
      let title = collapsible.getElementsByClassName('search-menu-section')[0]

      const parent = collapsible.parentElement

      // Needs to collapse
      if (content.style.maxHeight) {
        if (!dont_change_class) content.classList.remove('open')
        content.style.maxHeight = null
        icon.className = icon.className.replace('caret-down', 'caret-right')
        Object.assign(icon.style, {
          transform: 'translateX(0%)',
          color: null,
        })
        Object.assign(title.style, {
          fontFamily: null,
          color: null,
        })
        // Need to extend
      } else {
        content.style.maxHeight = contentHeight + 'px'
        content.classList.add('open')

        if (parent.classList.contains('collapsible-content')) {
          const currentHeight = Number.parseInt(parent.style.maxHeight)
          parent.style.maxHeight = `${currentHeight + contentHeight}px`
        }

        icon.className = icon.className.replace('caret-right', 'caret-down')
        Object.assign(icon.style, {
          transform: 'translateX(-15%)',
          color: 'red',
        })
        Object.assign(title.style, {
          fontFamily: 'operatormonoitalic',
          color: 'red',
        })
      }
    },
    OnMouseWheel(event) {
      event.preventDefault()
      event.stopImmediatePropagation()
      this.$el.scrollBy({
        left: event.deltaX,
        top: event.deltaY,
      })
    },
    Compare(element, univers = []) {
      if (!element) return false

      for (let i in univers) {
        if (univers[i].toLowerCase().includes(this.research.toLowerCase())) return true
      }

      return element.toLowerCase().includes(this.research.toLowerCase())
    },
  },
}
</script>

<style>
#search-menu::-webkit-scrollbar {
  display: none;
}
#search-menu::-webkit-scrollbar-thumb {
  display: none;
}
#search-menu {
  position: fixed;
  top: 5vh;
  left: -21vw;
  width: 20vw;
  height: 95vh;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 997;
  transition: left 0.5s, font-family 1s;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  font-size: 15pt;
  overflow-x: hidden;
}
#search-menu-input {
  position: relative;
  top: -0.3vh;

  margin-left: 1.5vw;
  margin-bottom: 0.5vh;
  outline: none;
  background-color: #141414;
  border: solid #ddd 2px;
  color: #ddd;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}
#search-menu-bar > i {
  margin-left: 0.5vw;
}
#search-menu-container {
  position: relative;
  width: 100%;
}
.collapsible,
.collapsible-open {
  position: relative;
  width: 100%;
  margin-left: 1vw;
  user-select: none;
  cursor: pointer;
}
.collapsible > i,
.collapsible-open > i {
  width: 1vw;
  margin-top: 0.5vh;
}
.collapsible-open > i {
  transform: translateX(-25%);
}
.collapsible:hover > .search-menu-section,
.collapsible:hover > i,
.search-menu-item:hover,
.collapsible-open > .search-menu-section,
.collapsible-open > i {
  color: red;
}
.collapsible:hover > .search-menu-section,
.collapsible-open > .search-menu-section,
.search-menu-item:hover {
  font-family: operatormonoitalic;
}
.search-menu-section {
  width: 100%;
  margin-top: 1%;
}
.search-menu-item {
  display: flex;
  width: 30vw;
  font-size: 10pt;
  margin-left: 1vw;
  margin-bottom: 1%;
  cursor: pointer;
}
.collapsible-content,
.content {
  position: relative;
  width: 100%;
  display: grid;
  transition: max-height 0.2s ease-out;
  overflow: hidden;
  margin-top: 0.5%;
  font-size: 12pt;
}
.collapsible-content {
  max-height: 0;
}
</style>

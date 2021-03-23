<template>
  <div class="user-slot" @click="OnClick">
    <img class="user-icon" v-if="this.sprite != null" :src="'/api/sprite/' + this.sprite" alt="" />
    <div :class="this.is_not_profil ? 'user-icon' : ''" v-else />
    {{ this.name }}
  </div>
</template>
<script>
export default {
  name: 'UserSlot',
  props: ['click'],
  data() {
    return {
      name: '',
      sprite: null,
      width: 0,
      is_not_profil: false,
    }
  },
  mounted() {},
  methods: {
    Set({ name, sprite, width }) {
      this.name = name
      this.sprite = sprite
      this.width = width
      Object.assign(this.$el.style, { width: `${this.width}px`, height: `${this.width}px` })
    },
    OnClick() {
      if (!this.click) return

      const [fn, param] = this.click
      fn(param)
    },
  },
}
</script>
<style>
.user-slot {
  margin: 5% 2% 0 2%;
  text-align: center;
  color: grey;
  font-size: 20pt;
  width: 0;
  height: 0;
  border: 2px solid black;
}
.user-icon {
  cursor: pointer;
  width: 100%;
  height: 100%;
  object-fit: fill;
  margin-bottom: 4%;
}
div.user-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}
div.user-icon::after {
  content: '+';
  font-size: 48pt;
}
.user-slot:hover {
  border: 2px solid white;
  color: white;
}
</style>

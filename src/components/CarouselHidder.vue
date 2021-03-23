<template>
  <div class="carousel-hidder" :style="'left: ' + this.left"></div>
</template>
<script>
export default {
  name: 'CarouselHidder',
  props: ['left'],
}
</script>
<style>
.carousel-hidder {
  position: absolute;
  background-color: #141414;
  width: 10%;
  height: 100%;
  z-index: 4;
  top: 0;
}
</style>

<template>
  <div id="app">
    <vue-image-compare before="./img/before.jpg" after="./img/after.jpg" :full="true">
      <i class="vic-left" aria-hidden="true" slot="icon-left">&lt;</i>
      <i class="vic-right" aria-hidden="true" slot="icon-right">&gt;</i>
    </vue-image-compare>
  </div>
</template>

<script>
import VueImageCompare from './components/vue-image-compare.vue'

export default {
  name: 'app',
  components: {
    VueImageCompare,
  },
}
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
}
body {
  margin: 0;
}
</style>

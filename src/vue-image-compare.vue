<template>
  <figure class="image-compare" :class="{ full }" @mousemove.prevent="onMouseMove">
    <div class="image-compare-wrapper" :style="{ width: posXPercent }">
      <img :src="before" :alt="before" :style="dimensions">
    </div>
    <img :src="after" :alt="after" :style="dimensions">
    <div class="image-compare-handle" :style="{ left: posXPercent }" @mousedown.prevent="onMouseDown"></div>
  </figure>
</template>

<script>
export default {
  props: {
    before: {
      type: String,
      required: true
    },
    after: {
      type: String,
      required: true
    },
    full: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      width: null,
      pageX: null,
      posX: null
    }
  },
  computed: {
    dimensions() {
      return {
        width: `${this.width}px`,
        height: this.full ? `${this.height}px` : 'auto'
      }
    },
    posXPercent() {
      return `${this.posX / this.width * 100}%`
    }
  },
  methods: {
    onResize() {
      this.width = this.$el.clientWidth;
      this.height = this.$el.clientHeight;
      this.posX = this.width / 2;
    },
    onMouseDown() {
			this.isDragging = true;
    },
    onMouseUp(event) {
      event.preventDefault();

      this.isDragging = false;
    },
    onMouseMove(event) {
      if (!this.isDragging) {
        return;
      }

      this.pageX = event.pageX;
			window.requestAnimationFrame(this.updatePos);
		},
    updatePos() {
      this.posX = this.pageX - this.$el.getBoundingClientRect().left;
    }
  },
  created() {
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onResize);
  },
  mounted() {
    this.onResize();
  },
  beforeDestroy() {
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.onResize);
  }
};
</script>

<style lang="scss" scoped>
.image-compare {
  position: relative;

  &.full {
    overflow: hidden;
    height: 100%;
    width: 100%;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  > img {
    display: block;
  }

  > .image-compare-wrapper,
  > .image-compare-handle {
    bottom: 0;
    position: absolute;
    top: 0;
  }

  > .image-compare-wrapper {
    left: 0;
    overflow: hidden;
    width: 100%;
    z-index: 1;
  }

  > .image-compare-handle {
    background-color: #fff;
    cursor: ew-resize;
    transform: translateX(-50%);
    width: 2px;
    z-index: 2;
  }
}
</style>

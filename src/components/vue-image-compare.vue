<template>
  <figure class="image-compare" :class="{ full }" @mousemove.prevent="onMouseMove">
    <div class="image-compare-wrapper" :style="{ width: posX + 'px' }" v-show="!hideAfter" @mousedown.prevent="onMouseDownImage">
      <img :src="after" :alt="after" :style="dimensions">
    </div>
    <img :src="before" :alt="before" :style="dimensions" @mousedown.prevent="onMouseDownImage">
    <div class="image-compare-handle" :style="{ left: posX + 'px' }" v-show="!hideAfter" @mousedown.prevent="onMouseDownHandle">
      <span class="image-compare-handle-icon left">
        <slot name="icon-left"></slot>
      </span>
      <span class="image-compare-handle-icon right">
        <slot name="icon-right"></slot>
      </span>
    </div>
  </figure>
</template>

<script>
export default {
  props: {
    before: {
      type: String,
      required: true,
    },
    after: {
      type: String,
      required: true,
    },
    full: {
      type: Boolean,
      default: false,
    },
    padding: {
      type: Object,
      default() {
        return {
          left: 0,
          right: 0,
        }
      },
      required: false,
    },
    hideAfter: {
      type: Boolean,
      default: false,
      required: false,
    },
    zoom: {
      type: Number,
      default: 1,
      required: false,
    },
    reset: Boolean,
  },
  data: function() {
    return {
      width: null,
      height: null,
      pageX: null,
      pageY: null,
      posX: null,
      isDraggingHandle: false,
      isDraggingImage: false,
      allowNextFrame: true,
      unwatch: null,
      diffX: 0,
      diffY: 0,
      shiftX: 0,
      shiftY: 0,
      mutableZoom: this.zoom
    }
  },
  watch: {
    reset() {
      this.shiftX = 0
      this.shiftY = 0
      this.setInitialPosX(this.padding.left + this.padding.right)
    },
  },
  computed: {
    isDragging() {
      return this.isDraggingImage || this.isDraggingHandle
    },
    dimensions() {
      return {
        width: `${this.width}px`,
        height: this.full ? `${this.height}px` : 'auto',
        transform: `scale(${this.mutableZoom}) translate(${this.shiftX}px, ${this.shiftY}px)`,
      }
    },
  },
  methods: {
    onResize() {
      this.width = this.$el.clientWidth
      this.height = this.$el.clientHeight
      this.setInitialPosX(this.padding.left + this.padding.right)
    },
    onMouseDownHandle() {
      this.isDraggingHandle = true
    },
    onMouseDownImage() {
      this.isDraggingImage = true
    },
    onMouseUp(event) {
      event.preventDefault()
      this.isDraggingHandle = false
      this.isDraggingImage = false
      this.pageX = null
      this.pageY = null
    },
    onMouseMove(event) {
      if (this.allowNextFrame && this.isDragging) {
        this.allowNextFrame = false

        let pageX = event.pageX || event.targetTouches[0].pageX || event.originalEvent.targetTouches[0].pageX
        let pageY = event.pageY || event.targetTouches[0].pageY || event.originalEvent.targetTouches[0].pageY

        this.diffX = this.pageX ? pageX - this.pageX : 0
        this.diffY = this.pageY ? pageY - this.pageY : 0

        this.pageX = pageX
        this.pageY = pageY

        window.requestAnimationFrame(this.updatePos)
      }
    },
    updatePos() {
      if (this.isDraggingHandle) {
        let posX = this.pageX - this.$el.getBoundingClientRect().left

        if (posX < this.padding.left) {
          posX = this.padding.left
        } else if (posX > this.width - this.padding.right) {
          posX = this.width - this.padding.right
        }

        this.posX = posX
      }
      if (this.isDraggingImage) {
        this.shiftX += this.diffX / this.mutableZoom
        this.shiftY += this.diffY / this.mutableZoom
      }
      this.allowNextFrame = true
    },
    setInitialPosX(padding) {
      if (padding >= this.width) {
        console.error('Sum of paddings is wider then parent element!')
        return
      }
      this.posX = (this.width + this.padding.left - this.padding.right) / 2
    },
    debounce(func, wait, immediate) {
      var timeout
      return function() {
        var context = this
        var args = arguments
        var later = function() {
          timeout = null
          if (!immediate) func.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
      }
    },
    onWheel(event) {
      // console.log('should update zoom with event', event)
      // console.log('update zoom with delta', event.deltaY)
      this.mutableZoom += event.deltaY / 1000
    },
  },
  created() {
    // prepare debounced versions
    // var onWheelDebounced = this.debounce(this.onWheel, 100)
    window.addEventListener('mouseup', this.onMouseUp)
    window.addEventListener('resize', this.onResize)
    window.addEventListener('wheel', this.onWheel)
  },
  mounted() {
    this.onResize()
    this.unwatch = this.$watch(() => this.padding.left + this.padding.right, newValue => this.setInitialPosX(newValue))
  },
  beforeDestroy() {
    this.unwatch()
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('resize', this.onResize)
  },
}
</script>

<style lang="scss" scoped>
.image-compare {
  position: relative;
  margin: 0;
  overflow: hidden;

  &.full {
    overflow: hidden;
    height: 100%;
    width: 100%;
    flex: 1;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  img {
    max-width: none;
    display: block;
  }
}

.image-compare-wrapper,
.image-compare-handle {
  bottom: 0;
  position: absolute;
  top: 0;
}

.image-compare-wrapper {
  left: 0;
  overflow: hidden;
  width: 100%;
  z-index: 1;
  transform: translateZ(0);
  will-change: width;
}

.image-compare-handle {
  color: #fff;
  background-color: currentColor;
  cursor: ew-resize;
  transform: translateX(-50%) translateZ(0);
  width: 2px;
  z-index: 2;
  will-change: left;
}

.image-compare-handle-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 2rem;
  color: currentColor;
  line-height: normal;

  &.left {
    padding-right: 10px;
    transform: translate(-100%, -50%);
  }

  &.right {
    padding-left: 10px;
    transform: translate(0, -50%);
  }
}
</style>

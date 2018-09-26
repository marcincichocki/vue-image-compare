<template>
    <figure :class="{ full }"
            class="image-compare"
            @mousemove.prevent="onMouseMove"
            @click.prevent="onMouseMove($event, true)">

        <!-- d&d overlay -->
        <div :class="{ visible: showDropzone }" class="dropzone">Drop 1 or 2 images here !</div>

        <div v-show="!hideAfter && showAfter"
             :style="{ width: posX + 'px' }"
             class="image-compare-wrapper"
             @mousedown.prevent="onMouseDownImage">

            <!-- a-img -->
            <img :src="mutableAfter" :style="dimensions" alt="after">

            <!-- a-label -->
            <div v-show="afterLabel" class="after-name">
                {{ afterLabel }}
                <div v-show="afterSize" class="size">{{ afterSize }}</div>
            </div>
        </div>

        <!-- b-img -->
        <img :src="mutableBefore"
             :style="dimensions"
             alt="before"
             @mousedown.prevent="onMouseDownImage">

        <!-- handle -->
        <div v-if="!hideHandle"
             v-show="!hideAfter"
             :style="{ left: posX + 'px' }"
             class="image-compare-handle"
             @mousedown.prevent="onMouseDownHandle">

            <template>
                <span class="image-compare-handle-icon left">
                    <slot name="icon-left"/>
                </span>
                <span class="image-compare-handle-icon right">
                    <slot name="icon-right"/>
                </span>
            </template>
        </div>

        <!-- b-label -->
        <div v-show="beforeLabel" class="before-name">
            {{ beforeLabel }}
            <div v-show="beforeSize" class="size">{{ beforeSize }}</div>
        </div>
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
        },
        padding: {
            type: Object,
            required: false,
            default() {
                return {
                    left: 0,
                    right: 0
                }
            }
        },
        hideAfter: {
            type: Boolean,
            default: false,
            required: false
        },
        zoom: {
            type: Object,
            required: false,
            default() {
                return {
                    min: 0.5,
                    max: 2
                }
            }
        },
        isZoomable: {
            type: Boolean,
            default: false,
            required: false
        },
        isDraggable: {
            type: Boolean,
            default: false,
            required: false
        },
        isSwitchable: {
            type: Boolean,
            default: false,
            required: false
        },
        hideHandle: {
            type: Boolean,
            default: false,
            required: false
        },
        reset: {
            type: Boolean,
            default: false,
            required: false
        },
        labels: {
            type: Object,
            required: false,
            default() {
                return {
                    after: '',
                    before: ''
                }
            }
        }
    },
    data() {
        return {
            width: null,
            height: null,
            pageX: null,
            pageY: null,
            posX: null,
            isDraggingHandle: false,
            isDraggingImage: false,
            allowNextFrame: true,
            diffX: 0,
            diffY: 0,
            shiftX: 0,
            shiftY: 0,
            mutableZoom: 1,
            mutableBefore: this.before,
            mutableAfter: this.after,
            showDropzone: false,
            showAfter: true,
            beforeName: '',
            beforeSize: '',
            afterName: '',
            afterSize: ''
        }
    },
    computed: {
        afterLabel() {
            return this.afterName || this.labels.after
        },
        beforeLabel() {
            return this.beforeName || this.labels.before
        },
        isDragging() {
            return this.isDraggingImage || this.isDraggingHandle
        },
        dimensions() {
            let zoom = parseFloat(this.mutableZoom.toFixed(2))

            return {
                width: `${this.width}px`,
                height: this.full ? `${this.height}px` : 'auto',
                transform: `scale(${zoom}) translate(${this.shiftX}px, ${this.shiftY}px)`
            }
        },
        paddingTotal() {
            return this.padding.left + this.padding.right
        }
    },
    created() {
        // prepare debounced versions
        // var onWheelDebounced = this.debounce(this.onWheel, 100)
        window.addEventListener('mouseup', this.onMouseUp)
        window.addEventListener('resize', this.onResize)
        window.addEventListener('contextmenu', this.onRightClick)
        window.addEventListener('dragenter', this.onDragEnter)
        // window.addEventListener('dragleave', this.onDragLeave)
        window.addEventListener('dragover', this.onDragOver)
        window.addEventListener('drop', this.onDrop)
    },
    mounted() {
        this.$el.addEventListener('wheel', this.onWheel)
        this.onResize()
    },
    beforeDestroy() {
        window.removeEventListener('mouseup', this.onMouseUp)
        window.removeEventListener('resize', this.onResize)
        this.$el.removeEventListener('wheel', this.onWheel)
        window.removeEventListener('contextmenu', this.onRightClick)
        window.removeEventListener('dragenter', this.onDragEnter)
        // window.removeEventListener('dragleave', this.onDragLeave)
        window.removeEventListener('dragover', this.onDragOver)
        window.removeEventListener('drop', this.onDrop)
    },
    methods: {
        onResize() {
            this.width = this.$el.clientWidth
            this.height = this.$el.clientHeight
            this.setInitialPosX()
        },

        // mouse
        onMouseDownHandle() {
            this.$emit('movment')
            this.isDraggingHandle = true
        },
        onMouseDownImage() {
            if (this.isDraggable) {
                this.isDraggingImage = true
                this.$emit('movment')
            }
        },
        onMouseUp(event) {
            // console.log('in mouse up', event)
            event.preventDefault()
            this.isDraggingHandle = false
            this.isDraggingImage = false
            this.pageX = null
            this.pageY = null
            if (event.button === 1) {
                this.onWheelClick()
            }
        },
        onMouseMove(event, isDragging = false) {
            this.$emit('movment')

            if (event.type == 'click' && this.isDraggable) return

            if (event && this.allowNextFrame && (this.isDragging || isDragging)) {
                this.allowNextFrame = false

                let pageX = event.pageX
                let pageY = event.pageY

                if (event.targetTouches) {
                    pageX = event.targetTouches[0].pageX
                    pageY = event.targetTouches[0].pageY
                } else if (event.originalEvent && event.originalEvent.targetTouches) {
                    pageX = event.originalEvent.targetTouches[0].pageX
                    pageY = event.originalEvent.targetTouches[0].pageY
                }

                this.diffX = this.pageX ? pageX - this.pageX : 0
                this.diffY = this.pageY ? pageY - this.pageY : 0

                this.pageX = pageX
                this.pageY = pageY

                window.requestAnimationFrame(this.updatePos)
            }
        },

        // position
        updatePos() {
            if (!this.isDraggable || (this.isDraggable && this.isDraggingHandle)) {
                let posX = this.pageX - this.$el.getBoundingClientRect().left
                let pr = this.padding.right
                let pl = this.padding.left

                if (posX < pl) {
                    posX = pl
                } else if (posX > this.width - pr) {
                    posX = this.width - pr
                }

                this.posX = posX
            }

            if (this.isDraggingImage) {
                this.shiftX += this.diffX / this.mutableZoom
                this.shiftY += this.diffY / this.mutableZoom
            }

            this.allowNextFrame = true
        },
        setInitialPosX() {
            if (this.paddingTotal >= this.width) {
                return console.error('Sum of paddings is wider then parent element!')
            }

            this.posX = (this.width + this.padding.left - this.padding.right) / 2
        },

        // wheel
        onWheel(event) {
            if (this.isZoomable) {
                // console.log('should update zoom with event', event)
                // console.log('update zoom with delta', event.deltaY)

                this.mutableZoom += -event.deltaY / 1000

                this.$nextTick(() => {
                    if (this.mutableZoom >= this.zoom.max) {
                        this.mutableZoom = this.zoom.max
                    } else if (this.mutableZoom <= this.zoom.min) {
                        this.mutableZoom = this.zoom.min
                    }
                })
            }
        },

        // click
        onWheelClick() {
            // will flick images quickly
            let i = 0
            for (i = 0; i < 10; i++) {
                setTimeout(this.switchImages, i * 100)
            }

            // reset after visibility
            setTimeout(() => this.showAfter = true, i * 100)
        },
        onRightClick(event) {
            // console.log('switching images')
            event.preventDefault()
            this.switchImages()
        },

        // helper
        debounce(func, wait, immediate) {
            let timeout

            return function() {
                let context = this
                let args = arguments
                let later = function() {
                    timeout = null
                    if (!immediate) func.apply(context, args)
                }

                let callNow = immediate && !timeout
                clearTimeout(timeout)
                timeout = setTimeout(later, wait)
                if (callNow) func.apply(context, args)
            }
        },
        switchImages() {
            this.showAfter = !this.showAfter
        },

        // drag & drop
        onDragEnter(event) {
            if (this.isSwitchable) {
                console.log('onDragEnter')
                // event.preventDefault()
                this.showDropzone = true
            }
        },
        onDragLeave(event) {
            if (this.isSwitchable) {
                console.log('onDragLeave')
                event.preventDefault()
                this.showDropzone = false
            }
        },
        onDragOver(event) {
            if (this.isSwitchable) {
                // console.log('onDragOver')
                event.preventDefault()
                // this.showDropzone = true
            }
        },
        onDrop(event) {
            if (this.isSwitchable) {
                // console.log('onDrop', event)
                event.preventDefault()
                this.showDropzone = false
                // console.log('drop', event)
                let files = event.dataTransfer.files

                if (files.length === 1) {
                    console.log('drop file :', files[0])
                    const x = event.x
                    const half = Math.round(window.outerWidth / 2)
                    const leftSide = x <= half
                    console.log('x ?', x)
                    console.log('half ?', half)
                    console.log('was on left side ?', leftSide)
                    this.loadFile(files[0], leftSide)
                } else {
                    console.log('drop files :', files)
                    this.loadFile(files[0], true)
                    this.loadFile(files[1], false)
                }
                // reset zoom
                this.mutableZoom = 1
                // reset after visibility
                this.showAfter = true
                this.onResize()
            }
        },
        getFileName(file) {
            return file.name
        },
        getFileSize(file) {
            return '(' + Math.round(file.size / 1024) + ' Ko)'
        },
        loadFile(file, leftSide) {
            var reader = new FileReader()

            reader.onload = (event) => {
                if (leftSide) {
                    this.afterName = this.getFileName(file)
                    this.afterSize = this.getFileSize(file)
                    this.mutableAfter = event.target.result
                } else {
                    this.beforeName = this.getFileName(file)
                    this.beforeSize = this.getFileSize(file)
                    this.mutableBefore = event.target.result
                }
            }
            reader.readAsDataURL(file)
        }
    },
    watch: {
        reset() {
            this.shiftX = 0
            this.shiftY = 0
            this.setInitialPosX()
        },
        paddingTotal(val) {
            this.setInitialPosX()
        }
    }
}
</script>

<style lang="scss" scoped src="./styles.scss"></style>

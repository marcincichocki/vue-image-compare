# Vue Image Compare

## Requirements
* [Vue.js](http://vuejs.org/) (^2.0.0)

## Installation

```bash
npm i vue-image-compare --save
```

## Usage

```javascript
import Vue from 'vue';
import VueImageCompare from 'vue-image-compare';

Vue.use(VueImageCompare);

new Vue({
  data() {
    return {
      before: '/img/before.jpg',
      after: '/img/after.jpg'
    }
  }
}).$mount('#app');
```

```html
<div id="app">
  <image-compare :before="before" :after="after"/>
</div>
```

If you are **not** using using es6, instead of importimg just add 

```html
<script src="/path/to/vue-image-compare.js"></script>
```

just before closing body tag. 

## Props

| Name | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `before` | `String` | Path to the image image *before* change | `true` | `undefined` |
| `after` | `String` | Path to the image image *after* change | `true` | `undefined` |

## License

[MIT](/LICENSE)
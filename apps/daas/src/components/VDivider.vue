<script>
import { plantRenderPara } from '../utils/gogocodeTransfer'
import * as Vue from 'vue'
export default {
  name: 'v-divider',

  props: {
    inset: Boolean,
    vertical: Boolean
  },

  render() {
    let orientation
    if (!this.$attrs.role || this.$attrs.role === 'separator') {
      orientation = this.vertical ? 'vertical' : 'horizontal'
    }
    return Vue.h(
      'hr',
      plantRenderPara({
        class: {
          'v-divider': true,
          'v-divider--inset': this.inset,
          'v-divider--vertical': this.vertical
        },
        attrs: {
          role: 'separator',
          'aria-orientation': orientation,
          ...this.$attrs
        },
        on: this.$listeners
      })
    )
  }
}
</script>

<style lang="scss">
$divider-inset-margin: 72px !default;
$divider-inset-margin-top: 8px !default;
$divider-inset-max-height: calc(100% - 16px) !default;
hr.v-divider {
  border-color: rgba(0, 0, 0, 0.12);
  background: none;
  opacity: 1;
}
.v-divider {
  display: block;
  flex: 1 1 0;
  max-width: 100%;
  height: 0;
  max-height: 0;
  border: solid;
  border-width: thin 0 0 0;
  transition: inherit;
  &--inset:not(.v-divider--vertical) {
    max-width: calc(100% - #{$divider-inset-margin});
    margin-left: $divider-inset-margin;
    margin-right: $divider-inset-margin;
  }
  &--vertical {
    align-self: stretch;
    border: solid;
    border-width: 0 thin 0 0;
    display: inline-flex;
    height: inherit;
    min-height: 100%;
    max-height: 100%;
    max-width: 0;
    width: 0;
    margin-top: 0;
    margin-bottom: 0;
    vertical-align: text-bottom;
    &.v-divider--inset {
      margin-top: $divider-inset-margin-top;
      min-height: 0;
      max-height: $divider-inset-max-height;
    }
  }
}
</style>

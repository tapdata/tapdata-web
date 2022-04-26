<script>
import { Button } from 'element-ui'
export default {
  name: 'VButton',
  props: {
    ...Button.props,
    autoLoading: {
      type: Boolean,
      default: false
    },
    innerLoading: {
      type: Boolean,
      default: false
    },
    loadingColor: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      comLoading: false,
      '--my-color': 'red'
    }
  },
  render(h) {
    this.$nextTick(() => {
      const $span = this.$el?.querySelector?.('span')
      if ($span) {
        $span.setAttribute('data-content', $span.innerText)
      }
    })
    const resetLoading = (flag = false) => {
      this.comLoading = flag
    }
    const clickFnc = () => {
      if (this.autoLoading) {
        this.comLoading = true
      }
      if (this.$props.disabled) {
        return
      }
      this.$listeners.click?.(resetLoading)
    }
    let className = 'v-button'
    if (this.innerLoading) {
      className += 'inner-loading loader-width'
    }
    return h(
      'el-button',
      {
        props: {
          ...this.$props,
          loading: this.$props.loading || this.comLoading,
          size: this.$props.size || 'mini'
        },
        on: { ...this.$listeners, click: clickFnc },
        class: className
      },
      [this.$slots.default]
    )
  }
}
</script>
<style lang="scss">
.v-button {
  &.el-button--mini,
  &.el-button--mini:focus,
  &.el-button--mini.is-active,
  &.el-button--mini:active {
    min-width: 80px;
    height: 28px;
    line-height: 28px;
    padding: 0 15px;
    &:hover {
      border-color: map-get($color, primary);
    }
  }
  &.el-button--primary,
  &.el-button--primary:focus,
  &.el-button--primary.is-active,
  &.el-button--primary:active {
    background-color: map-get($color, primary);
    &:hover {
      background-color: map-get($color, dprimary);
    }
  }
  &.is-disabled,
  &.is-disabled:hover {
    color: #000;
    background: #f7f7f7;
    border-radius: 4px;
    opacity: 0.5;
    border: 1px solid #d9d9d9;
  }
  & + & {
    margin-left: 16px;
  }
  &.el-button--text,
  &.el-button--text:focus,
  &.el-button--text:active,
  &.el-button--text.is-active {
    min-width: unset;
  }
  &.is-loading.loader-width span {
    position: relative;
    display: inline-block;
  }
  &.is-loading.loader-width span:after {
    content: attr(data-content);
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    color: map-get($color, disable);
    width: 100%;
    height: 100%;
    overflow: hidden;
    animation: showWidthAll 4s linear infinite;
  }
  &.inner-loading {
    .el-icon-loading {
      display: none;
    }
    [class*='el-icon-'] + span {
      margin-left: 0;
    }
  }
}
</style>

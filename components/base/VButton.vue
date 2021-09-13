<script>
import { Button } from 'element-ui'
export default {
  name: 'VButton',
  props: {
    ...Button.props
  },
  render(h) {
    return h('span', { class: 'v-button' }, [
      h(
        'el-button',
        {
          props: {
            ...this.$props,
            size: this.$props.size || 'mini'
          },
          on: this.$listeners
        },
        [this.$slots.default]
      )
    ])
  }
}
</script>
<style lang="scss">
.v-button {
  .el-button--mini,
  .el-button--mini:focus,
  .el-button--mini.is-active,
  .el-button--mini:active {
    min-width: 80px;
    padding: 7.5px 0;
    &:hover {
      border-color: map-get($color, primary);
    }
  }
  .el-button--primary,
  .el-button--primary:focus,
  .el-button--primary.is-active,
  .el-button--primary:active {
    background-color: map-get($color, primary);
    &:hover {
      background-color: map-get($color, dprimary);
    }
  }
  .is-disabled,
  .is-disabled:hover {
    color: #000;
    background: #f7f7f7;
    border-radius: 4px;
    opacity: 0.5;
    border: 1px solid #d9d9d9;
  }
}
</style>

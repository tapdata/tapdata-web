<template>
  <el-tooltip
    placement="top"
    manual
    :content="$t('dialog_tip_copied')"
    popper-class="copy-tooltip"
    :value="showTooltip"
  >
    <i
      class="buton-icon iconfont icon-fuzhi1"
      v-clipboard:copy="value"
      v-clipboard:success="onCopy"
      @mouseleave="showTooltip = false"
    ></i>
  </el-tooltip>
</template>
<style lang="scss" scoped>
.buton-icon {
  cursor: pointer;
}
</style>
<script>
export default {
  name: 'ClipButton',
  props: ['value', 'copyClass'],
  data() {
    return {
      showTooltip: false
    }
  },
  methods: {
    onCopy() {
      this.showTooltip = true
    }
  }
}
</script>

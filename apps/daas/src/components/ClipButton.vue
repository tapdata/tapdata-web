<template>
  <el-tooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
    <i
      :class="[{ copyClass: copyClass }, 'iconfont', 'icon-fuzhi1']"
      v-clipboard:copy="value"
      v-clipboard:success="onCopy"
      @mouseleave="showTooltip = false"
    ></i>
  </el-tooltip>
</template>

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

<style lang="scss" scoped>
.el-icon-document-copy {
  color: #999;
  margin-left: 10px;
  cursor: pointer;
  &:hover {
    color: #333;
  }
}
.copyClass {
  padding: 6px;
  margin-left: 7px;
  font-size: 12px;
  cursor: pointer;
  color: #606266;
  border-radius: 3px;
  border: 1px solid #dcdfe6;
}
</style>
<style lang="scss">
.el-tooltip__popper.is-dark.copy-tooltip {
  background: #303133 !important;
  color: #fff !important;
}
</style>

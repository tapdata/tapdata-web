<template>
  <div class="collapse-panel">
    <ElCollapse :value="active">
      <ElCollapseItem name="1">
        <template #title>
          <div class="slot__header flex justify-content-between align-items-center flex-1">
            <slot name="header"></slot>
            <div class="slot__header-right">
              <slot name="header-right"></slot>
            </div>
          </div>
        </template>
        <slot name="content"></slot>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<script>
export default {
  name: 'CollapsePanel',

  props: {
    active: {
      type: String,
      default: '1'
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse-panel {
  ::v-deep {
    .el-collapse {
      border-bottom: none;
      .el-collapse-item {
        .el-collapse-item__header {
          padding: 0 !important;
          border-bottom: none;
          height: inherit;
          line-height: inherit;
          &:hover {
            background-color: inherit;
          }
        }
        .el-collapse-item__content {
          color: #535f72;
          font-size: 12px;
          line-height: inherit;
        }
      }
    }
  }
}
.slot__header {
  height: inherit;
}
</style>

<script>
export default {
  name: 'VCollapse',

  props: {
    active: {
      type: String,
      default: '1',
    },
  },
}
</script>

<template>
  <ElCollapse :model-value="active" accordion class="collapse-fill">
    <ElCollapseItem name="1">
      <template #title>
        <div
          class="slot__header flex justify-content-between align-items-center flex-1"
        >
          <slot name="header" />
          <div class="slot__header-right">
            <slot name="header-right" />
          </div>
        </div>
      </template>
      <slot name="content" />
    </ElCollapseItem>
  </ElCollapse>
</template>

<style lang="scss" scoped>
$headerH: 34px;

.el-collapse {
  border-top: 0;

  &:deep(.collapse-fill) {
    .el-collapse-item:first-child:last-child {
      height: 100%;
      .el-collapse-item__wrap {
        height: calc(100% - #{$headerH - 1});
      }
      .el-collapse-item__content {
        height: 100%;
      }
    }
  }

  :deep(.el-collapse-item) {
    .el-collapse-item__header {
      padding-left: 16px;
      padding-right: 16px;
      height: $headerH;

      &:hover {
        background-color: #fafafa;
      }

      &.is-active {
        border-bottom-color: #ebeef5;
      }
    }

    .el-collapse-item__arrow {
      order: -1;
    }

    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
}
.el-collapse-item {
  &.is-active [role='tab'] {
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
.slot__header {
  height: inherit;
  width: 100%;
}
</style>

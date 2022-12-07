<template>
  <ElCollapse :value="active" accordion class="collapse-fill">
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
</template>

<script>
export default {
  name: 'VCollapse',

  props: {
    active: {
      type: String,
      default: '1'
    }
  }
}
</script>

<style lang="scss" scoped>
$headerH: 34px;

.el-collapse {
  ::v-deep {
    border-top: 0;
    &.collapse-fill {
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

    .el-collapse-item {
      &__header {
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

      &__arrow {
        order: -1;
        &:before {
          content: '\e791';
        }
      }

      &__content {
        padding-bottom: 0;
      }
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

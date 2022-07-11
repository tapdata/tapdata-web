<template>
  <section
    v-show="isShow"
    class="config-panel border-start flex-column"
    :class="{ flex: isShow, 'show-settings': isShow }"
  >
    设置
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import focusSelect from 'web-core/directives/focusSelect'
import Locale from '../../mixins/locale'

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect
  },

  mixins: [Locale],

  data() {
    return {
      currentTab: '0',
      name: this.activeNode?.name
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    isShow() {
      return this.activeType?.includes('settings')
    }
  },

  watch: {
    'activeNode.name'(v) {
      this.name = v
    }
  },

  methods: {
    ...mapMutations('dataflow', ['updateNodeProperties', 'setNodeError', 'clearNodeError', 'setActiveType']),
    ...mapActions('dataflow', ['updateDag']),

    handleChangeName(name) {
      if (name) {
        this.updateNodeProperties({
          id: this.activeNode.id,
          properties: {
            name
          }
        })
        this.updateDag()
      } else {
        this.name = this.activeNode.name
      }
    },

    handleClosePanel() {
      this.setActiveType(null)
    },

    async validateForm() {
      await this.$refs.formPanel?.validate()
    }
  }
}
</script>

<style lang="scss">
.databaseLinkDialog {
  .e-row {
    padding: 0 50px;
  }

  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
<style scoped lang="scss">
$color: map-get($color, primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;

.title-input-wrap {
  position: relative;
  flex: 1;
  font-size: 14px;
  min-width: 0;
  color: map_get($fontColor, normal);
  &:hover {
    .title-input {
      border-color: #dcdfe6;
    }
    .v-icon {
      color: $color;
    }
  }

  .title-input {
    position: relative;
    padding: 2px 28px 1px 8px;
    width: 100%;
    height: 28px;
    line-height: 28px;
    outline: none;
    box-shadow: none;
    background: 0 0;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: inherit;
    transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

    &:focus {
      border-color: #409eff;
      & + .title-input-icon {
        color: $color;
      }
    }
  }

  .title-input-icon {
    height: 28px;
  }
}

.config-panel {
  position: relative;
  z-index: 10;
  width: 640px;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: width;

  &.show-settings {
    width: 320px;
  }

  &-close {
  }

  .config-tabs-wrap {
    position: relative;
    height: 100%;
  }

  .panel-header {
    height: $headerHeight;

    .el-image {
      width: 20px;
      height: 20px;
    }
  }

  .panel-content {
    position: relative;
    overflow: hidden;
  }

  .header-icon {
    color: $color;
    font-size: 18px;
  }

  .setting-panel-wrap {
    position: absolute;
    z-index: 10;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #fff;
  }

  ::v-deep {
    .config-tabs.el-tabs {
      height: 100%;

      > .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          padding-left: $tabsHeaderWidth + 32px;
          padding-right: 16px;

          &::after {
            height: 1px;
          }
        }
        .el-tabs__active-bar {
          background-color: $color;
        }

        .el-tabs__item {
          font-weight: 400;

          &.is-active,
          &:hover {
            color: $color;
          }
        }
      }

      > .el-tabs__content {
        height: calc(100% - 40px);
        .el-tab-pane {
          height: 100%;
        }
      }
    }

    .resize-trigger {
      background: 0 0 !important;
    }
  }
}
</style>

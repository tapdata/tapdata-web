<template>
  <section
    v-show="activeType"
    class="config-panel border-start flex-column"
    :class="{ flex: activeType, 'show-settings': activeType === 'settings' }"
  >
    <div class="panel-header flex align-center px-4 border-bottom">
      <template v-if="activeType !== 'settings'">
        <NodeIcon class="mr-2" :node="activeNode" />
        <div class="title-input-wrap flex align-center flex-shrink-0 h-100">
          <input
            ref="nameInput"
            v-focus-select
            :value="activeNode ? activeNode.name : ''"
            class="title-input text-truncate"
            @change="handleChangeName"
          />
          <VIcon v-if="!stateIsReadonly" @click="focusNameInput" class="title-input-icon" size="14">edit-outline</VIcon>
        </div>
      </template>
      <div v-else class="title-input-wrap flex align-center flex-shrink-0 h-100">任务设置</div>

      <VIcon class="ml-3" size="16" @click="handleClosePanel">close</VIcon>
    </div>

    <div class="panel-content flex-1">
      <FormPanel v-show="activeType !== 'settings'" v-on="$listeners" v-bind="$attrs" ref="formPanel"></FormPanel>

      <SettingPanel v-bind="$attrs" v-on="$listeners" v-if="activeType === 'settings'" />
    </div>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import FormPanel from '../FormPanel'
import VIcon from 'web-core/components/VIcon'
import focusSelect from 'web-core/directives/focusSelect'
import NodeIcon from '../NodeIcon'
import SettingPanel from './SettingPanel'

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect
  },

  data() {
    return {
      currentTab: '0'
    }
  },

  components: { SettingPanel, NodeIcon, VIcon, /*DataPane,*/ FormPanel },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly'])
  },

  methods: {
    ...mapMutations('dataflow', ['updateNodeProperties', 'setNodeError', 'clearNodeError', 'setActiveType']),

    handleChangeName(e) {
      this.updateNodeProperties({
        id: this.activeNode.id,
        properties: {
          name: e.target.value
        }
      })
    },

    focusNameInput() {
      this.$refs.nameInput.focus()
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

  &:hover {
    .title-input {
      border-color: #dcdfe6;
    }
    .title-input-icon {
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
    position: absolute;
    right: 8px;
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

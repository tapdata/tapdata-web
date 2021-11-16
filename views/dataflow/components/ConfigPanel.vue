<template>
  <section
    v-show="isMonitor || activeType"
    v-resize.top="{
      minHeight: 40
    }"
    class="config-panel border-top"
  >
    <div v-if="activeType === 'settings'" class="h-100 flex flex-column overflow-hidden">
      <SettingPanel v-on="$listeners"></SettingPanel>
      <!-- <div class="panel-header flex align-center px-4 border-bottom fs-7">
        <VIcon class="header-icon mr-2">setting</VIcon>
        设置
      </div> -->
      <!-- <div class="flex-1 position-relative">
        <FormPanel v-on="$listeners"></FormPanel>
      </div> -->
    </div>
    <div v-else class="config-tabs-wrap">
      <div class="tabs-header flex align-center px-4">
        <VIcon class="header-icon mr-2">{{ icon }}</VIcon>
        <div class="title-input-wrap flex align-center flex-shrink-0 h-100">
          <input
            ref="nameInput"
            v-focus-select
            :value="activeNode ? activeNode.name : ''"
            :readonly="isMonitor"
            class="title-input text-truncate"
            @change="handleChangeName"
          />
          <VIcon @click="focusNameInput" class="title-input-icon" size="14">edit-outline</VIcon>
        </div>
      </div>
      <ElTabs v-model="currentTab" class="config-tabs">
        <ElTabPane label="属性设置">
          <FormPanel v-on="$listeners"></FormPanel>
        </ElTabPane>
        <ElTabPane label="元数据">
          <MetaPane></MetaPane>
        </ElTabPane>
        <ElTabPane label="数据详情">
          <DataPane></DataPane>
        </ElTabPane>
      </ElTabs>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import FormPanel from 'web-core/views/dataflow/components/FormPanel'
import SettingPanel from 'web-core/views/dataflow/components/SettingPanel'
import DataPane from 'web-core/views/dataflow/components/DataPane'
import MetaPane from 'web-core/views/dataflow/components/MetaPane'
import VIcon from 'web-core/components/VIcon'
import { NODE_TYPE_ICON } from 'web-core/views/dataflow/constants'
import focusSelect from 'web-core/directives/focusSelect'
import { validateBySchema } from 'web-core/components/form/utils/validate'

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect
  },

  props: {
    isMonitor: Boolean
  },

  data() {
    return {
      currentTab: '0'
    }
  },

  components: { VIcon, MetaPane, DataPane, FormPanel, SettingPanel },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'settingPanelType']),

    icon() {
      return this.activeNode ? NODE_TYPE_ICON[this.activeNode.type] : null
    }
  },

  watch: {
    async 'activeNode.id'(n, o) {
      // console.log('activeNode.id', n, o)
      if (o) {
        const node = this.nodeById(o)
        try {
          await validateBySchema(node.__Ctor.formSchema, node)
          // console.log('上一个激活的节点校验结果', result)
          this.clearNodeError(o)
        } catch (e) {
          this.setNodeError(o)
        }
        // console.log('上一个激活的节点校验结果', result)
      }
    }
  },

  methods: {
    ...mapMutations('dataflow', ['updateNodeProperties', 'setNodeError', 'clearNodeError']),

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
  font-size: 13px;

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
  height: 300px;
  overflow: auto;
  background-color: #eff1f4;
  transition: height 0.24s;
  will-change: height;

  .config-tabs-wrap {
    position: relative;
    height: 100%;
  }

  .tabs-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: $tabsHeaderWidth;
    height: $headerHeight;
  }

  .panel-header {
    height: $headerHeight;
  }

  .header-icon {
    color: $color;
    font-size: 18px;
  }
  .setting-tabs {
    ::v-deep {
      .el-tabs__content {
        height: calc(100% - 55px);
        .el-tab-pane {
          height: 100%;
          .setting-tabs-box {
            box-sizing: border-box;
            .title {
              height: 40px;
              line-height: 40px;
            }
            textarea {
              border: 1px solid #d9d9d9;
              min-width: 600px;
              min-height: 100px;
              &:focus {
                outline: initial;
              }
            }
          }
        }
      }
    }
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

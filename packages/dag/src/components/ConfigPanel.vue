<template>
  <section
    v-show="showPanel"
    v-resize.top="{
      minHeight: 40
    }"
    class="config-panel border-top"
  >
    <VIcon class="config-panel-close" size="16" @click="handleClosePanel">close</VIcon>
    <div
      v-if="!onlyNode && activeType === 'settings'"
      class="h-100 flex flex-column overflow-hidden setting-panel-wrap"
    >
      <SettingPanel v-bind="$attrs" v-on="$listeners"></SettingPanel>
    </div>
    <div class="config-tabs-wrap">
      <div class="tabs-header flex align-center px-4">
        <NodeIcon v-if="activeNode" class="mr-2" :node="activeNode" />
        <TextEditable ref="nameInput" v-model="name" class="flex-1 min-w-0" @change="handleChangeName" />
      </div>
      <ElTabs v-model="currentTab" class="config-tabs">
        <!--属性设置-->
        <ElTabPane :label="$t('dag_property_setting')">
          <FormPanel
            v-on="$listeners"
            v-bind="$attrs"
            ref="formPanel"
            @update:InputsOrOutputs="handleLoadMeta"
          ></FormPanel>
        </ElTabPane>
        <!--元数据-->
        <ElTabPane :label="$t('dag_meta_data')">
          <MetaPane ref="metaPane" :is-show="currentTab === '1'"></MetaPane>
        </ElTabPane>
        <!--<ElTabPane label="数据详情">
          <DataPane></DataPane>
        </ElTabPane>-->
        <!--        <ElTabPane label="pdk">-->
        <!--          <PdkPane v-on="$listeners" v-bind="$attrs" ref="pdkPane"></PdkPane>-->
        <!--        </ElTabPane>-->
      </ElTabs>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import '@tap/component/src/directives/resize/index.scss'
import resize from '@tap/component/src/directives/resize'
import FormPanel from './FormPanel'
import SettingPanel from './SettingPanel'
import MetaPane from './MetaPane'
import { VIcon } from '@tap/component'
import focusSelect from '@tap/component/src/directives/focusSelect'
import NodeIcon from './NodeIcon'
import { TextEditable } from '@tap/component'

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect
  },

  props: {
    onlyNode: Boolean
  },

  data() {
    return {
      currentTab: '0',
      name: this.activeNode?.name
    }
  },

  components: { TextEditable, NodeIcon, VIcon, MetaPane, FormPanel, SettingPanel },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion']),

    icon() {
      return this.getIcon(this.activeNode)
    },

    showPanel() {
      return this.onlyNode ? this.activeType === 'node' : this.activeType
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
        /*this.updateNodeProperties({
          id: this.activeNode.id,
          properties: {
            name
          }
        })*/
        this.$refs.formPanel?.form.setValuesIn('name', name)
        // this.updateDag()
      } else {
        this.name = this.activeNode.name
      }
    },

    focusNameInput() {
      this.$refs.nameInput.focus()
    },

    handleClosePanel() {
      this.setActiveType(null)
    },

    async validateForm() {
      await this.$refs.formPanel?.validate()
    },

    handleLoadMeta() {
      let watcher = this.$watch('editVersion', () => {
        watcher()
        const metaPane = this.$refs.metaPane
        if (metaPane && this.currentTab === '1') {
          metaPane.loadFields()
        }
      })
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
$tabsHeaderWidth: 220px;
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
  height: 40vh;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: height;

  &-close {
    position: absolute;
    z-index: 11;
    top: 12px;
    right: 16px;
  }

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

    .el-image {
      width: 20px;
      height: 20px;
    }
  }

  .panel-header {
    height: $headerHeight;
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
          padding-left: $tabsHeaderWidth;
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

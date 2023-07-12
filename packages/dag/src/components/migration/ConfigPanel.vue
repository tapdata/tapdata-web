<template>
  <section
    v-show="showPanel"
    class="config-panel border-start flex-column"
    :class="{ flex: showPanel, 'show-settings': activeType === 'settings' }"
  >
    <NodeIcon v-if="activeNode" v-show="activeType === 'node'" class="config-node-icon" :node="activeNode" />
    <FormPanel
      class="config-form-panel"
      v-show="activeType !== 'settings'"
      v-on="$listeners"
      v-bind="$attrs"
      ref="formPanel"
      :formProps="{
        colon: false,
        shallow: false,
        layout: 'vertical',
        feedbackLayout: 'terse'
      }"
      @update:InputsOrOutputs="handleLoadMeta"
      @setSchema="handleSetSchema"
    />
    <SettingPanel
      v-if="settings.id"
      class="config-form-panel"
      :settings="settings"
      v-show="activeType === 'settings'"
      v-on="$listeners"
      v-bind="$attrs"
      ref="settingFormPanel"
    ></SettingPanel>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { cloneDeep } from 'lodash'

import '@tap/component/src/directives/resize/index.scss'
import resize from '@tap/component/src/directives/resize'
import FormPanel from '../FormPanel'
import focusSelect from '@tap/component/src/directives/focusSelect'
import NodeIcon from '../NodeIcon'
import SettingPanel from './SettingPanel'
import MetaPane from '../MetaPane'
import AlarmPanel from './AlarmPanel'
import MigrateMetaPane from './MigrateMetaPane'

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect
  },

  props: {
    settings: Object,
    onlySetting: Boolean,
    showSchemaPanel: Boolean,
    includesType: {
      type: Array,
      default: () => ['node', 'settings']
    },
    syncType: String
  },

  data() {
    return {
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      currentTab: 'settings',
      titleCurrentTab: 'settings',
      name: this.activeNode?.name,
      form: null
    }
  },

  components: { MetaPane, SettingPanel, NodeIcon, FormPanel, AlarmPanel, MigrateMetaPane },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion']),

    showPanel() {
      return this.onlySetting ? this.activeType === 'settings' : this.includesType.includes(this.activeType)
    },

    isMonitor() {
      return ['TaskMonitor', 'MigrationMonitor'].includes(this.$route.name)
    }
  },

  watch: {
    'activeNode.name'(v) {
      this.name = v
    }
  },

  mounted() {
    this.titleCurrentTab = this.isMonitor ? 'alarm' : 'settings'
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
      } else {
        this.name = this.activeNode.name
      }
    },

    handleClosePanel() {
      this.setActiveType(null)
    },

    async validateForm() {
      await this.$refs.formPanel?.validate()
    },

    async validateSetting() {
      await this.$refs.setting?.form.validate()
    },

    handleLoadMeta() {
      let watcher = this.$watch('editVersion', () => {
        watcher()
        const metaPane = this.$refs.metaPane
        if (metaPane && this.currentTab === 'meta') {
          metaPane[this.syncType === 'sync' ? 'loadFields' : 'loadData']()
        }
      })
    },

    handleSetSchema() {
      this.form = cloneDeep(this.$refs.formPanel?.form)
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
  z-index: 11;
  width: 680px;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: width;

  &.show-settings {
    width: 440px;
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

  .config-node-icon {
    position: absolute;
    left: 16px;
    top: 8px;
    width: 20px;
    height: 20px;
  }

  .config-form-panel {
    ::v-deep {
      .attr-panel-body {
        padding: 0 !important;

        .form-wrap {
          min-height: 0;

          .config-tabs-decorator {
            height: 100%;
            > .formily-element-form-item-control {
              height: 100%;
              > .formily-element-form-item-control-content {
                height: 100%;
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
          padding-left: 52px;
          padding-right: 16px;

          &::after {
            height: 1px;
          }
        }
        .el-tabs__active-bar {
          background-color: $color;
        }

        .el-tabs__item {
          //padding: 0 12px;
          font-weight: 400;

          &.is-active,
          &:hover {
            color: $color;
          }
        }
      }

      > .el-tabs__content {
        height: calc(100% - 36px);
        padding: 4px 16px;
        overflow: auto;
        .el-tab-pane {
          height: 100%;
        }
      }
    }

    .setting-tabs.el-tabs {
      height: 100%;
      > .el-tabs__header {
        .el-tabs__nav-wrap {
          padding-left: 0;
          &::after {
            height: 0;
          }
        }
      }
    }
  }
}
</style>

<script>
import focusSelect from '@tap/component/src/directives/focusSelect'
import resize from '@tap/component/src/directives/resize'

import { cloneDeep } from 'lodash-es'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import FormPanel from '../FormPanel'
import NodeIcon from '../NodeIcon'
import SettingPanel from './SettingPanel'
import '@tap/component/src/directives/resize/index.scss'

export default {
  name: 'ConfigPanel',

  directives: {
    resize,
    focusSelect,
  },

  components: { SettingPanel, NodeIcon, FormPanel },

  props: {
    settings: Object,
    onlySetting: Boolean,
    showSchemaPanel: Boolean,
    includesType: {
      type: Array,
      default: () => ['node', 'settings'],
    },
    syncType: String,
  },

  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      currentTab: 'settings',
      titleCurrentTab: 'settings',
      name: this.activeNode?.name,
    }
  },

  computed: {
    ...mapGetters('dataflow', [
      'activeType',
      'activeNode',
      'nodeById',
      'stateIsReadonly',
    ]),
    ...mapState('dataflow', ['editVersion', 'materializedViewVisible']),

    showPanel() {
      return this.onlySetting
        ? this.activeType === 'settings'
        : this.includesType.includes(this.activeType)
    },

    isMonitor() {
      return ['TaskMonitor', 'MigrationMonitor'].includes(this.$route.name)
    },
  },

  watch: {
    'activeNode.name': function (v) {
      this.name = v
    },
  },

  mounted() {
    this.titleCurrentTab = this.isMonitor ? 'alarm' : 'settings'
  },

  methods: {
    ...mapMutations('dataflow', [
      'updateNodeProperties',
      'setNodeError',
      'clearNodeError',
      'setActiveType',
      'setMaterializedViewVisible',
    ]),
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
      await this.$refs.setting?.validate()
    },

    handleLoadMeta() {
      const watcher = this.$watch('editVersion', () => {
        watcher()
        const metaPane = this.$refs.metaPane
        if (metaPane && this.currentTab === 'meta') {
          metaPane[this.syncType === 'sync' ? 'loadFields' : 'loadData']()
        }
      })
    },
  },
}
</script>

<template>
  <section
    v-show="showPanel"
    class="config-panel border-start flex-column"
    :class="{ flex: showPanel, 'show-settings': activeType === 'settings' }"
  >
    <div
      v-if="activeNode"
      class="position-absolute config-tabs-left-extra align-center"
      :class="activeType === 'node' ? 'flex' : 'none'"
    >
      <NodeIcon :node="activeNode" :size="24" />
    </div>
    <div
      v-if="activeNode && activeNode.type === 'merge_table_processor'"
      class="position-absolute config-tabs-right-extra flex align-center"
    >
      <ElButton
        class="--with-icon flex align-center px-2 py-0 gap-1"
        @click="setMaterializedViewVisible(true)"
      >
        <VIcon size="30">beta</VIcon>
        {{ $t('packages_dag_materialized_view') }}</ElButton
      >
    </div>

    <FormPanel
      v-if="!materializedViewVisible"
      v-show="activeType !== 'settings'"
      v-bind="$attrs"
      ref="formPanel"
      class="config-form-panel"
      :form-props="{
        colon: false,
        shallow: false,
        layout: 'vertical',
        feedbackLayout: 'terse',
      }"
      @update:inputs-or-outputs="handleLoadMeta"
    />
    <SettingPanel
      v-if="settings.id"
      v-show="activeType === 'settings'"
      v-bind="$attrs"
      ref="setting"
      class="config-form-panel"
      :settings="settings"
    />
  </section>
</template>

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

<style lang="scss" scoped>
$color: map.get($color, primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;
$tabHeight: 44px;

.el-button.--with-icon {
  > :deep(span) {
    display: contents;
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
    //width: 440px;
    width: 640px;
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

  .config-tabs-left-extra {
    height: $tabHeight;
    left: 14px;
    z-index: 1;
  }

  .config-tabs-right-extra {
    height: $tabHeight;
    right: 16px;
    z-index: 2;
  }

  .config-form-panel {
    :deep(.attr-panel-body) {
      padding: 0 !important;

      .form-wrap {
        min-height: 0;

        .config-tabs-decorator {
          height: 100%;
          > .formily-element-plus-form-item-control {
            height: 100%;
            > .formily-element-plus-form-item-control-content {
              height: 100%;
            }
          }
        }
      }
    }
  }

  :deep(.el-tabs.config-tabs) {
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
        line-height: $tabHeight;
        height: $tabHeight;
        font-weight: 400;

        &.is-active,
        &:hover {
          color: $color;
        }
      }
    }

    > .el-tabs__content {
      height: calc(100% - $tabHeight);
      padding: 0 16px;
      overflow: auto;
      .el-tab-pane {
        // height: 100%;
        display: contents;
      }
    }
  }

  :deep(.setting-tabs.el-tabs) {
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
</style>

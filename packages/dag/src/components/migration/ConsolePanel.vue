<template>
  <section
    v-if="showConsole"
    v-resize.top="{
      minHeight: 40
    }"
    class="console-panel border-top flex"
  >
    <div class="console-panel-side border-end">
      <div class="console-panel-header p-4">信息输出</div>
      <div class="step-list px-2">
        <div
          class="step-list-header step-item px-2 mb-2 flex align-center"
          :class="{ active: !currentType }"
          @click="currentType = ''"
        >
          <!--<div class="step-expand-icon">
            <VIcon>arrow-right</VIcon>
          </div>-->
          <VIcon size="20">folder</VIcon>任务
        </div>
        <div
          class="step-item px-2 mb-2 pl-6"
          s
          :class="{ active: currentType === 'settings' }"
          @click="currentType = 'settings'"
        >
          任务设置检测
        </div>
        <div
          class="step-item px-2 mb-2 pl-6"
          :class="{ active: currentType === 'sourceNodes' }"
          @click="currentType = 'sourceNodes'"
        >
          源节点设置检测
        </div>
        <div
          class="step-item px-2 mb-2 pl-6"
          :class="{ active: currentType === 'targetNodes' }"
          @click="currentType = 'targetNodes'"
        >
          目标节点设置检测
        </div>
      </div>
    </div>
    <div class="flex-1 p-4">
      <ElCheckboxGroup v-model="levels" :min="1" size="mini" class="inline-flex">
        <ElCheckbox label="INFO">INFO</ElCheckbox>
        <ElCheckbox label="WARN">WARN</ElCheckbox>
        <ElCheckbox label="ERROR">ERROR</ElCheckbox>
      </ElCheckboxGroup>
      <div class="log-list-wrap">
        <code class="log-list rounded-2">
          <pre class="log-list-item"><span class="log-list-item-level">[INFO]</span></pre>
        </code>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import Locale from '../../mixins/locale'
import VIcon from 'web-core/components/VIcon'

export default {
  name: 'ConsolePanel',

  directives: {
    resize
  },

  mixins: [Locale],

  components: { VIcon },

  data() {
    return {
      currentType: '',
      levels: ['INFO', 'WARN', 'ERROR']
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly']),
    ...mapState('dataflow', ['editVersion', 'showConsole']),

    icon() {
      return this.getIcon(this.activeNode)
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

.console-panel {
  position: relative;
  z-index: 10;
  height: 40vh;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: height;

  &-side {
    width: 240px;
  }

  &-header {
    font-size: 13px;
  }

  .step-item {
    line-height: 32px;
    border-radius: 6px;
    cursor: pointer;

    &:hover,
    &.active {
      background-color: #edf1f9;
    }
  }

  .log-list-wrap {
    .log-list {
      background-color: rgba(229, 236, 255, 0.22);
    }
  }

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

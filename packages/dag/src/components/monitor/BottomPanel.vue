<template>
  <section class="bottom-panel border-top flex-column">
    <Log v-if="onlyLog" v-bind="$attrs" :currentTab="currentTab"></Log>
    <div v-else class="panel-header flex pr-4 h-100">
      <ElTabs v-model="currentTab" class="setting-tabs h-100 flex-1 flex flex-column">
        <ElTabPane label="日志" name="log">
          <Log v-bind="$attrs" :currentTab="currentTab"></Log>
        </ElTabPane>
        <ElTabPane label="运行记录" name="record">
          <Record v-bind="$attrs" :currentTab="currentTab"></Record>
        </ElTabPane>
      </ElTabs>

      <VIcon class="mt-3" size="16" @click="$emit('showBottomPanel')">close</VIcon>
    </div>
  </section>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import 'web-core/directives/resize/index.scss'
import resize from 'web-core/directives/resize'
import focusSelect from 'web-core/directives/focusSelect'
import Locale from '../../mixins/locale'
import Log from './components/Log'
import Record from './components/Record'

export default {
  name: 'ConfigPanel',

  components: { Log, Record },

  directives: {
    resize,
    focusSelect
  },

  mixins: [Locale],

  props: {
    onlyLog: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      currentTab: 'log',
      name: this.activeNode?.name
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'nodeById', 'stateIsReadonly'])
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

    async validateForm() {
      await this.$refs.formPanel?.validate()
    }
  }
}
</script>

<style scoped lang="scss">
$color: map-get($color, primary);
$tabsHeaderWidth: 180px;
$headerHeight: 40px;

.bottom-panel {
  position: relative;
  z-index: 10;
  height: 328px;
  min-height: 328px;
  //height: 100%;
  overflow: auto;
  background-color: #fff;
  //transition: height 0.24s;
  will-change: width;

  &.show-record {
    width: 320px;
  }

  &-close {
  }

  .el-tabs {
    ::v-deep {
      .el-tabs__header {
        margin: 0;
        padding-left: 16px;
      }
      .el-tabs__content {
        flex: 1;
      }
      .el-tab-pane {
        height: 100%;
      }
    }
  }

  .config-tabs-wrap {
    position: relative;
    height: 100%;
  }

  .panel-header {
    //height: $headerHeight;

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

<template>
  <section
    v-show="isMonitor || activeType"
    v-resize.top="{
      minHeight: 40
    }"
    class="config-panel border-top"
  >
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
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import '@/directives/resize/index.scss'
import resize from '@/directives/resize'
import FormPanel from 'web-core/views/dataflow/components/FormPanel'
import DataPane from 'web-core/views/dataflow/components/DataPane'
import MetaPane from 'web-core/views/dataflow/components/MetaPane'

export default {
  name: 'ConfigPanel',

  directives: {
    resize
  },

  props: {
    isMonitor: Boolean
  },

  data() {
    return {
      currentTab: '0'
    }
  },

  components: { MetaPane, DataPane, FormPanel },

  computed: {
    ...mapGetters('dataflow', ['activeType'])
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
//$color: #2c65ff;
$color: var(--primary);

.config-panel {
  position: relative;
  z-index: 10;
  height: 300px;
  overflow: auto;
  transition: height 0.24s;
  will-change: height;

  ::v-deep {
    .config-tabs.el-tabs {
      height: 100%;

      > .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          padding: 0 16px;

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

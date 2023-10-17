<template>
  <List :route="route" :task-buried="taskBuried" :sync-type="syncType"></List>
</template>

<script>
import List from './List'

export default {
  name: 'TaskList',
  components: { List },

  data() {
    return {
      syncType: 'sync',
      taskBuried: {
        new: 'taskCreate',
        newFail: 'taskCreateAgentFail',
        start: 'taskStart',
      },
      route: {
        new: 'DataflowNew',
        editor: 'DataflowEditor',
        monitor: 'TaskMonitor',
      },
    }
  },
}
</script>

<style lang="scss" scoped>
.data-flow-wrap {
  height: 100%;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .data-flow-list {
    .search-bar {
      display: flex;
      flex-wrap: wrap;
      li {
        margin-right: 10px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
    .buttons {
      white-space: nowrap;
      .btn + .btn {
        margin-left: 12px;
      }
      .btn {
        i.iconfont {
          font-size: 12px;
        }
        &.btn-dropdowm {
          margin-left: 12px;
        }
        &.btn-create {
          margin-left: 12px;
        }
        &.btn-createText {
          margin-left: 12px;
        }
      }
    }
    .dataflow-name {
      .tag {
        margin-left: 5px;
        color: map-get($fontColor, light);
        background: map-get($bgColor, main);
        border: 1px solid #dedee4;
      }
      .name {
        &:not(.has-children) {
          cursor: pointer;
          // text-decoration: underline;
        }
      }
    }
    .table-operations {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    .el-table {
      ::v-deep {
        .el-table__cell {
          padding: 10px 0;
        }
      }
    }
  }
}
</style>

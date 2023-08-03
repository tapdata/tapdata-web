<template>
  <div class="flex flex-column h-100 overflow-hidden">
    <div class="bg-white rounded-lg mb-2 flex align-center">
      <span class="page-header-title font-color-dark">{{ $t($route.meta.title) }}</span>
      <span class="fs-7 font-color-light">{{ $t($route.meta.desc) }}</span>
      <div class="flex-grow-1"></div>
      <el-radio-group v-model="viewType" class="mr-4 view-radio-group">
        <el-radio-button label="board">
          <VIcon class="align-top">swimlane</VIcon>
          Board
        </el-radio-button>
        <el-radio-button label="list">
          <VIcon class="align-top">list-view</VIcon>
          List
        </el-radio-button>
      </el-radio-group>
    </div>

    <ReplicationBoard v-if="viewType === 'board'" class="bg-white rounded-lg overflow-hidden"></ReplicationBoard>
    <List
      v-else
      class="overflow-hidden bg-white rounded-lg pr-4 pb-4"
      :route="route"
      :task-buried="taskBuried"
      :sync-type="syncType"
    ></List>
  </div>
</template>

<script>
import List from '@tap/business/src/views/task/List'
import { ReplicationBoard } from '@tap/ldp'

export default {
  name: 'MigrateList',

  components: { List, ReplicationBoard },

  data() {
    return {
      viewType: 'board',
      syncType: 'migrate',
      taskBuried: {
        new: 'migrationCreate',
        newFail: 'migrationCreateAgentFail',
        start: 'migrationStart'
      },
      route: {
        new: 'MigrateCreate',
        editor: 'MigrateEditor',
        monitor: 'MigrationMonitor'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.view-radio-group {
  ::v-deep {
    .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      background-color: map-get($color, primary);
      color: #fff;
    }
  }
}
</style>

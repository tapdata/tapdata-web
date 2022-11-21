<template>
  <List :route="route" :task-buried="taskBuried" :sync-type="syncType"></List>
</template>

<script>
import List from './List'

export default {
  name: 'MigrateList',

  components: { List },

  data() {
    return {
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

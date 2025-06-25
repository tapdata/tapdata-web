<script>
import PageContainer from '../../components/PageContainer.vue'
import List from './List.vue'

export default {
  name: 'MigrateList',

  components: { PageContainer, List },

  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      syncType: 'migrate',
      taskBuried: {
        new: 'migrationCreate',
        newFail: 'migrationCreateAgentFail',
        start: 'migrationStart',
      },
      route: {
        new: 'MigrateCreate',
        editor: 'MigrateEditor',
        monitor: 'MigrationMonitor',
      },
      createLoading: false,
    }
  },

  computed: {
    buttonShowMap() {
      if (this.$route.name === 'dataflowList') {
        return {
          create: this.$has('v2_data_flow_creation'),
          copy: this.$has('v2_data_flow_copy'),
          import: this.$has('v2_data_flow_import'),
          export: this.$has('v2_data_flow_export'),
        }
      }

      return {
        create: this.$has('v2_data_replication_creation'),
        copy: this.$has('v2_data_replication_copy'),
        import: this.$has('v2_data_replication_import'),
        export: this.$has('v2_data_replication_export'),
      }
    },
  },

  methods: {
    refFn(method) {
      this.$refs.list[method]?.()
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        v-if="buttonShowMap.import && isDaas"
        v-readonlybtn="'SYNC_job_import'"
        class="btn"
        @click="refFn('handleImport')"
      >
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </el-button>
      <el-button
        v-if="buttonShowMap.create"
        id="task-list-create"
        v-readonlybtn="'SYNC_job_creation'"
        class="btn btn-create"
        type="primary"
        :loading="createLoading"
        @click="refFn('create')"
      >
        {{ $t('public_task_create') }}
      </el-button>
    </template>
    <List
      ref="list"
      v-model:create-loading="createLoading"
      :route="route"
      :task-buried="taskBuried"
      :sync-type="syncType"
    />
  </PageContainer>
</template>

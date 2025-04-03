<template>
  <PageContainer>
    <template #actions>
      <el-button
        v-if="buttonShowMap.import && isDaas"
        v-readonlybtn="'SYNC_job_import'"
        size="mini"
        class="btn"
        :disabled="$disabledReadonlyUserBtn()"
        @click="refFn('handleImport')"
      >
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </el-button>
      <el-button
        v-if="buttonShowMap.create"
        v-readonlybtn="'SYNC_job_creation'"
        class="btn btn-create"
        type="primary"
        size="mini"
        id="task-list-create"
        :disabled="$disabledReadonlyUserBtn()"
        :loading="createBtnLoading"
        @click="refFn('create')"
      >
        {{ $t('public_button_create') }}
      </el-button>
    </template>
    <List ref="list" :route="route" :task-buried="taskBuried" :sync-type="syncType"></List>
  </PageContainer>
</template>

<script>
import List from './List'
import PageContainer from '../../components/PageContainer.vue'

export default {
  name: 'MigrateList',

  components: { PageContainer, List },

  data() {
    return {
      isDaas:  import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      syncType: 'migrate',
      taskBuried: {
        new: 'migrationCreate',
        newFail: 'migrationCreateAgentFail',
        start: 'migrationStart',
      },
      route: {
        new: 'MigrateCreate',
        editor: 'MigrateEditor',
        monitor: 'MigrationMonitor'
      },
      createBtnLoading: false
    }
  },

  computed: {
    buttonShowMap() {
      if (this.$route.name === 'dataflowList') {
        return {
          create: this.$has('v2_data_flow_creation'),
          copy: this.$has('v2_data_flow_copy'),
          import: this.$has('v2_data_flow_import'),
          export: this.$has('v2_data_flow_export')
        }
      }

      return {
        create: this.$has('v2_data_replication_creation'),
        copy: this.$has('v2_data_replication_copy'),
        import: this.$has('v2_data_replication_import'),
        export: this.$has('v2_data_replication_export')
      }
    }
  },

  methods: {
    refFn(method) {
      this.$refs.list[method]?.()
    }
  },
}
</script>

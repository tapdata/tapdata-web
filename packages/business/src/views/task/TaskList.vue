<script>
import PageContainer from '../../components/PageContainer.vue'
import List from './List'

export default {
  name: 'TaskList',

  components: { PageContainer, List },

  inject: ['checkAgent', 'buried'],

  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
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

      createLoading: false,
      materializedViewLoading: false,
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
        v-if="buttonShowMap.import && $route.name === 'dataflowList'"
        v-readonlybtn="'SYNC_job_import'"
        v-feature="'mongodbRelmig'"
        name="importRelmig"
        class="btn"
        @click="refFn('handleImportRelmig')"
      >
        <span> {{ $t('packages_business_relmig_import') }}</span>
      </el-button>
      <ElButton
        v-if="$route.name === 'dataflowList'"
        v-feature="'buildingMaterializedView'"
        class="--with-icon inline-flex align-center px-2 py-0 gap-1 align-top"
        name="materializedView"
        :loading="materializedViewLoading"
        @click="refFn('handleCreateMaterializedView')"
      >
        <VIcon size="28">beta</VIcon>
        {{ $t('packages_dag_build_materialized_view') }}</ElButton
      >
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
      v-model:materialized-view-loading="materializedViewLoading"
      v-model:create-loading="createLoading"
      :route="route"
      :task-buried="taskBuried"
      :sync-type="syncType"
    />
  </PageContainer>
</template>

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
        color: map.get($fontColor, light);
        background: map.get($bgColor, main);
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
      :deep(.el-table__cell) {
        padding: 10px 0;
      }
    }
  }
}
</style>

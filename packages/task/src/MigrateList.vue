<script>
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import List from '@tap/business/src/views/task/List'
import { ReplicationBoard } from '@tap/ldp'

export default {
  name: 'MigrateList',

  components: { PageContainer, List, ReplicationBoard },

  inject: ['checkAgent', 'buried'],

  data() {
    return {
      // viewType: 'board',
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
      createBtnLoading: false,
      quickCreateBtnLoading: false,
    }
  },

  computed: {
    startingTour() {
      return this.$store.getters.startingTour
    },
    viewType: {
      get() {
        return this.$store.state.guide.tour.view
      },
      set(value) {
        this.$store.dispatch('setReplicationView', value)
      },
    },
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

    useFormCreate() {
      this.buried('migrationFormCreate')
      this.quickCreateBtnLoading = true
      this.checkAgent(async () => {
        await this.$router.push({
          name: 'MigrateForm',
        })
        this.quickCreateBtnLoading = false
      }).catch(() => {
        this.quickCreateBtnLoading = false
        this.buried('migrationFormCreateAgentFail')
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #left-actions>
      <el-radio-group v-model="viewType" class="view-radio-group ml-4">
        <el-radio-button label="board">
          <VIcon class="align-top">swimlane</VIcon>
          {{ $t('public_board_view') }}
        </el-radio-button>
        <el-radio-button label="list">
          <VIcon class="align-top">list-view</VIcon>
          {{ $t('public_list_view') }}
        </el-radio-button>
      </el-radio-group>
    </template>
    <template v-if="viewType === 'list'" #actions>
      <el-button
        v-if="buttonShowMap.import && isDaas"
        v-readonlybtn="'SYNC_job_import'"
        class="btn"
        :disabled="$disabledReadonlyUserBtn()"
        @click="refFn('handleImport')"
      >
        <span> {{ $t('packages_business_button_bulk_import') }}</span>
      </el-button>

      <template v-if="buttonShowMap.create">
        <div class="flex align-center gap-3">
          <el-badge is-dot>
            <el-button
              id="task-list-quick-create"
              class="flex align-center"
              style="height: 32px"
              type="primary"
              plain
              :disabled="$disabledReadonlyUserBtn()"
              :loading="quickCreateBtnLoading"
              @click="useFormCreate"
            >
              <VIcon size="18" class="align-middle mr-1"
                >dynamic-form-outline</VIcon
              >
              <span class="align-middle">{{
                $t('public_button_quickly_create_task')
              }}</span>
            </el-button>
          </el-badge>
          <el-button
            id="task-list-create"
            v-readonlybtn="'SYNC_job_creation'"
            class="btn btn-create"
            type="primary"
            :disabled="$disabledReadonlyUserBtn()"
            :loading="createBtnLoading"
            @click="refFn('create')"
          >
            {{ $t('public_task_create') }}
          </el-button>
        </div>
      </template>
    </template>
    <ReplicationBoard
      v-if="viewType === 'board'"
      class="bg-white rounded-lg overflow-hidden border"
    />
    <List
      v-else
      ref="list"
      class="overflow-hidden bg-white rounded-lg"
      :route="route"
      :task-buried="taskBuried"
      :sync-type="syncType"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.view-radio-group {
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: map.get($color, primary);
    color: #fff;
  }
}
</style>

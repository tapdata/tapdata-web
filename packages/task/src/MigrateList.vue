<template>
  <PageContainer>
    <template #left-actions>
      <el-radio-group v-model="viewType" class="view-radio-group">
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
    <template #actions v-if="viewType === 'list'">
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
    <ReplicationBoard v-if="viewType === 'board'" class="bg-white rounded-lg overflow-hidden"></ReplicationBoard>
    <List
      v-else
      ref="list"
      class="overflow-hidden bg-white rounded-lg pr-4 pb-4"
      :route="route"
      :task-buried="taskBuried"
      :sync-type="syncType"
    ></List>
  </PageContainer>
  <!--<div class="flex flex-column h-100 overflow-hidden">
    <div class="bg-white rounded-lg mb-4 flex align-center px-4">
      <span class="fs-5 py-4 font-color-dark">{{ $t($route.meta.title) }}</span>
      <template v-if="$route.meta.desc">
        <ElDivider v-if="$route.meta.desc" class="mx-4" direction="vertical"></ElDivider>
        <span class="fs-7 font-color-sslight">{{ $t($route.meta.desc) }}</span>
      </template>
      <div class="flex-grow-1"></div>
      <el-radio-group v-model="viewType" class="view-radio-group">
        <el-radio-button label="board">
          <VIcon class="align-top">swimlane</VIcon>
          {{ $t('public_board_view') }}
        </el-radio-button>
        <el-radio-button label="list">
          <VIcon class="align-top">list-view</VIcon>
          {{ $t('public_list_view') }}
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
  </div>-->
</template>

<script>
import List from '@tap/business/src/views/task/List'
import { ReplicationBoard } from '@tap/ldp'
import PageContainer from '@tap/business/src/components/PageContainer.vue'

export default {
  name: 'MigrateList',

  components: { PageContainer, List, ReplicationBoard },

  data() {
    return {
      // viewType: 'board',
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
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
      },
      createBtnLoading: false
    }
  },

  computed: {
    startingTour() {
      return this.$store.getters.startingTour
    },
    viewType: {
      get() {
        return this.$store.state.replicationTour.view
      },
      set(value) {
        this.$store.commit('setReplicationView', value)
      }
    },
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

  watch: {
    viewType() {
      if (!this.startingTour) {
        this.$axios.post('api/tcm/user_guide', {
          tour: this.$store.state.replicationTour
        })
      }
    }
  },

  methods: {
    refFn(method) {
      this.$refs.list[method]?.()
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

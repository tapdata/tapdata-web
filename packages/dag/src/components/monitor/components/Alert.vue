<template>
  <div class="log-container flex justify-content-between">
    <div class="filter-items border-end">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[{ active: activeNodeId === item.value }]"
        class="filter-items__item flex justify-content-between align-items-center"
        @click="changeItem(item)"
      >
        <span>{{ item.label }}</span>
        <VIcon>arrow-right</VIcon>
      </div>
    </div>
    <div class="main flex-fill flex flex-column pt-5">
      <div class="flex ml-4 mb-4 align-items-center">
        <div>
          <span>{{ $t('packages_dag_components_alert_gaojingjibie') }}</span>
          <ElSelect
            v-model="form.level"
            :popper-append-to-body="false"
            popper-class="time-select__popper"
            class="ml-2 dark"
            size="mini"
            ref="select"
          >
            <ElOption
              v-for="(item, index) in levelItems"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></ElOption>
          </ElSelect>
        </div>
        <div class="ml-4">
          <span>{{ $t('packages_dag_components_alert_gaojingzhuangtai') }}</span>
          <ElSelect
            v-model="form.status"
            :popper-append-to-body="false"
            popper-class="time-select__popper"
            class="ml-2 dark"
            size="mini"
            ref="select"
          >
            <ElOption
              v-for="(item, index) in statusItems"
              :key="index"
              :label="item.label"
              :value="item.value"
            ></ElOption>
          </ElSelect>
        </div>
      </div>
      <VTable
        :remoteMethod="remoteMethod"
        :columns="columns"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        ref="table"
        height="100"
        class="table-list"
        hide-on-single-page
      >
        <template slot="operation" slot-scope="scope">
          <div class="operate-columns">
            <ElButton size="mini" type="text">{{ $t('packages_dag_components_alert_guanbi') }}</ElButton>
            <ElButton size="mini" type="text">{{ $t('packages_dag_monitor_bottompanel_rizhi') }}</ElButton>
          </div>
        </template>
      </VTable>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters } from 'vuex'

import { taskApi } from '@tap/api'
import { VIcon, VTable } from '@tap/component'

export default {
  name: 'Alert',

  components: { VIcon, VTable },

  props: {
    dataflow: {
      type: Object,
      default: () => {}
    },
    logsData: {
      type: Object,
      default: () => {
        return {
          total: 0,
          items: []
        }
      }
    }
  },

  data() {
    return {
      activeNodeId: 'all',
      form: {
        level: 'all',
        status: 'all'
      },
      levelItems: [
        {
          label: i18n.t('packages_dag_components_log_quanbu'),
          value: 'all'
        },
        {
          label: 'Emergency',
          value: 'Emergency'
        },
        {
          label: 'Critical',
          value: 'Critical'
        },
        {
          label: 'Warning',
          value: 'Warning'
        },
        {
          label: 'Normal',
          value: 'Normal'
        },
        {
          label: 'Recovery',
          value: 'Recovery'
        }
      ],
      statusItems: [
        {
          label: i18n.t('packages_dag_components_log_quanbu'),
          value: 'all'
        },
        {
          label: i18n.t('packages_dag_monitor_node_jinhangzhong'),
          value: 'open'
        },
        {
          label: i18n.t('packages_dag_components_alert_yiguanbi'),
          value: 'closed'
        },
        {
          label: i18n.t('packages_dag_components_alert_huifu'),
          value: 'recovery'
        }
      ],
      columns: [
        {
          label: i18n.t('packages_dag_components_alert_gaojingjibie'),
          prop: 'level'
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingzhuangtai'),
          prop: 'status'
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingmiaoshu'),
          prop: 'summary'
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingshoucifa'),
          prop: 'first_occurrence_time',
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingzuijinfa'),
          prop: 'first_occurrence_time',
          dataType: 'time'
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingfashengci'),
          prop: 'tally',
          dataType: 'number'
        },
        {
          label: i18n.t('packages_dag_components_record_caozuo'),
          slotName: 'operation'
        }
      ]
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    items() {
      return [
        {
          label: i18n.t('packages_dag_migration_consolepanel_quanburizhi'),
          value: 'all'
        },
        ...this.allNodes.map(t => {
          return {
            label: t.name,
            value: t.id,
            source: t.$outputs.length > 0,
            target: t.$inputs.length > 0
          }
        })
      ]
    }
  },

  methods: {
    remoteMethod({ page }) {
      const { current, size } = page
      const { id: taskId } = this.dataflow || {}
      let filter = {
        limit: size,
        skip: size * (current - 1)
      }
      return taskApi.records(taskId, filter).then(data => {
        return {
          total: 2,
          data: [
            {
              status: 'open',
              level: 'Emergency',
              first_occurrence_time: '2022-06-10 12:00:00',
              last_occurrence_time: '2022-06-10 12:00:00',
              tally: 1020,
              summary: i18n.t('packages_dag_components_alert_dangqianrenwuyi')
            },
            {
              status: 'closed',
              level: 'Critical',
              first_occurrence_time: '2022-06-10 12:00:00',
              last_occurrence_time: '2022-06-10 12:00:00',
              tally: 129321939,
              summary: i18n.t('packages_dag_components_alert_dangqianrenwuyi')
            },
            {
              status: 'recovery',
              level: 'Warning',
              first_occurrence_time: '2022-06-10 12:00:00',
              last_occurrence_time: '2022-06-10 12:00:00',
              tally: 129321939,
              summary: i18n.t('packages_dag_components_alert_dangqianrenwuyi')
            }
          ]
        }
      })
    },

    fetch() {
      this.$refs.table.fetch()
    },

    changeItem(item) {
      if (this.activeNodeId === item.value) {
        return
      }
      this.activeNodeId = item.value
      this.fetch()
    }
  }
}
</script>

<style lang="scss" scoped>
.log-container {
  height: inherit;
}
.filter-items {
  width: 200px;
  user-select: none;
}
.filter-items__item {
  padding: 0 16px;
  height: 40px;
  cursor: pointer;
  &.active {
    background: rgba(44, 101, 255, 0.05);
  }
}
.white-space-nowrap {
  white-space: nowrap;
}

.log-list {
  border-radius: 1px;
  background-color: rgba(229, 236, 255, 0.22);
  ::v-deep {
    .log-line {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .highlight-bg-color {
      background-color: #ff0;
    }
    .empty-wrap {
      margin: 24px 0;
    }
  }
}
.no-more__alert {
  margin-left: -70px;
  top: 4px;
  left: 50%;
  width: 140px;
  ::v-deep {
    .el-alert__closebtn {
      top: 7px;
    }
  }
}
</style>

<script>
import { fetchConnections, taskApi } from '@tap/api'
import { CURRENCY_SYMBOL_MAP, ORDER_STATUS_MAP, TIME_MAP } from '@tap/business'

import { FilterBar, VTable } from '@tap/component'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash-es'
import i18n from '@/i18n'
import StatusTag from '../../components/StatusTag'
import { AGENT_TYPE_MAP, getPaymentMethod, getSpec } from '../instance/utils'

import TicketDetails from './Details.vue'

export default {
  components: { FilterBar, VTable, TicketDetails, StatusTag },
  inject: ['buried'],
  data() {
    return {
      loading: true,
      createDialog: false,
      pricePay: '',
      agentTypeMap: AGENT_TYPE_MAP,
      searchParams: {
        keyword: '',
      },
      search: '',
      filterItems: [],
      createForm: {
        jobId: '',
        connectionId: '',
        subject: '',
        description: '',
      },
      columns: [
        {
          label: i18n.t('dfs_ticketing_system_list_zhuti'),
          prop: 'subject',
          slotName: 'name',
        },
        {
          label: i18n.t('dfs_ticketing_system_list_wenti'),
          prop: 'description',
          width: '200px',
          showOverflowTooltip: true,
        },
        {
          label: i18n.t('dfs_ticketing_system_list_gongdanbianhao'),
          prop: 'ticketNumber',
        },
        {
          label: i18n.t('dfs_ticketing_system_list_gongdanzhuangtai'),
          prop: 'status',
          slotName: 'status',
        },
        {
          label: i18n.t('dfs_ticketing_system_list_tijiaoshijian'),
          prop: 'createdTime',
          dataType: 'time',
        },
        {
          label: i18n.t('public_operation'),
          prop: 'operation',
          slotName: 'operation',
          width: 140,
        },
      ],
      rules: {
        subject: [
          {
            required: true,
            message: i18n.t('dfs_ticketing_system_list_qingshuruzhuti'),
            trigger: 'change',
          },
        ],
        description: [
          {
            required: true,
            message: i18n.t('dfs_ticketing_system_list_qingmiaoshuninde'),
            trigger: 'change',
          },
        ],
      },
      taskList: [],
      connectionList: [],
      submitLoading: false,
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    $route(route, preRoute) {
      if (route.name === 'TicketSystem') {
        const query = route.query

        if (!query?.form && !preRoute.query?.form) {
          this.searchParams.keyword = query.keyword || ''
          const pageNum = query === '{}' ? undefined : 1
          this.table.fetch(pageNum)
        }

        this.hasForm(query)
      }
    },
  },
  created() {
    this.getFilterItems()
    this.getTask()
    this.getConnection()

    this.hasForm(this.$route.query)
  },
  methods: {
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: i18n.t('dfs_ticketing_system_list_shurugongdanming'),
          label: i18n.t('dfs_ticketing_system_list_shurugongdanming'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
    remoteMethod({ page }) {
      const { current, size } = page
      const { keyword } = this.searchParams
      const { userId } = window.__USER_INFO__
      let url = `api/ticket?userId=${userId}&page=${current}&limit=${size}`
      if (keyword) {
        url = `api/ticket?userId=${userId}&page=${current}&limit=${size}&subject=${keyword}`
      }
      return this.$axios.get(url).then((data) => {
        const items = data.items || []
        return {
          total: data.total,
          data:
            items.map((t) => {
              t.statusLabel = ORDER_STATUS_MAP[t.status]
              const { spec, type, periodUnit, period } = t || {}
              t.subscriptionMethodLabel = getPaymentMethod({
                type,
                periodUnit,
                period,
              })
              t.agentDeploy = this.agentTypeMap[t.agentDeploy || 'selfHost']
              t.content = `${t.subscriptionMethodLabel} ${getSpec(spec)} ${i18n.t('public_agent')}`
              t.periodLabel =
                t.status === 'unPay'
                  ? '-'
                  : `${dayjs(t.periodStart).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )} - ${dayjs(t.periodEnd).format('YYYY-MM-DD HH:mm:ss')}`
              t.priceSuffix =
                t.type === 'recurring' ? `/${TIME_MAP[t.periodUnit]}` : ''
              t.formatPrice =
                CURRENCY_SYMBOL_MAP[t.currency] +
                (t.price / 100).toLocaleString('zh', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              t.priceLabel = t.formatPrice + t.priceSuffix
              t.bindAgent = t.agentId
                ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                : i18n.t('user_Center_weiBangDing')
              return t
            }) || [],
        }
      })
    },
    handleDetails(row) {
      this.$refs.details.getData(row.id)
    },
    //获取任务列表
    getTask() {
      const fields = {
        id: true,
        name: true,
        last_updated: true,
      }
      const filter = {
        order: 'last_updated DESC',
        limit: 1000,
        fields,
        skip: 0,
      }
      taskApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          this.taskList = data?.items || []
        })
    },
    //获取连接列表
    getConnection() {
      fetchConnections({
        order: 'last_updated DESC',
        limit: 1000,
        noSchema: 1,
        skip: 0,
      }).then((data) => {
        this.connectionList = data?.items || []
      })
    },
    //关闭工单
    close(id) {
      this.$axios.patch(`api/ticket/${id}`).then(() => {
        this.$message.success(
          i18n.t('dfs_ticketing_system_list_gongdanyiguanbi'),
        )
        this.table.fetch(1)
      })
    },
    //提交工单
    create() {
      this.$refs.createForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true
          const { userId, email, telephone, nickname } = window.__USER_INFO__
          const taskName = this.taskList.find(
            (task) => task.id === this.createForm?.jobId,
          )?.name
          const connectionName = this.connectionList.find(
            (conn) => conn.id === this.createForm?.connectionId,
          )?.name
          const country = this.$store.getters.isDomesticStation
            ? 'China'
            : 'Abroad'
          const params = Object.assign(this.createForm, {
            connectionName,
            jobName: taskName,
            userId,
            phone: telephone,
            email,
            nickname,
            country,
          })
          this.$axios.post('api/ticket', params).then(() => {
            this.closeDialog()
            this.submitLoading = false
            this.table.fetch(1)
            this.$message.success(i18n.t('public_message_operation_success'))
          })
        }
      })
    },
    //关闭弹窗
    closeDialog() {
      this.createForm = {}
      this.$refs?.createForm?.resetFields()
      this.createDialog = false
    },

    hasForm(query) {
      if (query?.form) {
        try {
          const form = JSON.parse(decodeURIComponent(query.form))
          Object.assign(this.createForm, form)
          this.createDialog = true
        } catch (error) {
          console.error(error)
        }

        this.$router.replace({
          name: 'TicketSystem',
          query: { ...query, form: undefined },
        })
      }
    },
  },
}
</script>

<template>
  <section
    v-if="$route.name === 'TicketSystem'"
    class="ticket-system-wrapper g-panel-container"
  >
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left flex justify-content-between">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
          <ElButton type="primary">
            <span @click="createDialog = true">{{
              $t('dfs_ticketing_system_list_xinjiangongdan')
            }}</span>
          </ElButton>
        </div>
      </div>
      <VTable
        ref="table"
        :columns="columns"
        :remote-method="remoteMethod"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper',
        }"
        class="mt-4"
      >
        <template #name="{ row }">
          <span
            class="cursor-pointer ticket-name ellipsis inline-block color-primary"
            @click="handleDetails(row)"
            >{{ row.subject }}</span
          >
        </template>
        <template #status="{ row }">
          <StatusTag
            type="tag"
            :status="row.status"
            default-status="Stopped"
            target="ticket"
          />
        </template>
        <template #operation="{ row }">
          <ElButton text @click="handleDetails(row)">{{
            $t('public_button_details')
          }}</ElButton>
          <ElButton
            text
            :disabled="row.status === 'Closed'"
            @click="close(row.id)"
            >{{ $t('public_button_close') }}</ElButton
          >
        </template>
        <template #empty>
          <div class="instance-table__empty">
            <VIcon size="120">no-data-color</VIcon>
            <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
              <span>{{ $t('data_no_data') }}</span>
            </div>
          </div>
        </template>
      </VTable>
    </div>
    <!--{{$t('dfs_ticketing_system_list_xinjiangongdan')}}-->
    <ElDialog
      v-model="createDialog"
      :before-close="closeDialog"
      :title="$t('dfs_ticketing_system_list_xinjiangongdan')"
      width="620px"
    >
      <span>
        <el-form
          ref="createForm"
          label-position="top"
          :model="createForm"
          :rules="rules"
        >
          <el-form-item
            :label="$t('dfs_ticketing_system_list_zhuti')"
            prop="subject"
          >
            <el-input
              v-model="createForm.subject"
              :placeholder="$t('dfs_ticketing_system_list_qingshuruzhuti')"
              required
              @change="createForm.subject = createForm.subject.trim()"
            />
          </el-form-item>
          <el-form-item
            :label="$t('dfs_ticketing_system_list_xuanzerenwu')"
            prop="task"
          >
            <el-select
              v-model="createForm.jobId"
              :placeholder="$t('dfs_ticketing_system_list_qingxuanzexuanze')"
              class="w-100"
              popper-class="ticket-select"
              required
            >
              <el-option
                v-for="item in taskList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                >{{ item.name }}</el-option
              >
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('dfs_ticketing_system_list_xuanzeshujuyuan')"
            prop="connection"
          >
            <el-select
              v-model="createForm.connectionId"
              :placeholder="$t('dfs_ticketing_system_list_qingxuanzexuanze2')"
              class="w-100"
              popper-class="ticket-select"
              required
            >
              <el-option
                v-for="item in connectionList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
                >{{ item.name }}</el-option
              >
            </el-select>
          </el-form-item>
          <el-form-item
            :label="$t('dfs_ticketing_system_list_wenti')"
            prop="description"
          >
            <el-input
              v-model="createForm.description"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 8 }"
              :placeholder="$t('dfs_ticketing_system_list_qingmiaoshuninde')"
              required
              @change="createForm.description = createForm.description.trim()"
            />
          </el-form-item>
        </el-form>
      </span>
      <template #footer>
        <span>
          <el-button @click="closeDialog()">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button type="primary" :loading="submitLoading" @click="create">{{
            $t('public_button_create')
          }}</el-button>
        </span>
      </template>
    </ElDialog>
    <TicketDetails ref="details" width="380px" />
  </section>
  <RouterView v-else />
</template>

<style lang="scss" scoped>
.ticket-system-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .pointer {
    cursor: pointer;
  }
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .operation-logs-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
  }
  .ticket-name {
    &:hover {
      color: var(--color-primary);
    }
  }
}
.ticket-select {
  .el-select-dropdown__item {
    width: 568px;
  }
}
</style>

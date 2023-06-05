<template>
  <section class="ticket-system-wrapper g-panel-container" v-if="$route.name === 'TicketSystem'">
    <div class="main">
      <div class="list-operation">
        <div class="list-operation-left flex justify-content-between">
          <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
          <ElButton type="primary">
            <span @click="createDialog = true">{{$t('dfs_ticketing_system_list_xinjiangongdan')}}</span>
          </ElButton>
        </div>
      </div>
      <VTable
        :columns="columns"
        :remoteMethod="remoteMethod"
        :page-options="{
          layout: 'total, ->, prev, pager, next, sizes, jumper'
        }"
        ref="table"
        class="mt-4"
      >
        <template #name="{ row }">
          <span class="cursor-pointer ticket-name ellipsis inline-block color-primary" @click="handleDetails(row)">{{
            row.subject
          }}</span>
        </template>
        <template #status="{ row }">
          <StatusTag type="tag" :status="row.status" default-status="Stopped" target="ticket"></StatusTag>
        </template>
        <template #operation="{ row }">
          <ElButton type="text" @click="handleDetails(row)">{{$t('public_button_details')}}</ElButton>
          <ElButton type="text" @click="close(row.id)">{{$t('public_button_close')}}</ElButton>
        </template>
      </VTable>
    </div>
    <!--{{$t('dfs_ticketing_system_list_xinjiangongdan')}}-->
    <ElDialog :title="$t('dfs_ticketing_system_list_xinjiangongdan')" :visible.sync="createDialog" width="620px">
      <span>
        <el-form label-position="top" :model="createForm" :rules="rules" ref="createForm">
          <el-form-item :label="$t('dfs_ticketing_system_list_zhuti')" prop="subject">
            <el-input v-model="createForm.subject" :placeholder="$t('dfs_ticketing_system_list_qingshuruzhuti')" required></el-input>
          </el-form-item>
          <el-form-item :label="$t('dfs_ticketing_system_list_xuanzerenwu')" prop="task">
            <el-select v-model="createForm.jobId" :placeholder="$t('dfs_ticketing_system_list_qingxuanzexuanze')" class="w-100" required>
              <el-option v-for="item in taskList" :key="item.id" :label="item.name" :value="item.id">{{
                item.name
              }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('dfs_ticketing_system_list_xuanzeshujuyuan')" prop="connection">
            <el-select v-model="createForm.connectionId" :placeholder="$t('dfs_ticketing_system_list_qingxuanzexuanze2')" class="w-100" required>
              <el-option v-for="item in connectionList" :key="item.id" :label="item.name" :value="item.id">{{
                item.name
              }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('dfs_ticketing_system_list_wenti')" prop="subject">
            <el-input v-model="createForm.description" type="textarea" :placeholder="$t('dfs_ticketing_system_list_qingmiaoshuninde')" required></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer">
        <el-button @click="createDialog = false">{{$t('public_button_cancel')}}</el-button>
        <el-button type="primary" @click="create">{{$t('public_button_create')}}</el-button>
      </span>
    </ElDialog>
    <Details ref="details" width="380px"></Details>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { FilterBar, VTable } from '@tap/component'
import Details from './Details'

import i18n from '@/i18n'
import { isEmpty } from '@/util'
import { CURRENCY_SYMBOL_MAP, ORDER_STATUS_MAP, TIME_MAP } from '@tap/business'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import dayjs from 'dayjs'
import StatusTag from '../../components/StatusTag'

import { connectionsApi, taskApi } from '@tap/api'

export default {
  components: { FilterBar, VTable, Details, StatusTag },
  inject: ['buried'],
  data() {
    return {
      loading: true,
      createDialog: false,
      pricePay: '',
      agentTypeMap: AGENT_TYPE_MAP,
      searchParams: {
        agentDeploy: '',
        status: ''
      },
      search: '',
      filterItems: [],
      createForm: {
        jobId: '',
        connectionId: '',
        subject: '',
        description: ''
      },
      columns: [
        {
          label: i18n.t('dfs_ticketing_system_list_zhuti'),
          prop: 'subject',
          slotName: 'name'
        },
        {
          label: i18n.t('dfs_ticketing_system_list_wenti'),
          prop: 'description'
        },
        {
          label: i18n.t('dfs_ticketing_system_list_gongdanbianhao'),
          prop: 'ticketNumber'
        },
        {
          label: i18n.t('dfs_ticketing_system_list_gongdanzhuangtai'),
          prop: 'status',
          slotName: 'status'
        },
        {
          label: i18n.t('dfs_ticketing_system_list_tijiaoshijian'),
          prop: 'createdTime',
          dataType: 'time'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'operation',
          slotName: 'operation',
          width: 100
        }
      ],
      rules: {
        jobId: [{ required: true, message: i18n.t('dfs_ticketing_system_list_qingxuanzexuanze'), trigger: 'blur' }],
        connectionId: [{ required: true, message: i18n.t('dfs_ticketing_system_list_xuanzeshujuyuan'), trigger: 'change' }],
        subject: [{ required: true, message: i18n.t('dfs_ticketing_system_list_qingshuruzhuti'), trigger: 'change' }],
        description: [{ required: true, message: i18n.t('dfs_ticketing_system_list_qingmiaoshuninde'), trigger: 'change' }]
      },
      taskList: [],
      connectionList: []
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  created() {
    this.getFilterItems()
    this.getTask()
    this.getConnection()
  },
  watch: {
    $route(route) {
      if (route.name === 'TicketSystem') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        let pageNum = isEmpty(query) ? undefined : 1
        this.table.fetch(pageNum)
      }
    }
  },
  methods: {
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: i18n.t('dfs_ticketing_system_list_shurugongdanming'),
          label: i18n.t('dfs_ticketing_system_list_shurugongdanming'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    remoteMethod({ page }) {
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {
        status: {
          $ne: 'invalid' //过滤 invild
        }
      }
      keyword && (where.name = keyword)
      let filter = {
        limit: size,
        skip: size * (current - 1),
        sort: ['createAt desc'],
        where: where
      }
      let { userId } = window.__USER_INFO__
      return this.$axios.get(`api/ticket?userId=${userId}&page=${current}&limit=${size}`).then(data => {
        let items = data.items || []
        return {
          total: data.total,
          data:
            items.map(t => {
              t.statusLabel = ORDER_STATUS_MAP[t.status]
              const { spec, type, periodUnit, period } = t || {}
              t.subscriptionMethodLabel = getPaymentMethod({
                type,
                periodUnit,
                period
              })
              t.agentDeploy = this.agentTypeMap[t.agentDeploy || 'selfHost']
              t.content = `${t.subscriptionMethodLabel} ${getSpec(spec)} ${i18n.t('public_agent')}`
              t.periodLabel =
                t.status === 'unPay'
                  ? '-'
                  : dayjs(t.periodStart).format('YYYY-MM-DD HH:mm:ss') +
                    ' - ' +
                    dayjs(t.periodEnd).format('YYYY-MM-DD HH:mm:ss')
              t.priceSuffix = t.type === 'recurring' ? '/' + TIME_MAP[t.periodUnit] : ''
              t.formatPrice =
                CURRENCY_SYMBOL_MAP[t.currency] +
                (t.price / 100).toLocaleString('zh', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })
              t.priceLabel = t.formatPrice + t.priceSuffix
              t.bindAgent = t.agentId
                ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                : i18n.t('user_Center_weiBangDing')
              return t
            }) || []
        }
      })
    },
    handleDetails(row) {
      this.$refs.details.getData(row.id)
    },
    //获取任务列表
    getTask() {
      let fields = {
        id: true,
        name: true,
        last_updated: true
      }
      let filter = {
        order: 'last_updated DESC',
        limit: 1000,
        fields: fields,
        skip: 0
      }
      taskApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.taskList = data?.items || []
        })
    },
    //获取连接列表
    getConnection() {
      let filter = {
        order: 'last_updated DESC',
        limit: 1000,
        noSchema: 1,
        skip: 0
      }
      connectionsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.connectionList = data?.items || []
        })
    },
    //关闭工单
    close(id) {
      this.$axios.patch('api/ticket/' + id).then(() => {
        this.$message.success(i18n.t('dfs_ticketing_system_list_gongdanyiguanbi'))
        this.table.fetch(1)
      })
    },
    //提交工单
    create() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          let { userId, phone, email } = window.__USER_INFO__
          let taskName = this.taskList.find(task => task.id === this.createForm?.jobId)?.name
          let connectionName = this.connectionList.find(conn => conn.id === this.createForm?.connectionId)?.name
          let params = Object.assign(this.createForm, {
            connectionName: connectionName,
            jobName: taskName,
            userId: userId,
            phone: phone,
            email: email
          })
          this.$axios.post('api/ticket', params).then(() => {
            this.createDialog = false
            this.table.fetch(1)
            this.$message.success(i18n.t('public_message_operation_success'))
          })
        }
      })
    }
  }
}
</script>

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
      color: map-get($color, primary);
    }
  }
}
</style>

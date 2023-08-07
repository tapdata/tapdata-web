<template>
  <ElDialog
    v-if="showUnsubscribeDetailVisible"
    :visible.sync="showUnsubscribeDetailVisible"
    :title="$t('dfs_instance_instance_tuidingshili')"
    width="60%"
  >
    <section class="mt-n4">
      <el-alert
        class="alert-primary mb-4 text-primary"
        type="info"
        :title="$t('dfs_change_instance_tip')"
        show-icon
        :closable="false"
      >
        <div slot="title">
          <div>{{ $t('dfs_instance_instance_tuidingzhituihuan') }}</div>
          <div class="mt-2">{{ $t('dfs_instance_instance_qingzixihedui') }}</div>
        </div>
      </el-alert>
      <div class="mt-4 fs-6 font-color-dark">{{ $t('dfs_instance_instance_tuidingshili') }}</div>
      <div v-if="agentList.length > 0">
        <VTable
          ref="table"
          row-key="id"
          :columns="paidDetailColumns"
          :data="agentList"
          height="100%"
          :has-pagination="false"
          class="mt-4 mb-4"
        >
          <template #expiredTime="{ row }">
            <div>{{ row.periodStart }}</div>
            <div>{{ row.periodEnd }}</div>
          </template>
          <template #actualAmount="{ row }">
            <span class="font-color-dark fw-normal">{{ row.actualAmount }}</span>
          </template>
          <template #spentAmount="{ row }">
            <span class="color-danger fw-normal"> -{{ row.spentAmount }}</span>
          </template>
          <template #refundAmount="{ row }">
            <span class="color-primary fw-normal">{{ row.refundAmount }}</span>
          </template>
        </VTable>
      </div>
      <div v-if="memoryList.length > 0">
        <VTable
          ref="table"
          row-key="id"
          :columns="memoryColumns"
          :data="memoryList"
          height="100%"
          :has-pagination="false"
          class="mt-4 mb-4"
        >
          <template #expiredTime="{ row }">
            <div>{{ row.periodStart }}</div>
            <div>{{ row.periodEnd }}</div>
          </template>
          <template #actualAmount="{ row }">
            <span class="font-color-dark fw-normal">{{ row.actualAmount }}</span>
          </template>
          <template #spentAmount="{ row }">
            <span class="color-danger fw-normal"> -{{ row.spentAmount }}</span>
          </template>
          <template #refundAmount="{ row }">
            <span class="color-primary fw-normal">{{ row.refundAmount }}</span>
          </template>
        </VTable>
      </div>
      <el-form label-position="top" :model="form" :rules="rules" ref="ruleForm">
        <el-form-item :label="$t('dfs_instance_instance_tuidingyuanyin')" required>
          <el-radio-group v-model="form.refundReason">
            <el-radio class="mt-2" label="configurationOptionError">{{
              $t('dfs_instance_instance_peizhixuanxiangcuo')
            }}</el-radio>
            <el-radio class="mt-2" label="unableDeployProperly">{{
              $t('dfs_instance_instance_wufazhengchangbu')
            }}</el-radio>
            <el-radio class="mt-2" label="notconsistentWithExpectations">{{
              $t('dfs_instance_instance_xingnenghuozhegong')
            }}</el-radio>
            <el-radio class="mt-2" label="unsubscribeAfterBusinessTesting">{{
              $t('dfs_instance_instance_yewuceshiwan')
            }}</el-radio>
            <el-radio class="mt-2" label="other">{{ $t('dfs_instance_instance_qita') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.refundReason === 'other'" prop="refundDescribe">
          <el-input
            v-model="form.refundDescribe"
            type="textarea"
            :placeholder="$t('dfs_instance_instance_qingshurutuiding')"
            show-word-limit
          >
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('dfs_instance_instance_tuikuanqudao')">
          <el-input v-model="form.refundChannel" disabled show-word-limit style="width: 200px"> </el-input>
        </el-form-item>
      </el-form>
    </section>
    <span slot="footer" class="dialog-footer">
      <span class="mr-4"
        ><span class="fs-6 font-color-dark font-weight-light">{{ $t('dfs_instance_instance_ketuidingjine') }}</span
        ><span class="color-primary fs-4"> {{ refundAmount }}</span></span
      >
      <el-button @click="showUnsubscribeDetailVisible = false">{{ $t('public_button_cancel') }}</el-button>
      <el-button :disabled="!form.refundReason" type="primary" :loading="loadingCancelSubmit" @click="cancelSubmit">{{
        $t('public_button_unsubscribe')
      }}</el-button>
    </span>
  </ElDialog>
</template>
<script>
import { VTable } from '@tap/component'
import i18n from '@/i18n'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'
import dayjs from 'dayjs'

export default {
  name: 'Unsubscribe',
  components: { VTable },
  props: ['visible'],
  inject: ['buried'],
  data() {
    return {
      showUnsubscribeDetailVisible: false,
      loadingCancelSubmit: false,
      unsubscribeHelpDocumentation: '', //退订跳转地址
      currentRow: '',
      refundAmount: '',
      form: {
        refundReason: '',
        refundDescribe: '',
        refundChannel: i18n.t('dfs_instance_instance_yuanlutuihui')
      },
      rules: {
        refundDescribe: [{ required: true, message: i18n.t('dfs_instance_instance_qingshurutuiding'), trigger: 'blur' }]
      },
      memoryColumns: [
        {
          label: i18n.t('dfs_instance_createagent_cunchuguige'),
          prop: 'spec',
          minWidth: 120
        },
        {
          label: i18n.t('dfs_instance_createagent_cunchukongjian'),
          prop: 'storageSize',
          width: 120
        },
        {
          label: i18n.t('dfs_instance_selectlist_dingyuezhouqi'),
          slotName: 'expiredTime',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_shifujine'),
          prop: 'actualAmount',
          slotName: 'actualAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_yixiaohaojine'),
          prop: 'spentAmount',
          slotName: 'spentAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_tuidingjine'),
          prop: 'refundAmount',
          slotName: 'refundAmount'
        }
      ],
      paidDetailColumns: [
        {
          label: this.$t('agent_name'),
          prop: 'agentName',
          minWidth: 120
        },
        {
          label: this.$t('dfs_instance_instance_guige'),
          prop: 'spec',
          width: 120
        },
        {
          label: i18n.t('dfs_instance_selectlist_dingyuezhouqi'),
          slotName: 'expiredTime',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_shifujine'),
          prop: 'actualAmount',
          slotName: 'actualAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_yixiaohaojine'),
          prop: 'spentAmount',
          slotName: 'spentAmount'
        },
        {
          label: i18n.t('dfs_instance_instance_tuidingjine'),
          prop: 'refundAmount',
          slotName: 'refundAmount'
        }
      ],
      agentList: [],
      memoryList: []
    }
  },
  methods: {
    //退订 //退订详情费用
    getUnsubscribePrice(row = {}, type) {
      if (row?.refund) {
        let param = {
          instanceId: row.agentId
        }
        this.$axios.post('api/tcm/subscribe/{subscribeId}/refund', param).then(() => {
          this.$message.success(this.$t('public_message_operation_success'))
          this.table.fetch(1)
        })
        return
      }
      let url = `api/tcm/subscribe/${row.id}/refund`
      this.currentRow = row
      this.currentRow['type'] = type //是否是单个退订
      this.memoryList = []
      this.agentList = []
      this.$axios.get(url).then(data => {
        if (data) {
          let agentList = data.filter(it => it.productType === 'Engine')
          let memoryList = data.filter(it => it.productType === 'MongoDB')
          if (type === 'all') {
            //计算价格
            let price = data[0].refundAmount + data[1].refundAmount
            this.refundAmount = this.formatPrice(data[0].currency, price)
            this.memoryList = this.formatItems(memoryList)
            this.agentList = this.formatItems(agentList)
          } else if (type === 'MongoDB') {
            this.refundAmount = this.formatPrice(memoryList[0].currency, memoryList[0].refundAmount)
            this.memoryList = this.formatItems(memoryList)
          } else {
            this.refundAmount = this.formatPrice(agentList[0].currency, agentList[0].refundAmount)
            this.agentList = this.formatItems(agentList)
          }
        }
        this.showUnsubscribeDetailVisible = true
      })
    },
    formatItems(data) {
      return data.map(item => {
        item.actualAmount = this.formatPrice(item.currency, item.actualAmount)
        item.spentAmount = this.formatPrice(item.currency, item.spentAmount)
        item.refundAmount = this.formatPrice(item.currency, item.refundAmount)
        item.periodStart = this.formatterTime(item.startAt)
        item.periodEnd = this.formatterTime(item.endAt)
        item.spec = item?.resource?.spec?.name
        item.agentName = item?.resource?.name
        item.storageSize = item?.resource?.spec?.storageSize + 'GB' || 0
        return item
      })
    },
    formatterTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    formatPrice(currency, price) {
      if (price === 0) return 0
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    //退订
    cancelSubmit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.loadingCancelSubmit = true
          const { paidType, id, type, subscribeItems } = this.currentRow
          const { refundReason, refundDescribe } = this.form
          //单个退订需要传resourceId
          let resourceId = ''
          if (type === 'Engine') {
            resourceId = subscribeItems.find(it => it.productType === 'Engine')?.resourceId
          } else if (type === 'MongoDB') {
            resourceId = subscribeItems.find(it => it.productType === 'MongoDB')?.resourceId
          }
          let param = {
            subscribeId: id,
            refundReason,
            resourceId: resourceId,
            refundDescribe
          }
          this.$axios
            .post('api/tcm/subscribe/cancel', param)
            .then(() => {
              this.buried('unsubscribeAgentStripe', '', {
                result: true,
                type: paidType
              })
              this.$message.success(this.$t('public_message_operation_success'))
              this.showUnsubscribeDetailVisible = false
              this.loadingCancelSubmit = false
              //刷新页面
              this.$emit('closeVisible')
            })
            .finally(() => {
              this.showUnsubscribeDetailVisible = false
              this.loadingCancelSubmit = false
            })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.alert-primary {
  background: #e8f3ff;
}
</style>

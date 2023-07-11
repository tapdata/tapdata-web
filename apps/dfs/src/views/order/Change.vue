<template>
  <ElDialog v-if="visible" :visible.sync="visible" title="变更实例规格" width="60%">
    <section>
      <ul class="subscription-ul">
        <li class="mt-2">1.规格变更仅支持由小规格向大规格变更</li>
        <li class="mt-2">2.如需将大规格变更为小规格，请先退订后再重新订购。</li>
      </ul>
      <div class="mt-4 fs-6 font-color-dark">变更对象</div>
      <div v-if="agentList.length > 0">
        <VTable
          ref="table"
          row-key="id"
          :columns="paidDetailColumns"
          :data="agentList"
          height="100%"
          :has-pagination="false"
          class="mt-4 mb-4"
        ></VTable>
      </div>
      <el-form label-position="top" ref="ruleForm">
        <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
          <ElSelect v-model="specification" @change="changeSpec" class="w-50 rounded-4">
            <ElOption v-for="(item, i) in specificationItems" :key="i" :label="item.name" :value="item.value">
              <span>{{ item.name }}: </span>
              <span>{{ item.desc }}</span>
              <div
                class="spec-li-title mt-1 lh-base font-color-sslight"
                v-html="$t('dfs_agent_specification_description', updateAgentCap(item.cpu, item.memory))"
              ></div>
            </ElOption>
          </ElSelect>
        </ElFormItem>
      </el-form>
    </section>
    <span slot="footer" class="dialog-footer">
      <span class="mr-4"
        ><span class="fs-6 font-color-dark font-weight-light">变更金额：</span
        ><span class="color-primary fs-4"> {{ formatPrice(currency) }}</span></span
      >
      <el-button @click="visible = false">{{ $t('public_button_cancel') }}</el-button>
      <el-button type="primary" :loading="loadingCancelSubmit" @click="cancelSubmit">提交申请</el-button>
    </span>
  </ElDialog>
</template>
<script>
import { VTable } from '@tap/component'
import i18n from '@/i18n'
import { CURRENCY_SYMBOL_MAP, TIME_MAP } from '@tap/business'
import dayjs from 'dayjs'
import { uniqBy } from 'lodash'
import { getPaymentMethod, getSpec } from '../instance/utils'
import { openUrl } from '@tap/shared'

export default {
  name: 'ChangeSubscribe',
  components: { VTable },
  inject: ['buried'],
  data() {
    return {
      visible: false,
      loadingCancelSubmit: false,
      unsubscribeHelpDocumentation: '', //退订跳转地址
      currentRow: '',
      specification: '',
      currency: '',
      paidDetailColumns: [
        {
          label: i18n.t('dfs_components_renew_dingyuebianhao'),
          prop: 'id'
        },
        {
          label: i18n.t('dfs_components_renew_shiliguige'),
          prop: 'specLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_dingyuefangshi'),
          prop: 'subscriptionMethodLabel',
          width: 180
        },
        {
          label: i18n.t('dfs_instance_instance_daoqishijian'),
          prop: 'endAt',
          width: 180
        }
      ],
      agentList: [],
      specificationItems: [],
      packageItems: [],
      agent: ''
    }
  },
  computed: {
    singleMonth() {
      return this.packageItems.find(item => item.type === 'one_time' && item.periodUnit === 'month')
    },
    singleMonthAmount() {
      return this.singleMonth?.currencyOption.find(item => item.currency === this.currencyType)?.amount
    },
    singleYearAmount() {
      return this.singleMonthAmount ? this.singleMonthAmount * 12 : this.singleMonthAmount
    }
  },
  methods: {
    openChange(item) {
      let agent = item?.subscribeItems.find(it => it.productType === 'Engine')
      let specLabel = getSpec(agent?.spec)
      //组装续订列表
      let node = {
        id: item.id,
        endAt: this.formatterTime(item.endAt),
        specLabel: specLabel,
        subscriptionMethodLabel:
          getPaymentMethod({ periodUnit: item.periodUnit, type: item.subscribeType }, item.paymentMethod || 'Stripe') ||
          '-'
      }
      this.agentList = [node]
      this.visible = true
      this.currentRow = item
      this.agent = agent
      this.currencyType = item.currency
      this.getPrice(agent, agent?.agentType)
    },
    //查询规格价格
    getPrice(orw, agentType) {
      const params = {
        productType: agentType === 'Cloud' ? 'fullManagement' : 'selfHost'
      }
      this.$axios.get('api/tcm/orders/paid/price', { params }).then(data => {
        let { paidPrice = [] } = data?.[0] || {}
        //当前priceID 找打productID
        let productId = paidPrice.find(it => it.priceId === this.agent?.priceId)?.productId
        paidPrice = paidPrice.filter(
          it =>
            it.productId === productId &&
            it.priceId > this.agent?.priceId &&
            it.chargeProvider !== 'FreeTier' &&
            this.currentRow?.subscribeType === it.type &&
            this.currentRow?.periodUnit === it.periodUnit
        )
        // 规格
        this.specificationItems = uniqBy(
          paidPrice.map(t => {
            const { cpu = 0, memory = 0 } = t.spec || {}
            let desc =
              i18n.t('dfs_agent_download_subscriptionmodeldialog_renwushujianyi') +
              this.getSuggestPipelineNumber(cpu, memory) +
              i18n.t('dfs_agent_download_subscriptionmodeldialog_ge')
            if (t.chargeProvider == 'FreeTier') {
              desc = i18n.t('dfs_agent_download_subscriptionmodeldialog_mianfeishilizui')
            }
            return {
              label: getSpec(t.spec),
              value: getSpec(t.spec),
              cpu,
              memory,
              name: t.spec.name.toUpperCase(),
              chargeProvider: t.chargeProvider,
              desc: desc
            }
          }),
          'value'
        ).sort((a, b) => {
          return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
        })
        // 如果是单独订购存储，默认调过免费实例，避免后续step受免费实例影响
        this.specification =
          !this.agentCount && this.orderStorage ? this.specificationItems[1]?.value : this.specificationItems[0]?.value
        // 价格套餐
        this.allPackages = paidPrice.map(t => {
          return Object.assign(t, {
            label: getPaymentMethod(t),
            value: t.priceId,
            price: t.price,
            priceSuffix: t.type === 'recurring' ? TIME_MAP[t.periodUnit] : '',
            desc: '',
            specification: getSpec(t.spec),
            currencyOption: t.currencyOption || []
          })
        })
        this.changeSpec(this.specification)
        if (!this.currencyType) {
          this.currencyType = this.packageItems[0]?.currencyOption[0]?.currency
        }
        console.log('specificationItems', this.specificationItems) // eslint-disable-line
      })
    },
    //查询定价列表
    getSuggestPipelineNumber(cpu, memory) {
      if (memory == 2) {
        return 3
      }
      if (memory == 4) {
        return 5
      }
      return memory / 0.8
    },
    //订购时长对应价格
    loadPackageItems() {
      const specification = this.specificationItems.find(t => t.value === this.specification)
      this.agentSizeCap = this.updateAgentCap(specification.cpu, specification.memory)
      const specificationLabel = this.specificationItems.find(t => t.value === this.specification)?.name
      this.currentSpecName = specificationLabel
      this.packageItems = this.allPackages
        .filter(t => this.specification === t.specification)
        .map(t => {
          return Object.assign(t, {
            desc: i18n.t('dfs_instance_create_bencidinggouzhi', {
              val1: specificationLabel
            }),
            label:
              specification?.chargeProvider !== 'FreeTier'
                ? t.label
                : this.agentDeploy !== 'selfHost'
                ? i18n.t('dfs_instance_createagent_mianfeishiyonggui')
                : i18n.t('dfs_instance_utils_baoyue')
          })
        })
        .sort((a, b) => {
          const aType = a.type === 'recurring' ? 1 : 2
          const bType = b.type === 'recurring' ? 1 : 2
          const aOrder = a.order
          const bOrder = b.order
          return aType + aOrder - (bType + bOrder)
        })
    },
    //切换规格
    changeSpec(item, disabled) {
      if (disabled) return
      this.specification = item
      this.loadPackageItems()
      if (!this.currencyType) {
        this.currencyType = this.packageItems[0]?.currency
      }
      let currentItem = this.packageItems[0]
      if (this.selected?.type && currentItem?.chargeProvider !== 'FreeTier' && this.selected?.type !== 'FreeTier') {
        currentItem = this.packageItems.find(
          it => it.type === this.selected?.type && it.periodUnit === this.selected?.periodUnit //切换规格不改变原来的订阅方式
        )
      }
      this.selected = currentItem
      if (currentItem?.chargeProvider !== 'FreeTier') {
        this.changeCurrencyOption(currentItem)
        this.currency = this.currencyOption.find(it => it.currency === this.currencyType) || {}
      } else {
        this.currencyOption = []
        this.currency = currentItem
      }
      this.buried('changeSpec')
    },
    updateAgentCap(cpu, memory) {
      return {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000
      }
    },
    formatterTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    formatPrice(item, isOriginalPrice) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0

      let amount = this.getAmount(item, isOriginalPrice)
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        ' ' +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    getAmount(item, isOriginalPrice) {
      const current = this.currentRow
      let amount = item?.amount

      // 基于单月算原价
      if (isOriginalPrice && (current.subscribeType === 'recurring' || current.periodUnit === 'year')) {
        if (current.periodUnit === 'month') {
          amount = this.singleMonthAmount
        } else if (current.periodUnit === 'year') {
          amount = this.singleYearAmount
        }
      }

      return amount
    },
    changeCurrencyOption(item) {
      const options = item.currencyOption
      const { defaultCurrencyType } = this
      // 设置了默认币种, 币种选项默认的排到第一位
      if (options?.length && defaultCurrencyType && options[0] !== defaultCurrencyType) {
        options.sort((a, b) => {
          let aVal = a.currency === defaultCurrencyType ? 0 : 1
          let bVal = b.currency === defaultCurrencyType ? 0 : 1
          return aVal - bVal
        })
      }
      this.currencyOption = options
    },
    //退订
    cancelSubmit() {
      let { id, paymentMethod } = this.currentRow
      let { resourceId } = this.agent
      let { priceId } = this.selected
      let param = {
        subscribeId: id, // 原订阅ID
        paymentMethod: paymentMethod, // 支付方式
        successUrl: location.href, // 支付成功跳转地址
        cancelUrl: location.href, // 支付失败跳转地址
        subscribeItems: [
          {
            // 跟新增订阅一样
            resourceId: resourceId, // 要变更的产品id，为空时表示新增订阅产品
            priceId: priceId, // 变更后的价格方案
            productType: 'Engine' // 产品类型：Engine,MongoDB
          }
        ]
      }
      this.$axios
        .post('api/tcm/subscribe/change', param)
        .then(data => {
          this.buried('unsubscribeAgentStripe', '', {
            result: true,
            type: ''
          })
          this.$message.success(this.$t('public_message_operation_success'))
          this.visible = false
          this.loadingCancelSubmit = false
          //刷新页面
          this.$emit('closeVisible')
          this.$router.push({
            name: 'pay',
            id: data?.id
          })
          //刷新页面
          this.$emit('closeVisible')
        })
        .finally(() => {
          this.showUnsubscribeDetailVisible = false
          this.loadingCancelSubmit = false
        })
    }
  }
}
</script>

<style scoped lang="scss"></style>

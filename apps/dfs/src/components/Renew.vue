<template>
  <ElDialog :visible.sync="showRenewDetailVisible" :title="$t('dfs_user_center_xudingfuwu')" width="60%">
    <section>
      <div v-if="renewList.length > 0">
        <VTable
          ref="table"
          row-key="id"
          :columns="renewColumns"
          :data="renewList"
          height="100%"
          :has-pagination="false"
          class="mt-4 mb-4"
        >
          <template #endAt>
            <span>{{ formatterTime(currentRenewRow.endAt) }}</span>
          </template>
        </VTable>
      </div>
      <el-form label-position="top" ref="ruleForm">
        <el-form-item :label="$t('dfs_components_renew_xudingshichang')">
          <el-input-number disabled v-model="quantity" :min="1"></el-input-number>
          <span class="ml-2">{{
            currentRenewRow.periodUnit === 'month' ? $t('public_time_month') : $t('public_time_year')
          }}</span>
          <div class="mt-2">
            {{ $t('dfs_components_renew_xudinghoudaoqi')
            }}<span class="color-warning">{{
              formatterRenewTime(currentRenewRow.periodUnit, currentRenewRow.endAt)
            }}</span>
          </div>
        </el-form-item>
      </el-form>
    </section>
    <span slot="footer" class="dialog-footer">
      <span class="mr-4"
        ><span class="fs-6 font-color-dark font-weight-light">{{ $t('dfs_components_renew_xudingjine') }}</span
        ><span class="color-primary fs-4">
          {{ formatterPrice(currentRenewRow.currency, currentPrice * quantity) }}</span
        ></span
      >
      <el-button @click="showRenewDetailVisible = false">{{ $t('public_button_cancel') }}</el-button>
      <el-button
        :disabled="currentPrice * quantity < 0"
        type="primary"
        :loading="loadingRenewSubmit"
        @click="handleRenew"
        >{{ $t('public_button_renew') }}</el-button
      >
    </span>
  </ElDialog>
</template>
<script>
import i18n from '@/i18n'

import { VTable } from '@tap/component'
import { getSpec } from '../views/instance/utils'
import { openUrl } from '@tap/shared'
import dayjs from 'dayjs'
import { CURRENCY_SYMBOL_MAP } from '@tap/business'

export default {
  name: 'Unsubscribe',
  components: { VTable },
  props: ['visible'],
  inject: ['buried'],
  data() {
    return {
      showRenewDetailVisible: false,
      quantity: 1,
      renewList: [],
      currentRenewRow: '',
      loadingRenewSubmit: false,
      currentPrice: 0,
      renewColumns: [
        {
          label: i18n.t('dfs_components_renew_dingyuebianhao'),
          prop: 'id'
        },
        {
          label: i18n.t('dfs_instance_instance_daoqishijian'),
          prop: 'endAt',
          width: 180,
          slotName: 'endAt'
        }
      ]
    }
  },
  methods: {
    //续订
    openRenew(item) {
      //组装续订列表
      let renew = {
        id: item.id,
        endAt: item.endAt
      }
      this.renewColumns = [
        {
          label: i18n.t('dfs_components_renew_dingyuebianhao'),
          prop: 'id'
        }
      ]
      let agent = item?.subscribeItems.find(it => it.productType === 'Engine')?.spec
      let specLabel = getSpec(agent)
      let mdb = item?.subscribeItems.find(it => it.productType === 'MongoDB')?.spec
      let specMdbLabel = getSpec(mdb)
      if (specLabel) {
        this.renewColumns.push({
          label: i18n.t('dfs_components_renew_shiliguige'),
          prop: 'specLabel',
          width: 180
        })
        renew.specLabel = specLabel
      }
      if (specMdbLabel) {
        this.renewColumns.push({
          label: i18n.t('dfs_instance_createagent_cunchuguige'),
          prop: 'specMdbLabel',
          width: 180
        })
        renew.specMdbLabel = specMdbLabel
      }
      this.renewColumns.push({
        label: i18n.t('dfs_instance_instance_daoqishijian'),
        prop: 'endAt',
        width: 180,
        slotName: 'endAt'
      })
      this.renewList = [renew]
      this.showRenewDetailVisible = true
      this.currentRenewRow = item
      let url = 'api/tcm/orders/paid/prices?prices=' + item?.subscribeItems[0].priceId
      if (item?.subscribeItems?.length > 1) {
        url =
          'api/tcm/orders/paid/prices?prices=' + item?.subscribeItems[0].priceId + ',' + item?.subscribeItems[1].priceId
      }
      this.$axios.get(url).then(data => {
        this.currentRenewRow.currency = item?.currency
        //根据当前币种过滤出价格
        if (data?.[0]) {
          this.currentPrice = data?.[0].currencyOption.find(it => it.currency === item?.currency).amount || 0
        }
        if (data?.length > 1) {
          this.currentPrice =
            data?.[0].currencyOption.find(it => it.currency === item?.currency).amount +
            data?.[1].currencyOption.find(it => it.currency === item?.currency).amount
        }
      })
    },
    handleRenew() {
      let { id } = this.currentRenewRow
      const params = {
        subscribeId: id,
        quantity: this.quantity,
        successUrl: location.href,
        cancelUrl: location.href
      }
      this.loadingRenewSubmit = true
      this.buried('renewAgentStripe')
      this.$axios
        .post('api/tcm/subscribe/renew', params)
        .then(data => {
          this.showRenewDetailVisible = false
          this.loadingRenewSubmit = false
          //刷新页面
          this.$emit('closeVisible')
          // openUrl(data.payUrl)
          this.buried('renewAgentStripe', '', {
            result: true
          })

          this.$router.push({
            name: 'payForRenew',
            params: {
              id: data.subscribe
            }
          })
        })
        .catch(() => {
          this.buried('renewAgentStripe', '', {
            result: false
          })
        })
        .finally(() => {
          this.showRenewDetailVisible = false
          this.loadingRenewSubmit = false
        })
    },
    formatterTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    formatterPrice(currency, price) {
      if (price === 0) {
        return 0
      }
      return (
        CURRENCY_SYMBOL_MAP[currency] +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    formatterRenewTime(periodUnit, time) {
      let date = new Date(time) //直接用 new Date(时间戳) 格式转化获得当前时间
      let expiredTime = date.setMonth(date.getMonth() + this.quantity)
      if (periodUnit === 'year') {
        expiredTime = date.setFullYear(date.getFullYear() + this.quantity)
      }
      return dayjs(expiredTime).format('YYYY-MM-DD')
    }
  }
}
</script>

<style scoped lang="scss"></style>

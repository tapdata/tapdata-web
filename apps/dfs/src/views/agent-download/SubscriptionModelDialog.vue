<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    :title="$t('dfs_agent_download_subscriptionmodeldialog_peizhishishishu')"
    width="75%"
    :before-close="close"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('dfs_agent_download_subscriptionmodeldialog_xuanzebushulei')" name="first">
        <div class="configure-main">
          <el-radio-group class="flex mb-4" v-model="productType" @change="selectProductType">
            <el-radio class="width50 fs-6 fw-sub" label="selfHost">{{
              $t('dfs_agent_download_subscriptionmodeldialog_bantuoguanmoshi')
            }}</el-radio>
            <el-radio class="fs-6 fw-sub" label="fullManagement" disabled>{{
              $t('dfs_agent_download_subscriptionmodeldialog_quantuoguanmoshi')
            }}</el-radio>
          </el-radio-group>
          <div class="flex">
            <section class="content-left width50">
              <div class="mt-2 fw-sub">{{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi2') }}</div>
              <div class="mt-2 fw-sub">{{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongbantuoguan') }}</div>
              <ul>
                <li class="mt-2 font-color-light">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_chengbengengdichong') }}
                </li>
                <li class="mt-2 font-color-light">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiaanquanyong') }}
                </li>
                <li class="img-box mt-4">
                  <el-image :src="getImg('halfManagement')" alt="" />
                </li>
              </ul>
            </section>
            <section class="content-right width50">
              <div class="mt-2 fw-sub">{{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi') }}</div>
              <div class="mt-2 fw-sub">{{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongquantuoguan') }}</div>
              <ul>
                <li class="mt-2 font-color-light">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiafangbianmian') }}
                </li>
                <li class="mt-2 font-color-light">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiakekaoyou') }}
                </li>
                <li class="img-box mt-4">
                  <el-image :src="getImg('fullManagement')" alt="" />
                </li>
              </ul>
            </section>
          </div>
          <el-link type="primary" @click="changeProductType">{{
            $t('dfs_agent_download_subscriptionmodeldialog_zhijieshiyonga')
          }}</el-link>
          <!--          <span class="ml-4"-->
          <!--            >依然不知道如何选择? <span class="color-primary cursor-pointer">点击这里</span>了解更多的区别</span-->
          <!--          >-->
        </div>
        <footer class="flex justify-content-end">
          <el-button type="primary" @click="next('second')">{{ $t('public_button_next') }}</el-button>
        </footer>
      </el-tab-pane>
      <el-tab-pane :label="$t('dfs_agent_download_subscriptionmodeldialog_peizhibushugui')" name="second">
        <section v-if="productType !== 'aliyun'">
          <div class="spec-main flex justify-content-between mt-6">
            <!--规格配置-->
            <div class="flex flex-column flex-1">
              <div class="flex align-items-center">
                <div class="label">
                  <div class="agent_size">{{ $t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu') }}</div>
                  <div class="agent_size_cap">
                    {{ $t('dfs_agent_download_subscriptionmodeldialog_guigeshuomingci') }}{{ agentSizeCap.mem
                    }}{{ $t('dfs_agent_download_subscriptionmodeldialog_keyongneicunjian') }}{{ agentSizeCap.pipeline
                    }}{{ $t('dfs_agent_download_subscriptionmodeldialog_geyugumeimiao') }}{{ agentSizeCap.tps
                    }}{{ $t('dfs_agent_download_subscriptionmodeldialog_zuoyou') }}
                  </div>
                </div>
                <div class="value agent_plan">
                  <el-radio-group v-model="specification" @change="changeSpec">
                    <el-radio
                      class="mt-4 block"
                      v-for="(item, index) in specificationItems"
                      :disabled="agentCount > 0 && item.chargeProvider === 'FreeTier'"
                      :key="index"
                      :label="item.value"
                      >{{ item.name }}: {{ item.desc }}</el-radio
                    >
                  </el-radio-group>
                </div>
              </div>
              <div class="flex align-items-center mt-8">
                <div class="label payment_plan">{{ $t('dfs_instance_instance_dingyuefangshi') }}</div>
                <div class="value">
                  <ul class="flex justify-content-start flex-wrap">
                    <li
                      v-for="(item, index) in packageItems"
                      :key="index"
                      class="specification-item cursor-pointer py-2 px-4 mr-4 mt-4"
                      :class="{
                        active: selected.value === item.value
                      }"
                      @click="handleChange(item)"
                    >
                      {{ item.label }}
                    </li>
                  </ul>
                </div>
              </div>
              <!--选择币种-->
              <div class="flex align-items-center mt-8" v-if="currencyOption && currencyOption.length !== 0">
                <div class="label payment_plan">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_xuanzebizhong') }}
                </div>
                <div class="value">
                  <ul class="flex justify-content-start flex-wrap">
                    <li
                      v-for="(item, index) in currencyOption"
                      :key="index"
                      class="specification-item cursor-pointer py-2 px-4 mr-4 mt-4"
                      :class="{
                        active: currencyType === item.currency
                      }"
                      @click="changeCurrency(item)"
                    >
                      {{ CURRENCY_MAP[item.currency] }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <!--价格清单 -->
            <div class="price-list flex flex-column">
              <div class="title">{{ $t('dfs_agent_download_subscriptionmodeldialog_meiyuefeiyongyu') }}</div>
              <ul class="flex flex-1 content">
                <li class="item">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_jisuan') }}{{ formatPrice(currency) }}
                </li>
              </ul>
              <div class="total">
                {{ $t('public_total') }}: <span class="price">{{ formatPrice(currency) }}</span>
              </div>
            </div>
          </div>
          <footer class="flex justify-content-end mt-4">
            <el-button @click="next('first')">{{ $t('public_button_previous') }}</el-button>
            <el-button type="primary" @click="next('third')">{{ $t('public_button_next') }}</el-button>
          </footer>
        </section>
        <section v-else v-loading="aliyunLoading">
          <div class="aliyun-main">
            <div v-if="hiddenNewCode">
              <VTable
                :columns="columns"
                :data="codeData"
                :has-pagination="false"
                ref="tables"
                class="subscript-table"
                max-height="280px"
              >
                <template #operation="{ row }">
                  <ElButton type="text" @click="submit(row)">{{
                    $t('public_button_create') + ' ' + $t('public_agent')
                  }}</ElButton>
                </template>
              </VTable>
              <div class="mt-4 cursor-pointer color-primary" @click="handleNewCode(false)">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_jihuoxinshouquan') }}
              </div>
            </div>
            <div v-else>
              <div class="flex justify-content-center align-items-center">
                <img class="text-center" :src="getAliiyunImg('aliyun-license-code')" />
              </div>
              <ul class="step mt-4">
                <li class="flex align-items-center">
                  <span>{{ $t('dfs_aliyun_market_license_dianjidakai') }}</span>
                  <a
                    class="color-primary text-decoration-underline"
                    href="https://market.aliyun.com/products/56024006/cmgj00061912.html?spm=5176.730005.result.4.519c3524QzKxHM&innerSource=search_tapdata#sku=yuncode5591200001"
                    target="_blank"
                    >{{ $t('dfs_aliyun_market_license_aliyunshichang') }}</a
                  >
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_goumai') }}
                </li>
                <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
                <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
              </ul>
              <div class="flex mt-4">
                <span class="label-code mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</span>
                <el-input v-model="licenseCode" type="textarea" rows="2" autofocus></el-input>
              </div>
              <el-button class="mt-4" style="margin-left: 65px" type="primary" :loading="saveLoading" @click="save()"
                >{{ $t('dfs_aliyun_market_license_jihuo')
                }}{{ $t('dfs_agent_download_subscriptionmodeldialog_bingbushu') }}</el-button
              >
              <span
                v-if="codeData.length > 0"
                class="ml-4 mt-4 cursor-pointer font-color-light"
                @click="handleNewCode(true)"
                >{{ $t('dfs_agent_download_subscriptionmodeldialog_ninyouyijihuo') }}</span
              >
            </div>
          </div>
        </section>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('dfs_agent_download_subscriptionmodeldialog_chakanbingqueren')"
        name="third"
        v-if="productType !== 'aliyun'"
      >
        <div class="flex flex-column review">
          <div class="flex-1 px-4">
            <div class="mt-4 fx-6 font-color-dark">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_peizhizhaiyao') }}
            </div>
            <div class="mt-4 font-color-light">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_jisuanziyuan')
              }}<span class="font-color-dark">{{ specMap[currentSpecName] || specification }}</span>
            </div>
            <div class="mt-4 font-color-light">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_dingyuefangshi')
              }}<span class="font-color-dark">{{ selected.label }}</span>
            </div>
            <div class="mt-4 font-color-light">{{ $t('dfs_instance_create_jieshouzhangdande') }}</div>
            <ElForm class="mt-4" style="width: 520px" :model="form" ref="from">
              <ElFormItem prop="email" :rules="getEmailRules()">
                <ElInput v-model="form.email" :placeholder="getPlaceholder()"></ElInput>
              </ElFormItem>
            </ElForm>
          </div>
          <footer class="flex justify-content-end align-items-center mt-4">
            <div class="mr-6">
              {{ $t('public_total') }}: <span class="price">{{ formatPrice(currency) || 0 }}</span>
            </div>
            <el-button @click="next('second')">{{ $t('public_button_previous') }}</el-button>
            <el-button :loading="submitLoading" type="primary" @click="submit()">{{
              $t('public_button_confirm')
            }}</el-button>
          </footer>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { openUrl, uniqueArr } from '@tap/shared'
import { VTable } from '@tap/component'
import { getPaymentMethod, getSpec } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP, TIME_MAP, CURRENCY_MAP } from '@tap/business'
import i18n from '@/i18n'
import { dayjs } from '@tap/business/src/shared/dayjs'

export default {
  name: 'subscriptionModelDialog',
  inject: ['buried'],
  components: { VTable },
  props: {
    visible: {
      type: Boolean
    },
    showClose: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.checkAgentCount()
        this.activeName = 'first'
        this.productType = 'selfHost'
      }
    }
  },
  data() {
    return {
      productType: 'selfHost',
      activeName: 'first',
      allPackages: '',
      packageItems: [],
      specificationItems: [],
      specification: '',
      email: '',
      selected: {},
      form: {
        email: ''
      },
      specMap: {
        '1C2G': i18n.t('dfs_agent_download_subscriptionmodeldialog_extra')
      },
      CURRENCY_MAP: CURRENCY_MAP,
      licenseCode: '',
      saveLoading: false,
      submitLoading: false,
      codeData: [],
      agentCount: 0,
      currentCode: {},
      hiddenNewCode: false,
      aliyunLoading: false,
      currentSpecName: '1C2G',
      currencyOption: [],
      currency: '',
      currencyType: '',
      agentSizeCap: {
        mem: '-',
        pipeline: '-',
        tps: '-'
      },
      columns: [
        {
          label: i18n.t('dfs_instance_selectlist_shouquanma'),
          prop: 'licenseCode',
          minWidth: 300
        },
        {
          label: i18n.t('dfs_instance_selectlist_youxiaoqi'),
          prop: 'expiredTimeLabel'
        },
        {
          label: i18n.t('dfs_instance_selectlist_shiliguige'),
          prop: 'specLabel'
        },
        {
          label: i18n.t('dfs_instance_selectlist_bangdingshilizhuang'),
          prop: 'bindAgent'
        },
        {
          label: i18n.t('public_operation'),
          prop: 'operation',
          slotName: 'operation',
          width: 120
        }
      ]
    }
  },
  mounted() {
    this.checkAgentCount()
    this.form.email = window.__USER_INFO__.email
    this.currencyType = window.__config__?.currencyType
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    next(val) {
      this.activeName = val
      this.buried('productTypeNext')
    },
    //选择订阅模式
    changeProductType() {
      this.productType = 'aliyun'
      this.activeName = 'second'
      this.getAvailableCode()
      this.buried('productTypeAliyunCode')
    },
    //切换规格
    changeSpec() {
      this.loadPackageItems()
      if (!this.currencyType) {
        this.currencyType = this.packageItems[0]?.currency
      }
      this.handleChange(this.packageItems[0])
      this.buried('changeSpec')
    },
    //切换订阅方式
    handleChange(item = {}) {
      this.selected = item
      if (item?.chargeProvider !== 'FreeTier') {
        this.currencyOption = item.currencyOption
        this.currency = this.currencyOption.filter(it => it.currency === this.currencyType)?.[0] || {}
      } else {
        this.currencyOption = []
        this.currency = item
      }
      this.buried('changeSubscriptionMethod')
    },
    //切换币种
    changeCurrency(item) {
      this.currencyType = item.currency
      this.currency = item
    },
    //格式化价格
    formatPrice(item) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        (item.amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    selectProductType() {
      this.buried('productTypeSelfHost')
    },
    checkAgentCount() {
      let filter = { where: { 'orderInfo.chargeProvider': 'FreeTier' } }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        this.agentCount = data?.total
        this.getPrice()
      })
    },
    getImg(name) {
      return require(`../../../public/images/agent/${name}.jpg`)
    },
    getAliiyunImg(name) {
      return require(`../../../public/images/dashboard/${name}.svg`)
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
    updateAgentCap(cpu, memory) {
      this.agentSizeCap = {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000
      }
    },
    getPrice() {
      const params = {
        productType: this.productType
      }
      this.$axios.get('api/tcm/paid/plan/getPaidPlan', { params }).then(data => {
        const { paidPrice = [] } = data?.[0] || {}
        // 规格
        this.specificationItems = uniqueArr(
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
        this.specification = this.agentCount > 0 ? this.specificationItems[1]?.value : this.specificationItems[0]?.value
        // 价格套餐
        this.allPackages = paidPrice.map(t => {
          return Object.assign(t, {
            label: getPaymentMethod(t),
            value: t.priceId,
            price: t.price,
            priceSuffix: t.type === 'recurring' ? TIME_MAP[t.periodUnit] : '',
            desc: '',
            specification: getSpec(t.spec),
            currencyOption: t.currencyOption
          })
        })
        this.loadPackageItems()
        this.changeCurrency(this.packageItems[0])
        this.handleChange(this.packageItems[0])
      })
    },
    loadPackageItems() {
      const specification = this.specificationItems.find(t => t.value === this.specification)
      this.updateAgentCap(specification.cpu, specification.memory)
      const specificationLabel = this.specificationItems.find(t => t.value === this.specification)?.name
      const chargeProvider = this.specificationItems.find(t => t.value === this.specification)?.chargeProvider
      this.currentSpecName = specificationLabel
      this.packageItems = this.allPackages
        .filter(t => this.specification === t.specification)
        .map(t => {
          return Object.assign(t, {
            desc: i18n.t('dfs_instance_create_bencidinggouzhi', {
              val1: specificationLabel
            })
          })
        })
        .sort((a, b) => {
          return a.order < b.order ? -1 : a.periodUnit < b.periodUnit ? -1 : 1
        })
      if (chargeProvider === 'FreeTier') {
        this.packageItems = [
          {
            label: i18n.t('dfs_agent_download_subscriptionmodeldialog_yongjiu'),
            price: 0,
            value: '0',
            chargeProvider: 'FreeTier',
            currencyOption: []
          }
        ]
      }
    },
    getEmailRules() {
      return [
        {
          required: this.selected.type === 'recurring',
          message: i18n.t('dfs_instance_create_qingshuruninde')
        },
        {
          type: 'email',
          message: i18n.t('dfs_instance_create_qingshuruzhengque')
        }
      ]
    },
    getPlaceholder() {
      return this.selected.type === 'recurring'
        ? i18n.t('dfs_instance_create_yongyujieshoumei')
        : i18n.t('dfs_instance_create_kexuan')
    },
    //提交订单
    submit(row = {}) {
      const { type, priceId, currency, chargeProvider } = this.selected
      const { email } = this.form

      const fastDownloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: ''
        }
      })
      let params = {}

      if (this.productType === 'aliyun') {
        params = {
          agentType: 'Local',
          chargeProvider: 'Aliyun',
          licenseId: row?.id
        }
        this.buried('selectAgentAliyun')
      } else {
        params = {
          agentType: 'Local',
          chargeProvider,
          priceId,
          currency: this.currencyType || currency,
          successUrl: location.origin + '/' + fastDownloadUrl.href,
          cancelUrl: location.href,
          email,
          type
        }
      }

      this.buried('newAgentStripe', '', {
        type
      })
      this.submitLoading = true
      this.$axios
        .post('api/tcm/orders', params)
        .then(data => {
          this.submitLoading = false
          if (chargeProvider === 'FreeTier') {
            let downloadUrl = window.App.$router.resolve({
              name: 'FastDownload',
              query: {
                id: data?.agentId
              }
            })

            window.open(downloadUrl.href, '_blank')
          } else {
            window.open(data?.paymentUrl, '_blank')
          }
          this.finish()
          this.buried('newAgentStripe', '', {
            type,
            result: true
          })
        })
        .catch(() => {
          this.buried('newAgentStripe', '', {
            type,
            result: false
          })
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    finish() {
      this.$message.success(this.$t('public_message_operation_success'))
      this.close()
    },
    //激活
    handleNewCode(val) {
      this.hiddenNewCode = val
      this.buried('goActivateCode')
    },
    save() {
      this.saveLoading = true
      this.buried('activateAliyunCode')
      this.$axios
        .post('api/tcm/aliyun/market/license/activate', { licenseCode: this.licenseCode })
        .then(data => {
          if (data.licenseStatus === 'ACTIVATED') {
            this.submit(data)
            this.buried('activateAliyunCode', '', {
              result: true
            })
          } else {
            this.close()
            this.buried('activateAliyunCode', '', {
              result: false
            })
          }
        })
        .catch(() => {
          this.buried('activateAliyunCode', '', {
            result: false
          })
        })
        .finally(() => {
          this.saveLoading = false
        })
    },
    getAvailableCode() {
      this.aliyunLoading = true
      this.$axios
        .get('api/tcm/aliyun/market/license/available')
        .then(data => {
          this.codeData =
            data.map((t = {}) => {
              t.bindAgent = t.agentId
                ? i18n.t('dfs_instance_selectlist_yibangding') + t.agentId
                : i18n.t('user_Center_weiBangDing')
              t.specLabel = getSpec(t.spec)
              t.expiredTimeLabel = t.expiredTime ? dayjs(t.expiredTime).format('YYYY-MM-DD') : '-'
              return t
            }) || []
          this.hiddenNewCode = this.codeData?.length > 0
          this.aliyunLoading = false
        })
        .finally(() => {
          this.aliyunLoading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
.configure-main {
  padding: 20px 40px 0 40px;
}
.spec-main {
  padding: 20px 40px;
  height: 467px;
}
.aliyun-main {
  padding: 20px 40px;
  height: 541px;
}
.width50 {
  width: 50%;
}
.img-box {
  width: 400px;
  height: 310px;
  img {
    width: 100%;
    height: 100%;
  }
}
.content-right {
  margin-left: 30px;
}
.btn {
  size: 16px;
  font-weight: 500;
  padding: 12px 0;
  width: 120px;
  text-align: center;
  border: 1px solid map-get($borderColor, normal);
}
.price-list {
  border-radius: 4px;
  border: 1px solid map-get($borderColor, normal);
  width: 260px;
  height: 300px;
  margin-top: 66px;
}
.title {
  size: 16px;
  font-weight: 500;
  line-height: 36px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  border-bottom: 1px solid map-get($borderColor, normal);
}
.item {
  size: 16px;
  font-weight: 500;
  padding: 16px;
}
.total {
  text-align: right;
  padding: 8px;
  border-top: 1px solid map-get($borderColor, normal);
}
.review {
  height: 541px;
}
.specification-item {
  border: 1px solid map-get($borderColor, normal);
  border-radius: 8px;
  &.active {
    border-color: map-get($color, primary);
  }
}
.label {
  width: 268px;
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
.label-code {
  width: 70px;
}
.price {
  font-weight: 400;
  font-size: 24px;
  color: map-get($color, primary);
}
.subscript-table {
  ::v-deep {
    .subscript-table thead .el-table-column--selection .cell {
      display: none;
    }
  }
}
.agent_size {
  padding-bottom: 50px;
  font-size: 18px;
}

.agent_size_cap {
  line-height: 2;
}
.agent_plan {
  margin-left: 50px;
}
.payment_plan {
  font-size: 16px;
  padding-top: 20px;
  color: #2c65ff;
}
</style>

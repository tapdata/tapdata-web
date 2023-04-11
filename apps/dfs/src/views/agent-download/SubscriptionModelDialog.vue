<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    title="Configure Live Data Platform"
    width="75%"
    :before-close="close"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="Select Deployment Type" name="first">
        <div class="configure-main">
          <el-radio-group class="flex mb-4" v-model="productType" @change="selectProductType">
            <el-radio class="width50 fs-6 fw-sub" label="selfHost">半托管模式</el-radio>
            <el-radio class="fs-6 fw-sub" label="fullManagement" disabled>全托管模式 (即将上线)</el-radio>
          </el-radio-group>
          <div class="flex">
            <section class="content-left width50">
              <div class="mt-2 fw-sub">在这种模式下, 你需要自己提供自己计算资源与存储资源</div>
              <div class="mt-2 fw-sub">使用半托管模式的好处：</div>
              <ul>
                <li class="mt-2 font-color-light">- 成本更低: 充分利用已有硬件资源, 同样的规格下产品价格低很多</li>
                <li class="mt-2 font-color-light">- 更加安全: 用户的数据不会经过包括 Tapdata 在内的任意外部网络</li>
                <li class="img-box mt-4">
                  <el-image :src="getImg('halfManagement')" alt="" />
                </li>
              </ul>
            </section>
            <section class="content-right width50">
              <div class="mt-2 fw-sub">在这种模式下, Tapdata 提供所有的计算及存储资源.</div>
              <div class="mt-2 fw-sub">使用全托管模式的好处：</div>
              <ul>
                <li class="mt-2 font-color-light">- 更加方便: 免部署, 一键交付使用</li>
                <li class="mt-2 font-color-light">- 更加可靠: 由 Tapdata 提供资源使用的维护与监控, 运行更可靠</li>
                <li class="img-box mt-4">
                  <el-image :src="getImg('fullManagement')" alt="" />
                </li>
              </ul>
            </section>
          </div>
          <el-link type="primary" @click="changeProductType">直接使用阿里云市场授权码</el-link>
          <span class="ml-4"
            >依然不知道如何选择? <span class="color-primary cursor-pointer">点击这里</span>了解更多的区别</span
          >
        </div>
        <footer class="flex justify-content-end">
          <el-button type="primary" @click="next('second')">Next</el-button>
        </footer>
      </el-tab-pane>
      <el-tab-pane label="Configure Deployment Spec" name="second">
        <section v-if="productType !== 'aliyun'">
          <div class="spec-main flex justify-content-between mt-6">
            <div class="flex flex-column flex-1">
              <div class="flex align-items-center">
                <div class="label">
                  <div class="agent_size">请选择您需要的产品规格</div>
                  <div class="agent_size_cap">
                    规格说明: 此规格需要至少 {{ agentSizeCap.mem }} 可用内存, 建议的任务数不超过
                    {{ agentSizeCap.pipeline }} 个, 预估每秒同步的性能在 {{ agentSizeCap.tps }} 左右
                  </div>
                </div>
                <div class="value agent_plan">
                  <el-radio-group v-model="specification" @change="changeSpec">
                    <el-radio
                      class="mt-4 block"
                      v-for="(item, index) in specificationItems"
                      :disabled="agentCount > 0 && item.chargeProvider === 'FreeTrial'"
                      :key="index"
                      :label="item.value"
                      >{{ item.name }}: {{ item.desc }}</el-radio
                    >
                  </el-radio-group>
                </div>

              </div>
              <div class="flex align-items-center mt-8">
                <div class="label payment_plan">订阅方式</div>
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
            </div>
            <div class="price-list flex flex-column">
              <div class="title">Estimated Monthly Cost</div>
              <ul class="flex flex-1 content">
                <li class="item">Compute: {{ selected.price }}</li>
              </ul>
              <div class="total">
                Total: <span class="price">{{ selected.price }}</span>
              </div>
            </div>
          </div>
          <footer class="flex justify-content-end mt-4">
            <el-button @click="next('first')">Previous</el-button>
            <el-button type="primary" @click="next('third')">Next</el-button>
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
              <div class="mt-4 cursor-pointer color-primary" @click="handleNewCode(false)">激活新授权码</div>
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
                  购买
                </li>
                <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
                <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
              </ul>
              <div class="flex mt-4">
                <span class="label-code mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</span>
                <el-input v-model="licenseCode" type="textarea" rows="2" autofocus></el-input>
              </div>
              <el-button class="mt-4" style="margin-left: 65px" type="primary" :loading="saveLoading" @click="save()"
                >{{ $t('dfs_aliyun_market_license_jihuo') }}并部署</el-button
              >
              <span
                v-if="codeData.length > 0"
                class="ml-4 mt-4 cursor-pointer font-color-light"
                @click="handleNewCode(true)"
                >您有已激活未绑定的授权码，点击创建实例</span
              >
            </div>
          </div>
        </section>
      </el-tab-pane>
      <el-tab-pane label="Review & Confirm" name="third" v-if="productType !== 'aliyun'">
        <div class="flex flex-column review">
          <div class="flex-1 px-4">
            <div class="mt-4 fx-6 font-color-dark">Configuration Summary</div>
            <div class="mt-4 font-color-light">
              计算资源：<span class="font-color-dark">{{ specMap[currentSpecName] || specification }}</span>
            </div>
            <div class="mt-4 font-color-light">
              订阅方式：<span class="font-color-dark">{{ selected.label }}</span>
            </div>
            <div class="mt-4 font-color-light">接收账单的邮箱</div>
            <ElForm class="mt-4" style="width: 520px" :model="form" ref="from">
              <ElFormItem prop="email" :rules="getEmailRules()">
                <ElInput v-model="form.email" :placeholder="getPlaceholder()"></ElInput>
              </ElFormItem>
            </ElForm>
          </div>
          <footer class="flex justify-content-end align-items-center mt-4">
            <div class="mr-6">
              Total: <span class="price">{{ selected.price || 0 }}</span>
            </div>
            <el-button @click="next('second')">Previous</el-button>
            <el-button type="primary" @click="submit()">CONFIRM</el-button>
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
import { CURRENCY_SYMBOL_MAP, TIME_MAP } from '@tap/business'
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
        '1C2G': 'EXTRA SMALL: 1C 2G - FREE(只能创建一个)'
      },
      licenseCode: '',
      saveLoading: false,
      codeData: [],
      agentCount: 0,
      currentCode: {},
      hiddenNewCode: false,
      aliyunLoading: false,
      currentSpecName: '1C2G',
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
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    next(val) {
      this.activeName = val
      this.buried('productTypeNext')
    },
    changeProductType() {
      this.productType = 'aliyun'
      this.activeName = 'second'
      this.getAvailableCode()
      this.buried('productTypeAliyunCode')
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
            let desc = '任务数建议小于 ' + this.getSuggestPipelineNumber(cpu, memory) + ' 个'
            if (t.chargeProvider == 'FreeTier') {
              desc = '免费实例, 最多允许创建 3 个任务'
            }
            return {
              label: getSpec(t.spec),
              value: getSpec(t.spec),
              cpu,
              memory,
              name: t.spec.name.toUpperCase(),
              chargeProvider: t.chargeProvider,
              desc: desc,
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
            price:
              CURRENCY_SYMBOL_MAP[t.currency] +
              (t.price / 100).toLocaleString('zh', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
            priceSuffix: t.type === 'recurring' ? TIME_MAP[t.periodUnit] : '',
            desc: '',
            specification: getSpec(t.spec)
          })
        })
        this.loadPackageItems()
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
        this.packageItems = [{ label: '永久', price: 0, value: '0', chargeProvider: 'FreeTier' }]
      }
    },
    handleChange(item = {}) {
      this.selected = item
      this.buried('changeSubscriptionMethod')
    },
    changeSpec() {
      this.loadPackageItems()
      this.handleChange(this.packageItems[0])
      this.buried('changeSpec')
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
          currency,
          successUrl: location.origin + '/' + fastDownloadUrl.href,
          cancelUrl: location.href,
          email,
          type
        }
      }

      this.buried('newAgentStripe', '', {
        type
      })
      this.$axios
        .post('api/tcm/orders', params)
        .then(data => {
          if (chargeProvider === 'FreeTier') {
            let downloadUrl = window.App.$router.resolve({
              name: 'FastDownload',
              query: {
                id: data?.agentId
              }
            })

            window.open(downloadUrl.href, '_blank')
          } else {
            openUrl(data?.paymentUrl)
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

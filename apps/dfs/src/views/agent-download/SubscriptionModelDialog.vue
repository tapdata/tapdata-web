<template>
  <el-dialog :visible.sync="visible" title="Configure Live Data Platform" width="75%">
    <el-tabs v-model="activeName">
      <el-tab-pane label="Select Deployment Type" name="first">
        <div class="configure-main">
          <el-radio-group class="flex mb-4" v-model="productType">
            <el-radio class="width50 font-weight-bold" label="selfHost">半托管模式</el-radio>
            <el-radio class="font-weight-bold" label="fullManagement" disabled>全托管模式</el-radio>
          </el-radio-group>
          <div class="flex">
            <section class="content-left width50">
              <div class="mt-2">在这种模式下, 你提供自己的计算资源和存储资源(如果选择了DaaS 模式).</div>
              <div class="mt-2">使用半托管模式的好处：</div>
              <ul>
                <li class="mt-2">- 成本更可控, Tapdata 不会收取这部分的费用</li>
                <li class="mt-2">- 更加安全: 核心的数据不会经过或存到 Tapdata 网络内</li>
                <li class="img-box mt-4">
                  <el-image :src="getImg('halfManagement')" alt="" />
                </li>
              </ul>
            </section>
            <section class="content-right width50">
              <div class="mt-2">在这种模式下, Tapdata 提供所有的计算及存储资源.</div>
              <div class="mt-2">使用全托管模式的好处：</div>
              <ul>
                <li class="mt-2">- 更加方便, 交钥匙方案</li>
                <li class="mt-2">- 更加可靠,由Tapdata来保障服务的稳定运行，服务更加可靠</li>
                <li class="img-box mt-4">
                  <el-image :src="getImg('fullManagement')" alt="" />
                </li>
              </ul>
            </section>
          </div>
          <el-link @click="changeProductType">直接使用阿里云市场授权码</el-link>
          <footer class="flex justify-content-end">
            <el-button type="primary" @click="next('second')">Next</el-button>
          </footer>
          <el-link class="flex justify-content-center">依然不知道如何选择? 点击 这里 了解更多的区别</el-link>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Configure Deployment Spec" name="second">
        <section v-if="productType !== 'aliyun'">
          <div class="spec-main flex justify-content-between mt-6">
            <div class="flex flex-column flex-1">
              <div class="flex align-items-center">
                <div class="label">
                  <div>选择你所需要的计算资源大小</div>
                  <div>(每个Core我们不建议超过2个任务)</div>
                </div>
                <div class="value">
                  <el-radio-group v-model="specification" @change="changeSpec()">
                    <el-radio
                      class="mt-4 block"
                      v-for="(item, index) in specificationItems"
                      :key="index"
                      :label="item.value"
                      >{{ specMap[item.label] || item.label }}</el-radio
                    >
                  </el-radio-group>
                </div>
              </div>
              <div class="flex align-items-center mt-8">
                <div class="label">订阅方式</div>
                <div class="value">
                  <ul class="flex justify-content-start">
                    <li
                      v-for="(item, index) in packageItems"
                      :key="index"
                      class="specification-item cursor-pointer py-2 px-4"
                      :class="{
                        active: selected.value === item.value,
                        'mr-4': index !== packageItems.length - 1
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
              <div class="total">Total: {{ selected.price }}</div>
            </div>
          </div>
          <footer class="flex justify-content-end mt-4">
            <el-button @click="next('first')">Previous</el-button>
            <el-button type="primary" @click="next('third')">Next</el-button>
          </footer>
        </section>
        <section v-else>
          <div class="spec-main">
            <div class="flex justify-content-center align-items-center">
              <img class="text-center" :src="getAliyunImg('aliyun-license-code')" />
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
              </li>
              <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
              <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
            </ul>
            <div class="flex mt-4">
              <span class="label-code mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</span>
              <el-input v-model="licenseCode" type="textarea" rows="2" autofocus></el-input>
            </div>
          </div>
          <footer class="flex justify-content-end mt-4">
            <el-button @click="next('first')">Previous</el-button>
            <el-button type="primary" :loading="saveLoading" @click="save()">{{
              $t('dfs_aliyun_market_license_jihuo')
            }}</el-button>
          </footer>
        </section>
      </el-tab-pane>
      <el-tab-pane label="Review & Confirm" name="third" v-if="productType !== 'aliyun'">
        <div class="flex flex-column review">
          <div class="mt-4">Configuration Summary</div>
          <div class="flex-1">
            <div class="mt-4">计算资源：{{ specMap[specification] || specification }}</div>
            <div class="mt-4">订阅方式：{{ selected.label }}</div>
            <div class="mt-4">接收账单的邮箱</div>
            <ElForm class="mt-4" style="width: 520px" :model="form" ref="from">
              <ElFormItem prop="email" :rules="getEmailRules()">
                <ElInput v-model="form.email" :placeholder="getPlaceholder()"></ElInput>
              </ElFormItem>
            </ElForm>
          </div>
          <footer class="flex justify-content-end align-items-center mt-4">
            <div class="mr-6">
              Total: <span>{{ selected.price }}</span>
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
import { getPaymentMethod, getSpec } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP, TIME_MAP } from '@tap/business'
import i18n from '@/i18n'

export default {
  name: 'subscriptionModelDialog',
  inject: ['buried'],
  props: {
    visible: {
      type: Boolean
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
        'min small': 'EXTRA SMALL: 1C 2G - FREE',
        Small: 'SMALL: 2C 4G, up to 4 Concurrent Pipelines',
        Medium: 'MEDIUM: 4C 8G, up to 8 Concurrent Pipeliens',
        Large: 'LARGE: 8C 16G, up to 16 Pipeline tssks',
        '2Large': 'EXTRA LARGE: 16C 32G'
      },
      licenseCode: '',
      saveLoading: false
    }
  },
  mounted() {
    this.getPrice()
    this.form.email = window.__USER_INFO__.email
  },
  methods: {
    next(val) {
      this.activeName = val
    },
    changeProductType() {
      this.productType = 'aliyun'
      this.activeName = 'second'
    },
    getImg(name) {
      return require(`../../../public/images/agent/${name}.jpg`)
    },
    //查询定价列表
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
            return {
              label: getSpec(t.spec),
              value: getSpec(t.spec),
              cpu,
              memory
            }
          }),
          'value'
        ).sort((a, b) => {
          return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
        })
        this.specification = this.specificationItems[0]?.value
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
      const specificationLabel = this.specificationItems.find(t => t.value === this.specification)?.label
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
      if (specificationLabel === 'min small') {
        this.packageItems = [
          { label: '连续包月', price: 0, value: '0', chargeProvider: 'FreeTier' },
          { label: '订购一个月', price: 0, value: '1', chargeProvider: 'FreeTier' },
          { label: '连续包年', price: 0, value: '2', chargeProvider: 'FreeTier' },
          { label: '订购一年', price: 0, value: '3', chargeProvider: 'FreeTier' }
        ]
      }
    },
    handleChange(item = {}) {
      this.selected = item
    },
    changeSpec() {
      this.loadPackageItems()
      this.handleChange(this.packageItems[0])
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
    submit() {
      const { type, priceId, currency, chargeProvider } = this.selected
      const { email } = this.form

      const fastDownloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: ''
        }
      })

      const params = {
        agentType: 'Local',
        chargeProvider,
        priceId,
        currency,
        successUrl: location.origin + '/' + fastDownloadUrl.href,
        cancelUrl: location.href,
        email,
        type
      }
      this.buried('newAgentStripe', '', {
        type
      })
      this.$axios
        .post('api/tcm/orders', params)
        .then(data => {
          openUrl(data?.paymentUrl)
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
      this.$emit('finish')
      this.handleCancel()
    },
    save() {
      this.saveLoading = true
      this.buried('activateAliyunCode')
      this.$axios
        .post('api/tcm/aliyun/market/license/activate', { licenseCode: this.licenseCode })
        .then(data => {
          if (data.licenseStatus === 'ACTIVATED') {
            this.$message.success(i18n.t('dfs_aliyun_market_license_jihuochenggongS'))
            this.showGoDashboard = true
            this.$axios.get('api/tcm/user').then(data => {
              window.__USER_INFO__ = data
            })
            this.buried('activateAliyunCode', '', {
              result: true
            })
            setTimeout(() => {
              window.location.href = 'index.html'
            }, 30000)
          } else {
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
    getAliyunImg(name) {
      return require(`../../../public/images/dashboard/${name}.svg`)
    }
  }
}
</script>

<style scoped lang="scss">
.configure-main {
  padding: 20px 40px;
}
.spec-main {
  padding: 20px 40px;
  // height: 544px;
}
.width50 {
  width: 50%;
}
.img-box {
  width: 400px;
  height: 330px;
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
  height: 400px;
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
</style>

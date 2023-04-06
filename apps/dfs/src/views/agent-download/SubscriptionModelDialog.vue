<template>
  <el-dialog :visible.sync="visible" title="Configure Live Data Platform" width="70%">
    <el-tabs v-model="activeName">
      <el-tab-pane label="Select Deployment Type" name="first">
        <div class="configure-main">
          <el-radio-group class="flex mb-4" v-model="productType" @change="getPrice">
            <el-radio class="width50 font-weight-bold" label="halfManagement">半托管模式</el-radio>
            <el-radio class="font-weight-bold" label="fullManagement">全托管模式</el-radio>
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
          <el-link to="/aliyun-market/license">直接使用阿里云市场授权码</el-link>
          <footer class="flex justify-content-end">
            <el-button type="primary" @click="next('second')">Next</el-button>
          </footer>
          <el-link class="flex justify-content-center">依然不知道如何选择? 点击 这里 了解更多的区别</el-link>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Configure Deployment Spec" name="second">
        <div class="spec-main">
          <div class="config">
            <el-row>
              <el-col span="6">
                <div>选择你所需要的计算资源大小</div>
                <div>(每个Core我们不建议超过2个任务)</div>
              </el-col>
              <el-col span="18">
                <el-radio-group v-model="spec" @change="getPrice">
                  <el-radio class="mt-2 block" label="EXTRA SMALL">EXTRA SMALL: 1C 2G - FREE</el-radio>
                  <el-radio class="mt-2 block" label="SMALL">SMALL: 2C 4G, up to 4 Concurrent Pipelines</el-radio>
                  <el-radio class="mt-2 block" label="MEDIUM">MEDIUM: 4C 8G, up to 8 Concurrent Pipeliens</el-radio>
                  <el-radio class="mt-2 block" label="LARGE">LARGE: 8C 16G, up to 16 Pipeline tssks</el-radio>
                  <el-radio class="mt-2 block" label="EXTRA LARGE">EXTRA LARGE: 16C 32G</el-radio>
                </el-radio-group>
              </el-col>
            </el-row>
            <div class="flex justify-content-between mt-6">
              <el-row class="flex flex-1">
                <el-col span="6" v-if="productType === 'fullManagement'">
                  <div>选择你希望部署的公有云及地区</div>
                </el-col>
                <el-col span="13" v-if="productType === 'fullManagement'">
                  <ul class="flex">
                    <li class="btn">Docker</li>
                    <li class="btn ml-4">Linux</li>
                    <li class="btn ml-4">Windows</li>
                    <li class="btn ml-4">阿里云计算巢</li>
                  </ul>
                </el-col>
                <el-col span="6" v-if="productType === 'halfManagement'">
                  <div>请在你的服务器上安装Tapdata Agent</div>
                </el-col>
                <el-col span="13" v-if="productType === 'halfManagement'">
                  <ul class="flex">
                    <li class="btn">Google Cloud</li>
                    <li class="btn ml-4">Huawei Cloud</li>
                  </ul>
                </el-col>
                <el-col span="3">
                  <div class="price-list flex flex-column">
                    <div class="title">Estimated Monthly Cost</div>
                    <ul class="flex flex-1 content">
                      <li class="item">Compute: 2000</li>
                    </ul>
                    <div class="total">Total: 4000</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <footer class="flex justify-content-end mt-4">
          <el-button @click="next('first')">Previous</el-button>
          <el-button type="primary" @click="next('second')">Next</el-button>
        </footer>
      </el-tab-pane>
      <el-tab-pane label="Review & Confirm" name="third">
        <div class="flex flex-column review">
          <div class="mt-4">Configuration Summary</div>
          <div class="mt-4">下面是你做的配置:</div>
          <div class="flex-1">计算资源：8C16G</div>
          <footer class="flex justify-content-end align-items-center mt-4">
            <div class="mr-6">Total: <span>￥2000</span></div>
            <el-button @click="next('second')">Previous</el-button>
            <el-button type="primary" @click="next('second')">CONFIRM</el-button>
          </footer>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { uniqueArr } from '@tap/shared'
import { getPaymentMethod, getSpec } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP, TIME_MAP } from '@tap/business'
import i18n from '@/i18n'

export default {
  name: 'subscriptionModelDialog',
  props: {
    visible: {
      type: Boolean
    }
  },
  data() {
    return {
      productType: 'halfManagement',
      activeName: 'first',
      allPackages: '',
      packageItems: [],
      specificationItems: [],
      spec: 'EXTRA SMALL'
    }
  },
  mounted() {
    this.getPrice()
  },
  methods: {
    next(val) {
      this.activeName = val
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
        this.handlePackage(this.packageItems[0])
      })
    },
    loadPackageItems() {
      const specificationLabel = this.specificationItems.find(t => t.value === this.form.specification)?.label
      this.packageItems = this.allPackages
        .filter(t => this.form.specification === t.specification)
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
    },
    handlePackage(item) {
      this.selected = item
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
  height: 544px;
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
  height: 594px;
}
</style>

<template>
  <section class="subscription-steps-wrap flex flex-column flex-1">
    <div class="main flex-1">
      <div>
        <el-steps class="subscription-steps bg-transparent mx-auto" :active="activeStep" simple>
          <el-step v-for="(step, i) in steps" :key="i" :title="step.title">
            <span slot="icon">{{ i + 1 }}</span>
          </el-step>
        </el-steps>
      </div>
      <div class="subscription-steps-content mt-4">
        <div v-if="activeStep === 1" class="flex gap-6 px-5">
          <div
            class="product-type-card rounded-xl border flex flex-column flex-1 position-relative overflow-hidden clickable"
            :class="{
              active: platform === 'integration'
            }"
            @click="platform = 'integration'"
          >
            <div class="is-active position-absolute top-0 end-0">
              <div class="is-active-triangle"></div>
              <VIcon size="16" class="is-active-icon">check-bold</VIcon>
            </div>
            <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
              <el-image class="w-100 product-type-image" :src="require('@/assets/image/intergration.png')" />
            </div>
            <div class="px-6 mb-6">
              <div class="product-type-card-title text-center font-color-dark fs-5 mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_qiyeshujuji2') }}
              </div>
              <div class="fs-7 font-color-light mb-3">{{ $t('dfs_instance_createagent_qiyeshujuji') }}</div>
              <div class="fs-7 font-color-light mb-3">{{ $t('dfs_instance_createagent_leisiyuFi') }}</div>
              <div class="text-center font-color-dark fs-5 mb-3">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_zhuyaoshiyongchang') }}
              </div>
              <div class="flex justify-content-center align-items-center flex-wrap">
                <el-tag class="mr-4 mt-4" v-for="(item, index) in interTag" :key="index">{{ item.value }}</el-tag>
              </div>
            </div>
          </div>
          <div
            class="product-type-card rounded-xl border flex flex-column flex-1 position-relative overflow-hidden clickable disabled"
            :class="{
              active: platform === 'realTime'
            }"
          >
            <div class="is-active position-absolute top-0 end-0">
              <div class="is-active-triangle"></div>
              <VIcon size="16" class="is-active-icon">check-bold</VIcon>
            </div>
            <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
              <el-image class="w-100 product-type-image" :src="require('@/assets/image/real-time.png')" />
            </div>
            <div class="px-6 mb-4">
              <div class="product-type-card-title text-center font-color-dark fs-5 mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_qiyeshishishu2') }}
              </div>
              <div class="font-color-light fs-7 mb-3">{{ $t('dfs_instance_createagent_qiyeshishishu') }}</div>
              <div class="font-color-light fs-7 mb-3">{{ $t('dfs_instance_createagent_heIPaa') }}</div>
              <div class="product-type-card-title text-center font-color-dark fs-5 mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_zhuyaoshiyongchang') }}
              </div>
              <div class="flex justify-content-center align-items-center flex-column">
                <div class="font-color-light fs-7 mb-3 text-center">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_chuzhichisuoyou') }}
                </div>
                <div>
                  <el-tag class="mr-4" v-for="(item, index) in realTimeTag" :key="index">{{ item.value }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="activeStep === 2">
          <section v-if="agentDeploy !== 'aliyun'" class="flex gap-6 px-5">
            <div
              class="product-type-card rounded-xl border flex flex-column flex-1 position-relative overflow-hidden clickable"
              :class="{
                active: agentDeploy === 'selfHost'
              }"
              @click="changeAgentDeploy('selfHost')"
            >
              <div class="is-active position-absolute top-0 end-0">
                <div class="is-active-triangle"></div>
                <VIcon size="16" class="is-active-icon">check-bold</VIcon>
              </div>
              <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
                <el-image class="w-100 product-type-image" :src="require('@/assets/image/self_host_managed.png')" />
              </div>
              <div class="px-6 mb-4">
                <div class="text-center font-color-dark fs-5 mb-2">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_bantuoguanmoshi') }}
                </div>
                <div class="text-center font-color-light fs-7">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi2') }}
                </div>
              </div>
              <div class="px-6 mb-6">
                <div class="fs-6 text-center font-color-dark mb-2">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongbantuoguan') }}
                </div>
                <div class="flex justify-content-center">
                  <ul>
                    <li>
                      <VIcon size="16" class="mr-2">check-bold</VIcon
                      >{{ $t('dfs_agent_download_subscriptionmodeldialog_chengbengengdichong') }}
                    </li>
                    <li>
                      <VIcon size="16" class="mr-2">check-bold</VIcon
                      >{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiaanquanyong') }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              class="product-type-card rounded-xl border flex flex-column flex-1 position-relative overflow-hidden clickable"
              :class="{
                active: agentDeploy === 'fullManagement'
              }"
              @click="changeAgentDeploy('fullManagement')"
            >
              <div class="is-active position-absolute top-0 end-0">
                <div class="is-active-triangle"></div>
                <VIcon size="16" class="is-active-icon">check-bold</VIcon>
              </div>
              <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
                <el-image class="w-100 product-type-image" :src="require('@/assets/image/fully_managed.png')" />
              </div>
              <div class="px-6 mb-4">
                <div class="product-type-card-title text-center font-color-dark fs-5 mb-2">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_quantuoguanmoshi') }}
                </div>
                <div class="text-center font-color-light fs-7">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi') }}
                </div>
              </div>
              <div class="px-6 mb-6">
                <div class="fs-6 text-center font-color-dark mb-2">
                  {{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongquantuoguan') }}
                </div>
                <div class="flex justify-content-center">
                  <ul>
                    <li>
                      <VIcon size="16" class="mr-2">check-bold</VIcon
                      >{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiafangbianmian') }}
                    </li>
                    <li>
                      <VIcon size="16" class="mr-2">check-bold</VIcon
                      >{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiakekaoyou') }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
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
                  <template #agentType="{ row }">
                    <span>{{ agentTypeMap[row.agentType || 'local'] }}</span>
                  </template>
                  <template #operation="{ row }">
                    <ElButton v-if="row.agentType !== 'Cloud'" type="text" @click="handleNewAgentActiveCode(row)">{{
                      $t('agent_button_deploy_now')
                    }}</ElButton>
                    <ElButton v-else type="text" @click="handleNewAgentActiveCode(row)">{{
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
              </div>
            </div>
          </section>
        </div>

        <div v-if="activeStep === 3" class="px-1">
          <ElForm v-if="agentDeploy !== 'aliyun'" label-position="top">
            <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
              <ElSelect v-model="specification" @change="changeSpec" class="w-50 rounded-4">
                <ElOption
                  v-for="(item, i) in specificationItems"
                  :key="i"
                  :label="item.name"
                  :value="item.value"
                  :disabled="agentCount > 0 && item.chargeProvider === 'FreeTier'"
                >
                  <span>{{ item.name }}: </span>
                  <span>{{ item.desc }}</span>
                </ElOption>
              </ElSelect>
              <div class="mt-1 lh-base" v-html="$t('dfs_agent_specification_description', agentSizeCap)"></div>
            </ElFormItem>
            <ElFormItem
              :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi')"
              v-if="agentDeploy === 'fullManagement'"
            >
              <div class="flex">
                <span class="font-color-light inline-block form-label">{{
                  $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang')
                }}</span>
                <ElRadioGroup v-model="provider" @input="changeProvider" class="flex gap-4">
                  <ElRadio
                    v-for="(item, index) in cloudProviderList"
                    :key="index"
                    :label="item.cloudProvider"
                    border
                    class="rounded-4 subscription-radio m-0 position-relative"
                  >
                    <span class="inline-flex align-center">
                      {{ item.cloudProviderName }}
                    </span>
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="flex mt-4">
                <span class="font-color-light inline-block form-label">{{
                  $t('dfs_agent_download_subscriptionmodeldialog_diqu')
                }}</span>
                <ElRadioGroup v-model="region" class="flex gap-4">
                  <ElRadio
                    v-for="(item, index) in cloudDetail"
                    :key="index"
                    :label="item.region"
                    border
                    class="rounded-4 subscription-radio m-0 position-relative"
                  >
                    <span class="inline-flex align-center">
                      {{ item.regionName }}
                    </span>
                  </ElRadio>
                </ElRadioGroup>
              </div>
            </ElFormItem>
            <ElFormItem :label="$t('dfs_instance_instance_dingyuefangshi')">
              <ElRadioGroup v-model="currentPackage" @input="handleChange" class="flex gap-4">
                <ElRadio
                  v-for="(item, index) in packageItems"
                  :key="index"
                  :label="item.value"
                  border
                  class="rounded-4 subscription-radio m-0 position-relative"
                >
                  <span class="inline-flex align-center">
                    {{ item.label }}
                    <ElTag
                      v-if="item.type === 'recurring' || item.periodUnit === 'year'"
                      class="discount-tag fw-sub rounded-4 border-0 ml-2"
                      >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(item) }) }}</ElTag
                    >

                    <VIcon
                      v-if="item.type === 'recurring' && item.periodUnit === 'year'"
                      class="position-absolute discount-hot-icon"
                      >hot-o</VIcon
                    >
                  </span>
                </ElRadio>
              </ElRadioGroup>
            </ElFormItem>
            <ElFormItem
              :label="$t('dfs_agent_download_subscriptionmodeldialog_xuanzebizhong')"
              v-if="currencyOption && currencyOption.length > 0"
            >
              <ElRadioGroup v-model="currencyType" @input="changeCurrency" class="flex gap-4">
                <ElRadio
                  v-for="(item, index) in currencyOption"
                  :key="index"
                  :label="item.currency"
                  border
                  class="rounded-4 m-0"
                  >{{ CURRENCY_MAP[item.currency] }}</ElRadio
                >
              </ElRadioGroup>
            </ElFormItem>
            <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_meiyuefeiyongyu')">
              <div class="border rounded-4">
                <div class="border-bottom px-3 py-1">
                  <div>
                    <span class="price-detail-label text-end inline-block mr-2">{{
                      $t('dfs_agent_download_subscriptionmodeldialog_jisuan')
                    }}</span>
                    <span class="font-color-dark">{{ formatPrice(currency, true) }}</span>
                  </div>
                  <div v-if="getDiscount(this.selected)">
                    <span class="price-detail-label text-end inline-block mr-2"
                      >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(this.selected) }) }}:
                    </span>
                    <span class="discount-color fw-sub">-{{ formatPriceOff(currency) }}</span>
                  </div>
                </div>
                <div class="text-end px-3 py-1">
                  {{ $t('public_total') }}:
                  <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
                  <span class="text-decoration-line-through font-color-slight ml-2">{{
                    formatPrice(currency, true)
                  }}</span>
                </div>
              </div>
            </ElFormItem>
          </ElForm>
          <ElForm v-else label-position="top">
            <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
              <ElInput v-model="specificationAliyunCode.name" disabled class="w-50 rounded-4"></ElInput>
              <div class="mt-1 lh-base" v-html="$t('dfs_agent_specification_description', agentSizeCap)"></div>
            </ElFormItem>
            <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi')">
              <div class="flex">
                <span class="font-color-light inline-block form-label">{{
                  $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang')
                }}</span>
                <ElRadioGroup v-model="provider" @input="changeProvider" class="flex gap-4">
                  <ElRadio
                    v-for="(item, index) in cloudProviderList"
                    :key="index"
                    :label="item.cloudProvider"
                    border
                    class="rounded-4 subscription-radio m-0 position-relative"
                  >
                    <span class="inline-flex align-center">
                      {{ item.cloudProviderName }}
                    </span>
                  </ElRadio>
                </ElRadioGroup>
              </div>
              <div class="flex mt-4">
                <span class="font-color-light inline-block form-label">{{
                  $t('dfs_agent_download_subscriptionmodeldialog_diqu')
                }}</span>
                <ElRadioGroup v-model="region" class="flex gap-4" @input="changeRegion">
                  <ElRadio
                    v-for="(item, index) in cloudDetail"
                    :key="index"
                    :label="item.region"
                    border
                    class="rounded-4 subscription-radio m-0 position-relative"
                  >
                    <span class="inline-flex align-center">
                      {{ item.regionName }}
                    </span>
                  </ElRadio>
                </ElRadioGroup>
              </div>
            </ElFormItem>
          </ElForm>
        </div>

        <div v-if="activeStep === 4" class="px-1">
          <div class="border rounded-4 p-4">
            <div class="fs-6 font-color-dark mb-4">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_peizhizhaiyao') }}
            </div>

            <ElForm
              :model="form"
              ref="confirmForm"
              :label-width="this.$i18n.locale === 'en' ? '200px' : '130px'"
              label-position="right"
            >
              <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_jisuanziyuan')">
                <span class="font-color-dark">
                  {{ specMap[currentSpecName] || currentSpecName }}
                </span>
              </ElFormItem>
              <ElFormItem v-if="agentDeploy !== 'aliyun'" :label="$t('dfs_instance_instance_dingyuefangshi') + ':'">
                <span class="font-color-dark">
                  {{ selected.label }}
                </span>
              </ElFormItem>
              <ElFormItem
                :label="$t('dfs_instance_createagent_yunchangshangkeyong')"
                v-if="agentDeploy !== 'selfHost' || currentAliyunAgentType === 'Cloud'"
              >
                <span class="font-color-dark"> {{ cloudProviderName }} | {{ regionName }} </span>
              </ElFormItem>
              <ElFormItem :label="$t('dfs_instance_create_jieshouzhangdande')" prop="email" :rules="getEmailRules()">
                <ElInput v-model="form.email" :placeholder="getPlaceholder()" style="width: 300px"></ElInput>
              </ElFormItem>
              <ElFormItem :label="$t('public_total') + ':'" v-if="agentDeploy !== 'aliyun'">
                <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
              </ElFormItem>
            </ElForm>
          </div>
        </div>
      </div>
      <el-link
        class="aliyun-wrap flex justify-content-center align-items-center mt-6 mb-6"
        v-if="activeStep === 2 && agentDeploy !== 'aliyun'"
        type="primary"
        @click="changeAgentDeploy('aliyun')"
        >{{ $t('dfs_agent_download_subscriptionmodeldialog_zhijieshiyonga') }}</el-link
      >
    </div>
    <div class="footer flex justify-content-center align-items-center">
      <!--非授权码-->
      <template v-if="agentDeploy !== 'aliyun'">
        <el-button v-if="activeStep > 1" @click="prevStep">{{ $t('public_button_previous') }}</el-button>
        <el-button v-if="activeStep < steps.length" type="primary" @click="next('second')">{{
          $t('public_button_next')
        }}</el-button>
        <div v-else-if="activeStep === steps.length" class="ml-2">
          <div v-if="selected.chargeProvider === 'FreeTier'">
            <el-button type="primary" :loading="submitOnlineLoading" @click="submit()">{{
              $t('public_button_confirm')
            }}</el-button>
          </div>
          <div v-else>
            <el-button type="primary" :loading="submitOnlineLoading" @click="submit()">{{
              $t('dfs_agent_download_subscriptionmodeldialog_zaixianzhifu')
            }}</el-button>
            <el-button type="primary" :loading="submitLoading" @click="submit({}, 'offline')">{{
              $t('dfs_agent_download_subscriptionmodeldialog_zhuanzhangzhifu')
            }}</el-button>
          </div>
        </div>
      </template>
      <!--授权码-->
      <template v-else>
        <el-link
          v-if="activeStep === 2 && agentDeploy === 'aliyun' && !hiddenNewCode && codeData.length > 0"
          type="primary"
          class="mr-4"
          @click="handleNewCode(true)"
          >{{ $t('dfs_agent_download_subscriptionmodeldialog_ninyouyijihuo') }}</el-link
        >
        <el-button v-if="activeStep > 1" @click="prevStep">{{ $t('public_button_previous') }}</el-button>
        <!--第2步 半托管没有下一步 直接部署-->
        <el-button v-if="activeStep < steps.length && activeStep !== 2" type="primary" @click="next('second')">{{
          $t('public_button_next')
        }}</el-button>
        <!---第2步 新激活授权码 半托管-->
        <el-button v-if="!hiddenNewCode && activeStep === 2" type="primary" :loading="saveLoading" @click="save()"
          >{{ $t('dfs_aliyun_market_license_jihuo') }}<span>&</span>{{ $t('public_button_next') }}</el-button
        >
        <!--最后一步-->
        <el-button
          v-if="activeStep === steps.length"
          type="primary"
          :loading="submitOnlineLoading"
          @click="submit(currentAliyunCode)"
          >{{ $t('agent_button_deploy') }}</el-button
        >
      </template>
    </div>
  </section>
</template>

<script>
import { isStr, isObj, uniqueArr } from '@tap/shared'
import { VTable } from '@tap/component'
import { getPaymentMethod, getSpec, AGENT_TYPE_MAP } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP, TIME_MAP, CURRENCY_MAP } from '@tap/business'
import i18n from '@/i18n'
import { dayjs } from '@tap/business/src/shared/dayjs'

export default {
  name: 'CreatAgent',
  inject: ['buried'],
  components: { VTable },
  data() {
    return {
      activeStep: 1,
      agentDeploy: 'selfHost',
      platform: 'integration',
      allPackages: '',
      packageItems: [],
      cloudProviderList: [],
      cloudDetail: [],
      region: '',
      provider: '',
      regionName: '',
      cloudProviderName: '',
      specificationItems: [],
      specification: '',
      currentAliyunCode: '',
      specificationAliyunCode: '',
      currentAliyunAgentType: '',
      email: '',
      selected: {},
      form: {
        email: ''
      },
      specMap: {
        '1C2G': i18n.t('dfs_agent_download_subscriptionmodeldialog_extra')
      },
      realTimeTag: [
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_apIfuwu')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_gongzuoliangjicheng')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujuEtl')
        }
      ],
      interTag: [
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shishishujutong')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujuEtl')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujushangyunkua')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujushangyunkua')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujukuguochan')
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_kafka')
        }
      ],
      CURRENCY_MAP: CURRENCY_MAP,
      agentTypeMap: AGENT_TYPE_MAP,
      licenseCode: '',
      saveLoading: false,
      submitLoading: false,
      submitOnlineLoading: false,
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
          label: i18n.t('dfs_agent_download_subscriptionmodeldialog_tuoguanfangshi'),
          prop: 'agentType',
          slotName: 'agentType'
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
      ],
      currentPackage: ''
    }
  },

  computed: {
    steps() {
      if (this.agentDeploy === 'aliyun') {
        return [
          {
            title: this.$t('dfs_agent_download_subscriptionmodeldialog_xuanzebushulei')
          },
          {
            title: this.$t('dfs_agent_step_aliyun_code')
          },
          {
            title: this.$t('dfs_agent_download_subscriptionmodeldialog_peizhibushugui')
          },
          {
            title: this.$t('dfs_agent_download_subscriptionmodeldialog_chakanbingqueren')
          }
        ]
      }

      return [
        {
          title: i18n.t('dfs_agent_download_subscriptionmodeldialog_xuanzechanpinmo')
        },
        {
          title: this.$t('dfs_agent_download_subscriptionmodeldialog_xuanzebushulei')
        },
        {
          title: this.$t('dfs_agent_download_subscriptionmodeldialog_peizhibushugui')
        },
        {
          title: this.$t('dfs_agent_download_subscriptionmodeldialog_chakanbingqueren')
        }
      ]
    },
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

  mounted() {
    this.checkAgentCount()
    this.form.email = window.__USER_INFO__.email
    const currencyType = window.__config__?.currencyType

    if (currencyType) {
      this.currencyType = currencyType
    }
  },
  methods: {
    prevStep() {
      this.activeStep--
      //授权码 特殊的第二步
      if (this.agentDeploy === 'aliyun' && this.activeStep === 1) {
        this.agentDeploy = 'selfHost'
        this.activeStep++
      }
    },
    next() {
      this.activeStep++
      this.buried('productTypeNext')
    },
    //选择订阅模式
    changeAgentDeploy(type) {
      this.agentDeploy = type
      this.getCloudProvider()
      if (type === 'aliyun') {
        this.getAvailableCode()
        this.buried('productTypeAliyunCode')
      } else if (type === 'fullManagement') {
        this.getPrice()
      }
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
    //切换云厂商
    changeProvider() {
      let cloudProvider = this.cloudProviderList.filter(it => it.cloudProvider === this.provider) || []
      this.cloudProviderName = cloudProvider?.[0]?.cloudProviderName
      this.cloudDetail = cloudProvider?.[0].cloudDetail || []
      this.region = this.cloudDetail?.[0]?.region
      this.changeRegion()
    },
    changeRegion() {
      let region = this.cloudDetail.filter(it => it.region === this.region) || []
      this.regionName = region?.[0]?.regionName
    },
    //切换订阅方式
    handleChange(item = {}) {
      if (!isObj(item)) {
        item = this.packageItems.find(it => it.value === item)
      }
      this.currentPackage = item.value
      this.selected = item
      if (item?.chargeProvider !== 'FreeTier') {
        this.changeCurrencyOption(item)
        this.currency = this.currencyOption.find(it => it.currency === this.currencyType) || {}
      } else {
        this.currencyOption = []
        this.currency = item
      }
      this.buried('changeSubscriptionMethod')
    },
    //切换币种
    changeCurrency(item) {
      if (isStr(item)) {
        this.currencyType = item
        this.currency = this.currencyOption.find(it => it.currency === item)
      } else {
        this.currencyType = item.currency
        this.currency = item
      }
    },
    changeCurrencyOption(item) {
      const options = item.currencyOption
      const { defaultCurrencyType } = this
      // 设置了默认币种, 币种选项默认的排到第一位
      if (options.length && defaultCurrencyType && options[0] !== defaultCurrencyType) {
        options.sort((a, b) => {
          let aVal = a.currency === defaultCurrencyType ? 0 : 1
          let bVal = b.currency === defaultCurrencyType ? 0 : 1
          return aVal - bVal
        })
      }
      this.currencyOption = options
    },
    getAmount(item, isOriginalPrice) {
      const current = this.selected
      let amount = item.amount

      // 基于单月算原价
      if (isOriginalPrice && (current.type === 'recurring' || current.periodUnit === 'year')) {
        if (this.selected.periodUnit === 'month') {
          amount = this.singleMonthAmount
        } else if (this.selected.periodUnit === 'year') {
          amount = this.singleYearAmount
        }
      }

      return amount
    },
    formatPriceOff(item) {
      if (!item || item?.chargeProvider === 'FreeTier') return 0

      const amount = this.getAmount(item, true) - this.getAmount(item)
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    //格式化价格
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
      return {
        mem: parseInt(memory * 1.1 + 2) + 'G',
        pipeline: this.getSuggestPipelineNumber(cpu, memory),
        tps: cpu * 2000
      }
    },
    //查找云厂商
    getCloudProvider() {
      this.$axios.get('api/tcm/orders/queryCloudProvider').then(data => {
        this.cloudProviderList = data?.items || []
        //初始化云厂商
        this.provider = this.cloudProviderList?.[0].cloudProvider
        this.changeProvider()
      })
    },
    getPrice() {
      const params = {
        productType: this.agentDeploy
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
        // this.changeCurrency(this.packageItems[0])
        if (!this.currencyType) {
          this.currencyType = this.packageItems[0]?.currencyOption[0]?.currency
        }
        this.handleChange(this.packageItems[0])

        console.log('specificationItems', this.specificationItems) // eslint-disable-line
      })
    },
    loadPackageItems() {
      const specification = this.specificationItems.find(t => t.value === this.specification)
      this.agentSizeCap = this.updateAgentCap(specification.cpu, specification.memory)
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
          const aType = a.type === 'recurring' ? 1 : 2
          const bType = b.type === 'recurring' ? 1 : 2
          const aOrder = a.order
          const bOrder = b.order
          return aType + aOrder - (bType + bOrder)
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

    validateForm(ref) {
      return new Promise(resolve => {
        this.$refs[ref].validate(valid => {
          resolve(valid)
        })
      })
    },

    //提交订单
    async submit(row = {}, paymentType = 'online') {
      const { type, priceId, currency, chargeProvider } = this.selected
      const { email } = this.form

      const fastDownloadUrl = window.App.$router.resolve({
        name: 'FastDownload',
        query: {
          id: ''
        }
      })
      const agentUrl = window.App.$router.resolve({
        name: 'Instance',
        query: {
          id: ''
        }
      })
      let params = {
        agentDeploy: this.agentDeploy,
        platform: this.platform,
        version: ''
      }

      if (this.agentDeploy === 'aliyun') {
        params = Object.assign(params, {
          agentType: row.agentType,
          chargeProvider: 'Aliyun',
          licenseId: row?.id
        })
        if (row.agentType === 'Cloud') {
          params.region = this.region
          params.provider = this.provider
        }
        this.buried('selectAgentAliyun')
      } else {
        const valid = await this.validateForm('confirmForm')

        if (!valid) return

        params = Object.assign(params, {
          agentType: 'Local',
          chargeProvider,
          priceId,
          currency: this.currencyType || currency,
          successUrl: location.origin + location.pathname + fastDownloadUrl.href,
          cancelUrl: location.href,
          paymentType: paymentType, //增加支付方式
          email,
          type
        })
        if (this.agentDeploy === 'fullManagement') {
          params.agentType = 'Cloud'
          params.region = this.region
          params.provider = this.provider
          params.successUrl = location.origin + location.pathname + agentUrl.href
        }
      }

      this.buried('newAgentStripe', '', {
        type
      })
      if (paymentType === 'online') {
        this.submitOnlineLoading = true
      } else {
        this.submitLoading = true
      }
      this.$axios
        .post('api/tcm/orders', params)
        .then(data => {
          //免费实例（授权码）-半托管-直接部署页面
          if (data.chargeProvider === 'FreeTier' || (data.chargeProvider === 'Aliyun' && row.agentType === 'Local')) {
            this.finish()
            let downloadUrl = window.App.$router.resolve({
              name: 'FastDownload',
              query: {
                id: data?.agentId
              }
            })
            window.open(downloadUrl.href, '_self')
          } else if (data.chargeProvider === 'Aliyun' && row.agentType === 'Cloud') {
            //授权码 全托管-打开Agent管理页面
            window.open(agentUrl.href, '_self')
          } else if (paymentType === 'online') {
            //在线支付 打开付款页面
            this.finish()
            window.open(data?.paymentUrl, '_self')
          } else {
            //转账支付 打开支付详情弹窗
            this.$router.push({
              name: 'Instance',
              params: {
                showTransferDialogVisible: true,
                price: this.formatPrice(this.currency)
              }
            })
          }
          this.buried('newAgentStripe', '', {
            type,
            result: true
          })
          if (paymentType === 'online') {
            this.submitOnlineLoading = false
          } else {
            this.submitLoading = false
          }
        })
        .catch(() => {
          this.buried('newAgentStripe', '', {
            type,
            result: false
          })
        })
        .finally(() => {
          this.submitLoading = false
          this.submitOnlineLoading = false
        })
    },
    finish() {
      this.$message.success(this.$t('public_message_operation_success'))
    },
    //创建agent
    handleNewAgentActiveCode(row) {
      this.currentAliyunAgentType = row?.agentType
      if (row?.agentType === 'Cloud') {
        //全托管，跳转到下一步
        this.saveCurrentAliyun(row)
      } else {
        //半托管直接创建订单
        this.submit(row)
      }
    },
    //授权码下一步数据保留
    saveCurrentAliyun(row) {
      this.activeStep++
      this.currentAliyunCode = row
      this.specificationAliyunCode = row.spec
      this.specificationAliyunCode.name = this.specificationAliyunCode.name?.toUpperCase()
      this.agentSizeCap = this.updateAgentCap(this.specificationAliyunCode.cpu, this.specificationAliyunCode.memory)
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
            if (data?.agentType === 'Cloud') {
              this.saveCurrentAliyun(data)
            } else {
              this.submit(data)
            }
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
              t.specLabel = t.spec?.name?.toUpperCase()
              t.expiredTimeLabel = t.expiredTime ? dayjs(t.expiredTime).format('YYYY-MM-DD') : '-'
              return t
            }) || []
          this.hiddenNewCode = this.codeData?.length > 0
          this.aliyunLoading = false
        })
        .finally(() => {
          this.aliyunLoading = false
        })
    },
    getDiscount(item) {
      const { locale } = this.$i18n

      if (item.type === 'recurring' && item.periodUnit === 'month') {
        return locale === 'en' ? 5 : 95
      } else if (item.periodUnit === 'year') {
        return locale === 'en' ? 10 : 9
      }
    }
  }
}
</script>

<style scoped lang="scss">
.main {
  padding: 0 140px;
}
.footer {
  padding: 16px 0;
  border-top: 1px solid map-get($borderColor, normal);
}
.aliyun-main {
  padding: 0 40px;
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
.label-code {
  width: 70px;
}
.form-label {
  width: 90px;
}
.subscript-table {
  ::v-deep {
    .subscript-table thead .el-table-column--selection .cell {
      display: none;
    }
  }
}
.subscription-steps {
  ::v-deep {
    .el-step {
      &.is-simple:not(:last-of-type) .el-step__title {
        max-width: unset;
      }

      .el-step__icon {
        width: 24px;
        height: 24px;
        font-size: 14px;
      }

      .el-step__head.is-finish {
        .el-step__icon {
          color: #fff;
          background-color: map-get($color, primary);
        }
      }

      .el-step__head.is-process {
        color: #86909c;
        border-color: #86909c;
      }
      .el-step__title.is-process {
        color: #86909c;
        font-weight: 400;
      }
    }
  }
}

.subscription-steps-content {
  ::v-deep {
    .el-input__inner,
    .el-textarea__inner {
      border-radius: 6px;
    }

    .subscription-radio.el-radio {
      padding: 0 12px;
      line-height: 30px;
    }
  }

  .discount-color {
    color: #ff7d00;
  }

  .discount-tag {
    padding: 0 6px;
    color: #ff7d00;
    background: rgba(255, 125, 0, 0.1);
  }

  .discount-hot-icon {
    color: #ff7d00;
    right: -12px;
    top: -12px;
    font-size: 24px;
    background: #fff;
  }

  .price-detail-label {
    width: 80px;
  }
}

.product-type-card {
  .is-active {
    display: none;
  }
  &.active {
    $primary: map-get($color, primary);
    border-color: $primary !important;
    box-shadow: 0 2px 16px rgba(44, 101, 255, 0.2);
    .is-active {
      display: block;
      &-triangle {
        width: 0;
        height: 0;
        border-top: 18px solid $primary;
        border-left: 18px solid transparent;
        border-bottom: 18px solid transparent;
        border-right: 18px solid $primary;
      }
      &-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        color: #fff;
      }
    }
  }
  &.disabled {
    background-color: #fafafa;
    border-width: 0 !important;
    cursor: not-allowed;

    .product-type-card-title {
      color: #86909c !important;
    }
  }
}
</style>

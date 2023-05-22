<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    :title="$t('dfs_agent_download_subscriptionmodeldialog_peizhishishishu')"
    width="1200px"
    :before-close="close"
    custom-class="tap-dialog"
  >
    <div class="subscription-steps-wrap">
      <el-steps class="subscription-steps bg-transparent mx-auto" :active="activeStep" simple>
        <el-step v-for="(step, i) in steps" :key="i" :title="step.title">
          <span slot="icon">{{ i + 1 }}</span>
        </el-step>
      </el-steps>
    </div>
    <div class="subscription-steps-content flex justify-content-center align-items-center mt-4">
      <div v-if="activeStep === 1" class="flex gap-6 px-5 justify-content-center align-items-center">
        <div
          class="platform-wrap product-type-card rounded-xl border flex flex-column position-relative clickable overflow-auto"
          :class="{
            active: platform === 'integration'
          }"
          @click="changePlatform('integration')"
        >
          <div class="is-active position-absolute top-0 end-0">
            <div class="is-active-triangle"></div>
            <VIcon size="16" class="is-active-icon">check-bold</VIcon>
          </div>
          <div class="flex justify-content-center gap-5 p-6 align-items-start font-color-dark fs-8">
            <el-image class="w-100 product-type-image" :src="require('@/assets/image/intergration.png')" />
          </div>
          <div class="px-6 mb-4">
            <div class="product-type-card-title text-center font-color-dark mb-2 lh-base">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_qiyeshujuji2') }}
            </div>
            <div
              class="fs-7 font-color-sslight lh-base"
              :class="[{ 'mb-3': this.$i18n.locale === 'en' }, { 'mb-8': this.$i18n.locale === 'zh-CN' }]"
            >
              {{ $t('dfs_instance_createagent_qiyeshujuji') }}
            </div>
            <div class="text-center font-color-dark fs-6 mb-3 lh-base">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_zhuyaoshiyongchang') }}
            </div>
            <div class="flex justify-content-center align-items-center flex-wrap">
              <el-tag
                class="mr-2 mt-2 text-center"
                :class="[item.class]"
                v-for="(item, index) in interTag"
                :key="index"
                >{{ item.value }}</el-tag
              >
            </div>
          </div>
        </div>
        <div
          class="platform-wrap product-type-card rounded-xl border flex flex-column position-relative clickable overflow-auto disabled"
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
            <div class="product-type-card-title text-center font-color-dark font-weight-bold mb-2 lh-base">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_qiyeshishishu2') }}
            </div>
            <div class="font-color-sslight fs-7 mb-3 lh-base">{{ $t('dfs_instance_createagent_qiyeshishishu') }}</div>
            <div class="text-center font-color-dark fs-6 mb-2 lh-base">
              {{ $t('dfs_agent_download_subscriptionmodeldialog_zhuyaoshiyongchang') }}
            </div>
            <div class="flex justify-content-center align-items-center flex-column">
              <div class="font-color-sslight fs-8 text-center">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_chuzhichisuoyou') }}
              </div>
              <div>
                <el-tag
                  class="mr-2 mt-2 text-center"
                  :class="[item.class]"
                  v-for="(item, index) in realTimeTag"
                  :key="index"
                  >{{ item.value }}</el-tag
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="activeStep === 2">
        <section v-if="agentDeploy !== 'aliyun'" class="flex gap-6 px-5 justify-content-center align-items-center">
          <div
            class="product-type-card rounded-xl border flex flex-column position-relative overflow-hidden clickable"
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
              <div class="product-type-card-title text-center font-color-dark mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_bantuoguanmoshi') }}
              </div>
              <div class="text-center font-color-sslight fs-7">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi2') }}
              </div>
            </div>
            <div class="px-6 mb-6">
              <div class="fs-6 text-center font-color-dark font-weight-light mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongbantuoguan') }}
              </div>
              <div class="flex justify-content-center">
                <ul>
                  <li class="flex fs-7 font-color-sslight lh-base mb-1">
                    <VIcon size="16" class="mr-2">check-bold</VIcon>
                    <span>{{ $t('dfs_agent_download_subscriptionmodeldialog_chengbengengdichong') }}</span>
                  </li>
                  <li class="flex fs-7 font-color-sslight lh-base">
                    <VIcon size="16" class="mr-2">check-bold</VIcon
                    ><span>{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiaanquanyong') }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div
            class="product-type-card rounded-xl border flex flex-column position-relative overflow-hidden clickable"
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
              <div class="product-type-card-title text-center font-color-dark mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_quantuoguanmoshi') }}
              </div>
              <div class="text-center font-color-sslight fs-7">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_zaizhezhongmoshi') }}
              </div>
            </div>
            <div class="px-6 mb-6">
              <div class="fs-6 text-center font-color-dark font-weight-light mb-2">
                {{ $t('dfs_agent_download_subscriptionmodeldialog_shiyongquantuoguan') }}
              </div>
              <div class="flex justify-content-center">
                <ul>
                  <li class="flex fs-7 font-color-sslight mb-1">
                    <VIcon size="16" class="mr-2">check-bold</VIcon
                    ><span>{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiafangbianmian') }}</span>
                  </li>
                  <li
                    class="flex fs-7 font-color-sslight"
                    :class="[{ 'mb-6': this.$i18n.locale === 'zh-CN' }, { 'mb-3': this.$i18n.locale === 'en' }]"
                  >
                    <VIcon size="16" class="mr-2">check-bold</VIcon
                    ><span>{{ $t('dfs_agent_download_subscriptionmodeldialog_gengjiakekaoyou') }}</span>
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
          <ElFormItem
            :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi')"
            v-if="agentDeploy === 'fullManagement'"
          >
            <!--            <div class="flex">-->
            <!--              <span-->
            <!--                class="font-color-light inline-block"-->
            <!--                :class="[-->
            <!--                  { 'form-label': this.$i18n.locale === 'zh-CN' },-->
            <!--                  { 'form-label-en': this.$i18n.locale === 'en' }-->
            <!--                ]"-->
            <!--                >{{ $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang') }}</span-->
            <!--              >-->
            <!--              <ElRadioGroup v-model="provider" @input="changeProvider" class="flex gap-4">-->
            <!--                <ElRadio-->
            <!--                  v-for="(item, index) in cloudProviderList"-->
            <!--                  :key="index"-->
            <!--                  :label="item.cloudProvider"-->
            <!--                  border-->
            <!--                  class="rounded-4 subscription-radio m-0 position-relative"-->
            <!--                >-->
            <!--                  <span class="inline-flex align-center">-->
            <!--                    {{ item.cloudProviderName }}-->
            <!--                  </span>-->
            <!--                </ElRadio>-->
            <!--              </ElRadioGroup>-->
            <!--            </div>-->
            <div class="flex mt-4">
              <span
                class="font-color-light inline-block"
                :class="[
                  { 'form-label': this.$i18n.locale === 'zh-CN' },
                  { 'form-label-en': this.$i18n.locale === 'en' }
                ]"
                >{{ $t('dfs_agent_download_subscriptionmodeldialog_diqu') }}</span
              >
              <ElRadioGroup v-model="region" class="flex gap-4" @change="changeRegion">
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
          <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
            <ul class="flex flex-wrap">
              <li
                class="spec-li position-relative px-4 py-2 mt-4 mr-4"
                :class="{
                  active: specification === item.value,
                  disabled: (agentCount > 0 || agentDeploy !== 'selfHost') && item.chargeProvider === 'FreeTier'
                }"
                v-for="(item, i) in specificationItems"
                :key="i"
                @click="
                  changeSpec(
                    item.value,
                    (agentCount > 0 || agentDeploy !== 'selfHost') && item.chargeProvider === 'FreeTier'
                  )
                "
              >
                <div class="is-active position-absolute top-0 end-0">
                  <div class="is-active-triangle"></div>
                  <VIcon size="16" class="is-active-icon">check-bold</VIcon>
                </div>
                <div class="spec-li-title mt-1 lh-base fw-bold font-color-dark">
                  <span>{{ item.name }}: </span>
                  <span>{{ item.desc }}</span>
                </div>
                <div
                  v-if="agentDeploy === 'selfHost'"
                  class="spec-li-title mt-1 lh-base font-color-sslight"
                  v-html="$t('dfs_agent_specification_description', updateAgentCap(item.cpu, item.memory))"
                ></div>
              </li>
            </ul>
          </ElFormItem>
        </ElForm>
        <ElForm v-else label-position="top">
          <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxu')">
            <ElInput v-model="specificationAliyunCode.name" disabled class="w-50 rounded-4"></ElInput>
            <div class="mt-1 lh-base" v-html="$t('dfs_agent_specification_description', agentSizeCap)"></div>
          </ElFormItem>
          <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_qingxuanzeninxi')">
            <!--            <div class="flex">-->
            <!--              <span-->
            <!--                class="font-color-light inline-block"-->
            <!--                :class="[-->
            <!--                  { 'form-label': this.$i18n.locale === 'zh-CN' },-->
            <!--                  { 'form-label-en': this.$i18n.locale === 'en' }-->
            <!--                ]"-->
            <!--                >{{ $t('dfs_agent_download_subscriptionmodeldialog_yunfuwushang') }}</span-->
            <!--              >-->
            <!--              <ElRadioGroup v-model="provider" @input="changeProvider" class="flex gap-4">-->
            <!--                <ElRadio-->
            <!--                  v-for="(item, index) in cloudProviderList"-->
            <!--                  :key="index"-->
            <!--                  :label="item.cloudProvider"-->
            <!--                  border-->
            <!--                  class="rounded-4 subscription-radio m-0 position-relative"-->
            <!--                >-->
            <!--                  <span class="inline-flex align-center">-->
            <!--                    {{ item.cloudProviderName }}-->
            <!--                  </span>-->
            <!--                </ElRadio>-->
            <!--              </ElRadioGroup>-->
            <!--            </div>-->
            <div class="flex mt-4">
              <span
                class="font-color-light inline-block"
                :class="[
                  { 'form-label': this.$i18n.locale === 'zh-CN' },
                  { 'form-label-en': this.$i18n.locale === 'en' }
                ]"
                >{{ $t('dfs_agent_download_subscriptionmodeldialog_diqu') }}</span
              >
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
      <!--存储方案-->
      <div v-if="activeStep === 4 && platform === 'realTime'" class="px-1">
        <!--半托管用户手动填写存储连接地址-->
        <ElForm v-if="agentDeploy === 'selfHost'" label-position="top">
          <ElFormItem :label="$t('dfs_instance_createagent_qingpeizhininde')" required>
            <ElInput class="w-50 rounded-4" type="textarea" v-model="mongodbUrl"></ElInput>
            <div class="font-color-sslight mt-4">
              {{ $t('dfs_instance_createagent_qingtianxieninzi') }}
              <div>Example: mongodb://admin:password@127.0.0.1:27017/mydb?replicaSet=xxx&authSource=admin</div>
            </div>
          </ElFormItem>
        </ElForm>
        <ElForm v-else label-position="top">
          <ElFormItem :label="$t('dfs_instance_createagent_qingxuanzeninxu2')">
            <ElRadioGroup v-model="mongodbSpec" @change="changeMongodbMemory" class="flex gap-4 flex-wrap">
              <ElRadio
                v-for="(item, index) in mongodbSpecItems"
                :key="index"
                :label="item.value"
                border
                class="rounded-4 subscription-radio m-0 position-relative"
              >
                <span class="inline-flex align-center">
                  {{ item.name }}
                </span>
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem :label="$t('dfs_instance_createagent_qingxuanzeninxu')">
            <ElRadioGroup v-model="memorySpace" class="flex gap-4" @change="changeMongodbMemory">
              <ElRadio
                v-for="(item, index) in memoryMap"
                :key="index"
                :label="item.key"
                border
                class="rounded-4 subscription-radio m-0 position-relative"
              >
                <span class="inline-flex align-center">
                  {{ item.value }}
                </span>
              </ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElForm>
      </div>
      <!---确认提交订单-->
      <div v-if="activeStep === 5 || (activeStep === 4 && platform === 'integration')" class="px-1">
        <div class="border rounded-4 p-4">
          <div class="fs-6 font-color-dark mb-4">
            {{ $t('dfs_agent_download_subscriptionmodeldialog_peizhizhaiyao') }}
          </div>

          <ElForm
            :model="form"
            ref="confirmForm"
            :label-width="this.$i18n.locale === 'en' ? '200px' : '130px'"
            label-position="left"
          >
            <ElFormItem :label="$t('dfs_agent_download_subscriptionmodeldialog_jisuanziyuan')">
              <span class="font-color-dark" v-if="agentDeploy === 'aliyun'">
                {{ specificationAliyunCode.name }}
              </span>
              <span class="font-color-dark" v-else>
                {{ specMap[currentSpecName] || currentSpecName }}
              </span>
            </ElFormItem>
            <ElFormItem v-if="agentDeploy !== 'aliyun'" :label="$t('dfs_instance_instance_dingyuefangshi') + ':'">
              <span class="font-color-dark">
                {{ selected.label }}
              </span>
            </ElFormItem>
            <ElFormItem
              v-if="platform === 'realTime' && agentDeploy === 'fullManagement'"
              :label="$t('dfs_instance_createagent_cunchuguige')"
            >
              <span class="font-color-dark">
                {{ currentMemorySpecName }}
              </span>
            </ElFormItem>
            <ElFormItem
              v-if="platform === 'realTime' && agentDeploy === 'fullManagement'"
              :label="$t('dfs_instance_createagent_cunchukongjian')"
            >
              <span class="font-color-dark"> {{ memorySpace }} GB </span>
            </ElFormItem>

            <ElFormItem
              :label="$t('dfs_instance_createagent_yunchangshangkeyong')"
              v-if="agentDeploy !== 'selfHost' || currentAliyunAgentType === 'Cloud'"
            >
              <span class="font-color-dark"> {{ regionName }} </span>
            </ElFormItem>
            <ElFormItem :label="$t('dfs_instance_create_jieshouzhangdande')" prop="email" :rules="getEmailRules()">
              <ElInput v-model="form.email" :placeholder="getPlaceholder()" style="width: 300px"></ElInput>
            </ElFormItem>
          </ElForm>
          <div class="border rounded-4 price-wrap" v-if="agentDeploy !== 'aliyun'">
            <div class="px-3 py-2">
              <div class="mb-2">
                <span class="price-detail-label inline-block mr-2">{{
                  $t('dfs_instance_createagent_jisuanziyuan')
                }}</span>
                <span class="font-color-dark">{{ specPrice(currency, true) }}</span>
              </div>
              <div class="mb-2" v-if="platform === 'realTime' && agentDeploy === 'fullManagement'">
                <span class="price-detail-label inline-block mr-2">{{
                  $t('dfs_instance_createagent_cunchuziyuan')
                }}</span>
                <span class="font-color-dark"> {{ mongodbSpecPrice || 0 }} </span>
              </div>
              <div class="mb-2" v-if="getDiscount(this.selected)">
                <span class="price-detail-label inline-block mr-2"
                  >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(this.selected) }) }}:
                </span>
                <span class="discount-color fw-sub">-{{ formatPriceOff(currency) }}</span>
              </div>
            </div>
            <div class="px-3 py-2">
              {{ $t('public_total') }}:
              <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="flex justify-content-end">
      <el-link
        v-if="activeStep === 1 && agentDeploy !== 'aliyun'"
        type="primary"
        class="mr-4"
        @click="changeAgentDeploy('aliyun')"
        >{{ $t('dfs_agent_download_subscriptionmodeldialog_zhijieshiyonga') }}</el-link
      >

      <!--非授权码-->
      <template v-if="agentDeploy !== 'aliyun'">
        <!--顶部展示价格-->
        <div
          class="flex justify-content-center align-items-center mr-4"
          v-if="[3].includes(activeStep) || (activeStep === 4 && platform === 'realTime')"
        >
          <div class="text-end px-3 py-1">
            {{ $t('public_total') }}:
            <span class="color-primary fs-5 ml-1">{{ formatPrice(currency) }}</span>
          </div>
          <div v-if="getDiscount(this.selected)">
            <span class="price-detail-label text-end inline-block mr-2"
              >{{ $t('dfs_agent_subscription_discount', { val: getDiscount(this.selected) }) }}:
            </span>
            <span class="discount-color fw-sub">-{{ formatPriceOff(currency) }}</span>
          </div>
        </div>
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
    <transferDialog :price="formatPrice(currency)" :visible.sync="showTransferDialogVisible"></transferDialog>
  </el-dialog>
</template>

<script>
import { uniqBy } from 'lodash'
import { isStr, isObj } from '@tap/shared'
import { VTable } from '@tap/component'
import { AGENT_TYPE_MAP, getPaymentMethod, getSpec } from '../instance/utils'
import { CURRENCY_SYMBOL_MAP, TIME_MAP, CURRENCY_MAP } from '@tap/business'
import i18n from '@/i18n'
import { dayjs } from '@tap/business/src/shared/dayjs'
import transferDialog from './transferDialog'

export default {
  name: 'subscriptionModelDialog',
  inject: ['buried'],
  components: { VTable, transferDialog },
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
        this.activeStep = 1
        this.agentDeploy = 'selfHost'
      }
    }
  },
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
      mongodbSpecItems: [],
      mongodbUrl: '',
      mdbPriceId: 'FreeTier', //价格ID
      mongodbSpecPrice: '', //格式化存储价格
      memorySpace: 5, //存储空间
      mdbPrices: 0, //存储价格 与计算资源计算
      mongodbSpec: '0-0', //存储规格
      currentMemorySpecName: i18n.t('dfs_instance_createagent_mianfeishiyonggui'),
      specMap: {
        '1C2G': i18n.t('dfs_agent_download_subscriptionmodeldialog_extra')
      },
      realTimeTag: [
        {
          value: i18n.t('dfs_instance_createagent_apIkuaisu'),
          class: 'col-4'
        },
        {
          value: i18n.t('dfs_instance_createagent_shishishucang'),
          class: 'col-5'
        },
        {
          value: i18n.t('dfs_instance_createagent_bIkanbangong'),
          class: 'col-3'
        },
        {
          value: i18n.t('dfs_instance_createagent_kehu'),
          class: 'col-4'
        },
        {
          value: i18n.t('dfs_instance_createagent_shangpinzhongxin'),
          class: 'col-5'
        },
        {
          value: i18n.t('dfs_instance_createagent_minjieshujuzhong'),
          class: 'col-3'
        }
      ],
      interTag: [
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shishishujutong'),
          class: 'col-1'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujushangyunkua'),
          class: 'col-2'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujuEtl'),
          class: 'col-3'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_redis_gongshu'),
          class: 'col-1'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_shujukuguochan'),
          class: 'col-2'
        },
        {
          value: i18n.t('dfs_agent_download_subscriptionmodeldialog_kafka'),
          class: 'col-3'
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
      currentPackage: '',
      showTransferDialogVisible: false //转测信息弹窗
    }
  },

  computed: {
    memoryMap() {
      if (this.mdbPriceId === 'FreeTier') {
        return [
          {
            key: 5,
            value: '5GB'
          }
        ]
      }
      return [
        {
          key: 100,
          value: '100GB'
        },
        {
          key: 500,
          value: '500GB'
        },
        {
          key: 1000,
          value: '1000GB'
        }
      ]
    },
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
      if (this.platform === 'integration') {
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
          title: i18n.t('dfs_instance_createagent_xuanzecunchufang')
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
    },
    maxMemorySpace() {
      return this.mdbPriceId === 'FreeTier' ? 5 : 100
    }
  },

  mounted() {
    this.checkAgentCount()
    this.form.email = window.__USER_INFO__.email
    const currencyType = window.__config__?.currencyType

    if (currencyType) {
      this.currencyType = currencyType
      this.defaultCurrencyType = currencyType
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    prevStep() {
      this.activeStep--
      //授权码 特殊的第二步
      if (this.agentDeploy === 'aliyun' && this.activeStep === 1) {
        this.agentDeploy = 'selfHost'
      }
    },
    async next() {
      if (
        this.activeStep === 4 &&
        this.platform === 'realTime' &&
        this.agentDeploy === 'selfHost' &&
        this.mongodbUrl === ''
      ) {
        this.$message.error(i18n.t('dfs_instance_createagent_qingtianxieninzi'))
        return
      }
      this.activeStep++
      this.buried('productTypeNext')
      //存储方案请求接口得到存储价格
      if (this.activeStep === 4 && this.platform === 'realTime') {
        this.getMongoCluster()
      }
    },
    //选择平台
    changePlatform(type) {
      this.platform = type
      this.loadPackageItems()
      //更新存储资源价格
      this.changeMongodbMemory()
      //数据初始化
      this.mdbPriceId = 'FreeTier'
      this.mongodbSpecPrice = ''
      this.mdbPrices = 0
      this.mongodbSpec = '0-0'
      this.memorySpace = 5
    },
    //选择订阅模式
    changeAgentDeploy(type) {
      this.cancelPrice() //数据初始化
      this.agentDeploy = type
      this.getPrice()
      this.getCloudProvider()
      if (type === 'aliyun') {
        this.activeStep++
        this.getAvailableCode()
        this.buried('productTypeAliyunCode')
      }
    },
    //价格初始化
    cancelPrice() {
      //数据初始化
      this.mdbPriceId = 'FreeTier'
      this.mongodbSpecPrice = ''
      this.selected = {}
      this.currency = ''
      this.currencyType = ''
      this.mdbPrices = 0
      this.mongodbSpec = '0-0'
      this.memorySpace = 5
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
      if (this.selected?.type && currentItem?.chargeProvider !== 'FreeTier') {
        currentItem = this.packageItems.find(
          it => it.type === this.selected?.type && it.periodUnit === this.selected?.periodUnit //切换规格不改变原来的订阅方式
        )
      }
      this.handleChange(currentItem)
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

      //只展示可用区
      this.provider = region?.[0]?.cloudProvider
      this.cloudProviderName = region?.[0]?.cloudProviderName
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
      //更新存储资源价格
      this.changeMongodbMemory()
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

      let amount = this.getAmount(item, isOriginalPrice) + this.mdbPrices
      return (
        CURRENCY_SYMBOL_MAP[item.currency] +
        ' ' +
        (amount / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
    },
    specPrice(item, isOriginalPrice) {
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
        // this.provider = this.cloudProviderList?.[0].cloudProvider
        // this.changeProvider()

        //合并可用区
        let cloudProviderList = this.cloudProviderList.map(t => t.cloudDetail)
        this.cloudDetail = cloudProviderList.reduce((a, b) => a.concat(b))
        this.region = this.cloudDetail[0].region
        this.provider = this.cloudDetail[0].provider
        this.changeRegion()
      })
    },
    //查询规格价格
    getPrice() {
      const params = {
        productType: this.agentDeploy
      }
      this.$axios.get('api/tcm/paid/plan/getPaidPlan', { params }).then(data => {
        const { paidPrice = [] } = data?.[0] || {}
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
        this.specification =
          this.agentCount > 0 || this.agentDeploy !== 'selfHost'
            ? this.specificationItems[1]?.value
            : this.specificationItems[0]?.value
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
    //订购时长对应价格
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
            label:
              this.platform === 'realTime'
                ? i18n.t('dfs_instance_createagent_tian')
                : i18n.t('dfs_agent_download_subscriptionmodeldialog_yongjiu'),
            price: 0,
            value: '0',
            chargeProvider: 'FreeTier',
            currencyOption: []
          }
        ]
      }
    },

    //获取存储价格
    getMongoCluster() {
      const params = {
        productType: 'mongoCluster'
      }
      this.$axios.get('api/tcm/paid/plan/getPaidPlan', { params }).then(data => {
        const { paidPrice = [] } = data?.[0] || {}
        //根据订阅方式再过滤一层
        let prices = paidPrice?.filter(
          t =>
            (t.periodUnit === this.selected.periodUnit && t.type === this.selected.type) ||
            t.chargeProvider === 'FreeTier'
        )
        this.mongodbPaidPrice = prices
        // 规格
        this.mongodbSpecItems = uniqBy(
          prices.map(t => {
            const { cpu = 0, memory = 0 } = t.spec || {}
            return {
              value: `${cpu}-${memory}`,
              cpu,
              memory,
              name:
                t.chargeProvider === 'FreeTier'
                  ? i18n.t('dfs_instance_createagent_mianfeishiyonggui')
                  : `MongoDB ${cpu}C${memory}G`,
              chargeProvider: t.chargeProvider
            }
          }),
          'name'
        ).sort((a, b) => {
          return a.cpu < b.cpu ? -1 : a.memory < b.memory ? -1 : 1
        })
      })
    },
    //选择存储规格
    changeMongodbMemory() {
      let values = this.mongodbSpec.split('-')
      let cpu = Number(values[0])
      let memory = Number(values[1])
      if (cpu === 0 && memory === 0) {
        this.mongodbSpecPrice = 0
        this.mdbPrices = 0
        this.mdbPriceId = 'FreeTier'
        this.currentMemorySpecName = i18n.t('dfs_instance_createagent_mianfeishiyonggui')
        this.memorySpace = 5
        return
      } else {
        if (this.memorySpace === 5) {
          //非免费规格 需要初始化存储空间
          this.memorySpace = 100
        }
      }
      this.currentMemorySpecName = `MongoDB ${cpu}C${memory}G`
      let price = this.mongodbPaidPrice.filter(
        t => t.spec.storageSize === this.memorySpace && cpu === t.spec.cpu && memory === t.spec.memory
      )
      //需要改变mdbPriceId 因为存储空间改变了
      this.mdbPriceId = price?.[0]?.priceId
      this.mdbPrice(price?.[0].currencyOption?.find(item => item.currency === this.currencyType)?.amount || 0)
    },
    //存储价格
    mdbPrice(price) {
      this.mdbPrices = price
      this.mongodbSpecPrice = this.formatAmount(price)
    },
    formatAmount(price) {
      return (
        CURRENCY_SYMBOL_MAP[this.currencyType] +
        ' ' +
        (price / 100).toLocaleString('zh', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      )
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
          agentType: 'Local',
          chargeProvider: 'Aliyun',
          licenseId: row?.id
        })
        if (row.agentType === 'Cloud') {
          params = Object.assign(params, {
            region: this.region,
            provider: this.provider
          })
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
          mongodbUrl: this.mongodbUrl, //新增存储
          email,
          type
        })
        if (this.agentDeploy === 'fullManagement') {
          params.agentType = 'Cloud'
          params.region = this.region
          params.provider = this.provider
          params.mdbPriceId = this.mdbPriceId
          params.memorySpace = this.memorySpace
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
          if (data.chargeProvider === 'FreeTier' || (data.chargeProvider === 'Aliyun' && row.agentType === 'Local')) {
            //免费实例（授权码）-半托管-直接部署页面
            this.finish()
            let downloadUrl = window.App.$router.resolve({
              name: 'FastDownload',
              query: {
                id: data?.agentId
              }
            })
            window.open(downloadUrl.href, '_blank')
          } else if (data.chargeProvider === 'Aliyun' && row.agentType === 'Cloud') {
            //授权码 全托管-打开Agent管理页面
            this.finish()
            window.open(agentUrl.href, '_blank')
          } else if (paymentType === 'online') {
            //在线支付 打开付款页面
            this.finish()
            window.open(data?.paymentUrl, '_blank')
          } else {
            //转账支付 打开支付详情弹窗
            this.close()
            this.showTransferDialogVisible = true
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
      this.close()
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
.configure-main {
  padding: 20px 40px 0 40px;
}
.spec-main {
  padding: 20px 40px;
  height: 467px;
}
.aliyun-main {
  padding: 0 40px;
}
.form-label {
  width: 90px;
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
//控制tag长度
.col-1 {
  width: 134px;
}
.col-2 {
  width: 113px;
}
.col-3 {
  width: 108px;
}
.col-4 {
  width: 152px;
}
.col-5 {
  width: 90px;
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

.subscription-steps {
  ::v-deep {
    .el-step {
      &.is-simple:not(:last-of-type) .el-step__title {
        max-width: unset;
        font-size: 14px;
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
  .form-label {
    width: 90px;
  }
  .form-label-en {
    width: 170px;
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
.price-detail-label {
  width: 80px;
  color: #535f72;
}
.price-wrap {
  background: #fafafa;
  border-radius: 4px;
}
.spec-li {
  width: 450px;
  border: 1px solid #dedede;
  border-radius: 4px;
  .is-active {
    display: none;
  }
  &.active {
    $primary: map-get($color, primary);
    border-color: $primary !important;
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
    .spec-li-title {
      color: #86909c !important;
    }
  }
}

.product-type-card {
  width: 430px;
  .product-type-card-title {
    font-size: $fontTitle;
    font-weight: 700;
  }
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

<style lang="scss">
.tap-dialog {
  .el-dialog__header {
    height: 64px;
    min-height: 64px;
    border-bottom: 1px solid #dee2e6;
  }

  .el-dialog__body {
    padding: 16px 24px;
  }

  .el-dialog__footer {
    padding: 24px;
  }
}
</style>

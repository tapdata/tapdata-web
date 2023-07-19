<script>
import { VIcon } from '@tap/component'
import VerificationCode from '../../views/user/components/VerificationCode.vue'
import i18n from '@/i18n'
import { getCodeOptions } from '../../views/user/util'

export default {
  name: 'Account',
  components: { VerificationCode, VIcon },
  data() {
    return {
      countryCode: [],
      phoneForm: {
        current: '',
        oldCode: '',
        newPhone: '',
        newCode: '',
        countryCode: '86'
      }
    }
  },
  mounted() {
    this.phoneForm.countryCode = window.__USER_INFO__?.phoneCountryCode || '86'
    this.getCountryCode()
  },
  methods: {
    getCodeOptions,
    bindPhoneConfirm(resetLoading) {
      let { phoneForm } = this
      this.$axios
        .post('api/tcm/user/phone', {
          phone: phoneForm.current,
          code: phoneForm.oldCode,
          countryCode: phoneForm.countryCode ? phoneForm.countryCode.replace('-', '') : '86'
        })
        .then(() => {
          this.$message.success(i18n.t('user_Center_bangDingShouJiCheng'))
          this.$emit('next')
          this.dialogVisible = false
        })
        .catch(() => {
          this.$emit('error')
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    getCountryCode() {
      this.$axios.get('config/countryCode.json').then(res => {
        let countryCode = res.data
        this.countryCode = countryCode?.countryCode
      })
    }
  }
}
</script>

<template>
  <div class="account">
    <div class="flex justify-content-center align-items-center">
      <VIcon size="450px" style="width: 450px; height: 235px">guide-top-header</VIcon>
    </div>
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">{{ $t('dfs_components_taskalarmtour_account_zhuanghao') }}</div>
    <ElForm
      class="mt-4"
      :model="phoneForm"
      label-position="top"
      :label-width="'120px'"
      @submit.native.prevent
      size="default"
    >
      <ElFormItem prop="current" :label="$t('user_Center_dangQianShouJi')">
        <ElInput v-model="phoneForm.current" :placeholder="$t('components_BindPhone_qingShuRuShouJi')" maxlength="50">
          <el-select v-model="phoneForm.countryCode" slot="prepend" filterable style="width: 100px;">
            <el-option v-for="item in countryCode" :label="'+ ' + item.dial_code" :value="item.dial_code">
              <span style="float: left">{{ '+ ' + item.dial_code }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span></el-option
            >
          </el-select>
        </ElInput>
      </ElFormItem>
      <ElFormItem prop="newPassword" :label="$t('user_Center_yanZhengMa')" class="inline-form-item">
        <ElInput v-model="phoneForm.oldCode" :placeholder="$t('user_Center_qingShuRuShouJi')" maxlength="50"></ElInput>
        <VerificationCode
          size="default"
          :request-options="getCodeOptions(phoneForm, 'BIND_PHONE')"
          :disabled="!phoneForm.current"
          type="primary"
          class="ml-6"
        ></VerificationCode>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style scoped lang="scss">
::v-deep {
  .el-form-item__label {
    text-align: left;
  }
  .el-form-item__content {
    display: flex;
  }
  .inline-input {
    .inline-input-body {
      justify-content: space-between;
    }
  }
}
</style>

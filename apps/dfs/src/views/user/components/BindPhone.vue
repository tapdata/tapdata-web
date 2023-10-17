<template>
  <!--  绑定手机号  -->
  <ElDialog
    width="500px"
    append-to-body
    :title="$t('components_BindPhone_qingBangDingShouJi')"
    :close-on-click-modal="!!$props.closeOnClickModal"
    :close-on-press-escape="!!$props.closeOnPressEscape"
    :show-close="!!$props.showClose"
    v-model:visible="dialogVisible"
    custom-class="bind-phone-dialog"
  >
    <ElForm :model="phoneForm" label-position="top" :label-width="showLabel ? '120px' : null" @submit.prevent>
      <ElFormItem prop="current" :label="showLabel ? $t('user_Center_dangQianShouJi') : ''">
        <ElInput
          v-model:value="phoneForm.current"
          :placeholder="$t('components_BindPhone_qingShuRuShouJi')"
          maxlength="50"
        >
          <template v-slot:prepend>
            <el-select v-model="phoneForm.countryCode" style="width: 110px" filterable>
              <el-option v-for="item in countryCode" :label="'+ ' + item.dial_code" :value="item.dial_code">
                <span style="float: left">{{ '+ ' + item.dial_code }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.name }}</span></el-option
              >
            </el-select>
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem prop="newPassword" :label="showLabel ? $t('user_Center_yanZhengMa') : ''" class="inline-form-item">
        <ElInput
          v-model:value="phoneForm.oldCode"
          :placeholder="$t('user_Center_qingShuRuShouJi')"
          maxlength="50"
        ></ElInput>
        <VerificationCode
          :request-options="getCodeOptions(phoneForm, 'BIND_PHONE')"
          :disabled="!phoneForm.current"
          :style="{ width: '180px', textAlign: 'center' }"
          class="ml-6"
          type="text"
        ></VerificationCode>
      </ElFormItem>
    </ElForm>

    <template v-slot:footer>
      <span class="dialog-footer">
        <VButton v-if="!!$props.showClose" @click="dialogVisible = false">{{ $t('public_button_cancel') }}</VButton>
        <VButton
          type="primary"
          :disabled="!phoneForm.current || !phoneForm.oldCode"
          auto-loading
          @click="bindPhoneConfirm(arguments[0])"
          >{{ $t('public_button_confirm') }}</VButton
        >
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../../utils/gogocodeTransfer'
import i18n from '@/i18n'

import VerificationCode from './VerificationCode'
import { getCodeOptions } from '../util'

export default {
  name: 'BindPhone',
  components: { VerificationCode },
  props: {
    visible: {
      type: Boolean
    },
    showLabel: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(v) {
      this.dialogVisible = !!v
    }
  },
  data() {
    return {
      countryCode: [],
      dialogVisible: false,
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
          $emit(this, 'success', phoneForm.current)
          this.dialogVisible = false
        })
        .catch(e => {
          $emit(this, 'error', phoneForm.current, e)
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
  },
  emits: ['success', 'error']
}
</script>

<style lang="scss" scoped>
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

<style lang="scss">
.bind-phone-dialog {
  border-radius: 4px;
  .el-dialog__header {
    text-align: center;
    border-bottom: 1px solid #ddd;
  }
  .el-dialog__body {
    padding-bottom: 0;
  }
  .el-dialog__footer {
    .dialog-footer {
      .v-button {
        width: 100%;
        .el-button {
          width: 100%;
          height: 32px;
        }
      }
    }
  }
}
</style>

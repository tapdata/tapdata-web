<script>
import i18n from '@/i18n'
import { $emit, $off, $on, $once } from '../../../../utils/gogocodeTransfer'

import { getCodeOptions } from '../util'
import VerificationCode from './VerificationCode'

export default {
  name: 'BindPhone',
  components: { VerificationCode },
  props: {
    visible: {
      type: Boolean,
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['success', 'error'],
  data() {
    return {
      countryCode: [],
      dialogVisible: false,
      phoneForm: {
        current: '',
        oldCode: '',
        newPhone: '',
        newCode: '',
        countryCode: '86',
      },
    }
  },
  watch: {
    visible(v) {
      this.dialogVisible = !!v
    },
  },
  mounted() {
    this.phoneForm.countryCode = window.__USER_INFO__?.phoneCountryCode || '86'
    this.getCountryCode()
  },
  methods: {
    getCodeOptions,
    bindPhoneConfirm(resetLoading) {
      const { phoneForm } = this
      this.$axios
        .post('api/tcm/user/phone', {
          phone: phoneForm.current,
          code: phoneForm.oldCode,
          countryCode: phoneForm.countryCode
            ? phoneForm.countryCode.replace('-', '')
            : '86',
        })
        .then(() => {
          this.$message.success(i18n.t('user_Center_bangDingShouJiCheng'))
          $emit(this, 'success', phoneForm.current)
          this.dialogVisible = false
        })
        .catch((error) => {
          $emit(this, 'error', phoneForm.current, error)
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    getCountryCode() {
      this.$axios.get('config/countryCode.json').then((res) => {
        const countryCode = res.data
        this.countryCode = countryCode?.countryCode
      })
    },
  },
}
</script>

<template>
  <!--  绑定手机号  -->
  <ElDialog
    v-model="dialogVisible"
    width="500px"
    append-to-body
    :title="$t('components_BindPhone_qingBangDingShouJi')"
    :close-on-click-modal="!!$props.closeOnClickModal"
    :close-on-press-escape="!!$props.closeOnPressEscape"
    :show-close="!!$props.showClose"
    class="bind-phone-dialog"
  >
    <ElForm
      :model="phoneForm"
      label-position="top"
      :label-width="showLabel ? '120px' : null"
      @submit.prevent
    >
      <ElFormItem
        prop="current"
        :label="showLabel ? $t('user_Center_dangQianShouJi') : ''"
      >
        <ElInput
          v-model="phoneForm.current"
          :placeholder="$t('components_BindPhone_qingShuRuShouJi')"
          maxlength="50"
        >
          <template #prepend>
            <el-select
              v-model="phoneForm.countryCode"
              style="width: 110px"
              filterable
            >
              <el-option
                v-for="item in countryCode"
                :label="`+ ${item.dial_code}`"
                :value="item.dial_code"
              >
                <span style="float: left">{{ `+ ${item.dial_code}` }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{
                  item.name
                }}</span></el-option
              >
            </el-select>
          </template>
        </ElInput>
      </ElFormItem>
      <ElFormItem
        prop="newPassword"
        :label="showLabel ? $t('user_Center_yanZhengMa') : ''"
        class="inline-form-item"
      >
        <ElInput
          v-model="phoneForm.oldCode"
          :placeholder="$t('user_Center_qingShuRuShouJi')"
          maxlength="50"
        />
        <VerificationCode
          :request-options="getCodeOptions(phoneForm, 'BIND_PHONE')"
          :disabled="!phoneForm.current"
          :style="{ width: '180px', textAlign: 'center' }"
          class="ml-6"
          text
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton v-if="!!$props.showClose" @click="dialogVisible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          type="primary"
          :disabled="!phoneForm.current || !phoneForm.oldCode"
          auto-loading
          @click="bindPhoneConfirm(arguments[0])"
          >{{ $t('public_button_confirm') }}</ElButton
        >
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  text-align: left;
}
:deep(.el-form-item__content) {
  display: flex;
}
:deep(.inline-input) {
  .inline-input-body {
    justify-content: space-between;
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

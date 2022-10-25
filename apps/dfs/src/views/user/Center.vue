<template>
  <div class="user-center g-panel-container flex-fill">
    <div class="fs-7">{{ $t('user_Center_geRenXinXi') }}</div>
    <ElDivider class="my-6"></ElDivider>
    <div>
      <div>
        <ElRow :gutter="40" class="section-header mb-6">
          <ElCol :span="12" class="user-item">
            <div class="user-item__label">{{ $t('user_name') }}{{ $t('symbol_colon') }}</div>
            <div class="user-item__value">{{ userData.username }}</div>
          </ElCol>
        </ElRow>
        <ElRow :gutter="40" class="section-header mb-6">
          <ElCol :span="12" class="user-item">
            <div class="user-item__label">{{ $t('user_Center_yongHuNiCheng') }}</div>
            <InlineInput
              class="inline-input fs-8"
              :value="userData.nickname"
              :icon-config="{ class: 'color-primary', size: '12' }"
              type="text"
              style="width: 202px"
              @save="updateName($event)"
            ></InlineInput>
          </ElCol>
          <ElCol :span="12" class="user-item">
            <div class="user-item__label">{{ $t('user_password') }}{{ $t('symbol_colon') }}</div>
            <div class="user-item__value">******</div>
            <ElLink type="primary" @click="editPassword">{{ $t('user_Center_xiuGai') }}</ElLink>
          </ElCol>
        </ElRow>
        <ElRow :gutter="40" class="section-header mb-6">
          <ElCol :span="12" class="user-item">
            <div class="user-item__label">{{ $t('user_phone_number') }}</div>
            <div class="user-item__value">{{ userData.telephone || $t('user_Center_weiBangDing') }}</div>
            <ElLink v-if="userData.telephone" type="primary" @click="editPhone">{{ $t('user_Center_xiuGai') }}</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindPhone = true">{{ $t('button_bind') }}</ElLink>
          </ElCol>
          <ElCol :span="12" class="user-item">
            <div class="user-item__label">{{ $t('user_avatar') }}</div>
            <div class="user-item__value position-relative">
              <img
                v-if="userData.avatar"
                :src="userData.avatar"
                alt=""
                style="position: absolute; top: -24px; left: 0; width: 56px; height: 56px; border-radius: 50%"
              />
              <span v-else>{{ $t('data_no') }}</span>
            </div>
            <ElLink type="primary" @click="editAvatar">{{ $t('user_Center_xiuGai') }}</ElLink>
          </ElCol>
        </ElRow>
        <ElRow :gutter="40" class="section-header mb-6">
          <!--          <ElCol :span="12" class="user-item">-->
          <!--            <div class="user-item__label">{{ $t('user_wechat') + $t('symbol_colon') }}</div>-->
          <!--            <div class="user-item__value">{{ userData.wx || $t('user_Center_weiBangDing') }}</div>-->
          <!--            <ElLink v-if="userData.wx" type="primary" @click="unbindWx">{{ $t('button_unbind') }}</ElLink>-->
          <!--            <ElLink v-else type="primary" @click="dialogObj.bindWx = true">{{ $t('button_bind') }}</ElLink>-->
          <!--          </ElCol>-->
          <ElCol :span="12" class="user-item">
            <div class="user-item__label">{{ $t('user_Center_youXiang') }}</div>
            <div class="user-item__value">{{ userData.email || $t('user_Center_weiBangDing') }}</div>
            <ElLink v-if="userData.email" type="primary" @click="editEmail">{{ $t('user_Center_xiuGai') }}</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindEmail = true">{{ $t('button_bind') }}</ElLink>
          </ElCol>
        </ElRow>
      </div>
    </div>
    <div class="mt-12 fs-7">{{ $t('user_Center_qiYeXinXi') }}</div>
    <ElDivider class="my-6"></ElDivider>
    <div>
      <div>
        <ElRow :gutter="40" class="section-header mb-2">
          <ElCol :span="12" class="enterprise-item">
            <div class="enterprise-item__label">{{ $t('user_Center_gongSiMingCheng') }}</div>
            <div v-if="!isEdit" class="enterprise-item__value">
              {{ enData.companyName || $t('user_Center_weiTianXie') }}
            </div>
            <ElInput v-else v-model="enForm.companyName" class="enterprise-item__value"></ElInput>
          </ElCol>
          <ElCol :span="12" class="enterprise-item">
            <div class="enterprise-item__label">{{ $t('user_Center_gongSiGuanWang') }}</div>
            <div v-if="!isEdit" class="enterprise-item__value">
              {{ enData.website || $t('user_Center_weiTianXie') }}
            </div>
            <ElInput v-else v-model="enForm.website" class="enterprise-item__value"></ElInput>
          </ElCol>
        </ElRow>
        <ElRow :gutter="40" class="section-header mb-2">
          <ElCol :span="12" class="enterprise-item">
            <div class="enterprise-item__label">{{ $t('user_Center_suoShuHangYe') }}</div>
            <div v-if="!isEdit" class="enterprise-item__value">
              {{ enData.industry || $t('user_Center_weiTianXie') }}
            </div>
            <ElInput v-else v-model="enForm.industry" class="enterprise-item__value"></ElInput>
          </ElCol>
          <ElCol :span="12" class="enterprise-item">
            <div class="enterprise-item__label">{{ $t('user_Center_suoShuChengShi') }}</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.city || $t('user_Center_weiTianXie') }}</div>
            <ElInput v-else v-model="enForm.city" class="enterprise-item__value"></ElInput>
          </ElCol>
        </ElRow>
        <VButton v-if="!isEdit" type="text" class="pl-0" @click="editEnData">{{
          $t('user_Center_qiYeXinXiXiu')
        }}</VButton>
        <template v-else>
          <VButton type="text" class="pl-0" @click="cancelEditEnData">{{ $t('button_cancel') }}</VButton>
          <VButton type="text" auto-loading @click="saveEnData(arguments[0])">{{ $t('button_save') }}</VButton>
        </template>
      </div>
    </div>
    <div class="mt-12 fs-7">Access Key/Secret Key</div>
    <ElDivider class="my-6"></ElDivider>
    <div>
      <div>
        <ElRow :gutter="40" class="section-header mb-2">
          <ElCol :span="12" class="enterprise-item">
            <div class="enterprise-item__label">Access Key：</div>
            <div>
              {{ keyForm.accessKey }}
            </div>
          </ElCol>
          <ElCol :span="12" class="enterprise-item">
            <div class="enterprise-item__label">Secret Key：</div>
            <div>
              {{ keyForm.secretKey }}
            </div>
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_start_install_button_copied')"
              popper-class="copy-tooltip"
              :value="showTooltip"
            >
              <span
                class="operaKey"
                v-clipboard:copy="keyForm.decodeSecretKey"
                v-clipboard:success="handleCopy"
                @mouseleave="showTooltip = false"
              >
                <i class="click-style">{{ $t('agent_deploy_start_install_button_copy') }}</i>
              </span>
            </ElTooltip>
          </ElCol>
        </ElRow>
      </div>
    </div>
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('user_Center_shangChuanTouXiang')"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.avatar"
    >
      <div class="text-center">
        <UploadFile :upload="upload" accept="image/*">
          <img v-if="avatar" :src="avatar" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <div class="my-4 font-color-main">{{ $t('user_Center_zhiChiJPG') }}</div>
          <VButton type="primary">{{ $t('user_Center_shangChuanTouXiang') }}</VButton>
        </UploadFile>
      </div>
      <div class="mt-6 text-center">
        <VButton @click="dialogObj.avatar = false">{{ $t('button_cancel') }}</VButton>
        <VButton type="primary" :disabled="avatarDisabled()" auto-loading @click="avatarConfirm(arguments[0])">{{
          $t('button_confirm')
        }}</VButton>
      </div>
    </ElDialog>
    <!--  {{$t('operation_log_List_xiuGaiMiMa')}}  -->
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('operation_log_List_xiuGaiMiMa')"
      label-width="120px"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.password"
    >
      <ElForm :model="passwordForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" :label="$t('user_Center_dangQianShouJi')">
          <ElInput
            v-model="passwordForm.telephone"
            :placeholder="$t('user_Center_qingShuRuDangQian')"
            maxlength="50"
            disabled
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" :label="$t('user_Center_shouJiYanZhengMa')" class="inline-form-item">
          <ElInput
            v-model="passwordForm.code"
            :placeholder="$t('user_Center_qingShuRuShouJi')"
            maxlength="50"
          ></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(passwordForm.telephone, 'RESET_PASSWORD')"
            :disabled="!passwordForm.telephone"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
        <ElFormItem prop="newPassword" :label="$t('user_Center_xinMiMa')">
          <ElInput
            v-model="passwordForm.newPassword"
            :placeholder="$t('user_Center_qingShuRuXinMi')"
            maxlength="50"
            show-password
            onkeyup="value=value.replace(/[\u4e00-\u9fa5]/ig,'')"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" :label="$t('user_Center_queRenMiMa')">
          <ElInput
            v-model="passwordForm.newAgainPassword"
            :placeholder="$t('user_Center_qingShuRuXinMi')"
            maxlength="50"
            show-password
            onkeyup="value=value.replace(/[\u4e00-\u9fa5]/ig,'')"
          ></ElInput>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.password = false">{{ $t('button_cancel') }}</VButton>
        <VButton type="primary" auto-loading @click="passwordConfirm(arguments[0])" @>{{
          $t('button_confirm')
        }}</VButton>
      </span>
    </ElDialog>
    <!--  {{$t('operation_log_List_bangDingShouJiHao')}}  -->
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('operation_log_List_bangDingShouJiHao')"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.bindPhone"
    >
      <ElForm :model="phoneForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" :label="$t('user_Center_dangQianShouJi')">
          <ElInput
            v-model="phoneForm.current"
            :placeholder="$t('user_Center_qingShuRuDangQian')"
            maxlength="50"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" :label="$t('user_Center_yanZhengMa')" class="inline-form-item">
          <ElInput
            v-model="phoneForm.oldCode"
            :placeholder="$t('user_Center_qingShuRuShouJi')"
            maxlength="50"
          ></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(phoneForm.current, 'BIND_PHONE')"
            :disabled="!phoneForm.current"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.bindPhone = false">{{ $t('button_cancel') }}</VButton>
        <VButton type="primary" :disabled="!phoneForm.oldCode" auto-loading @click="bindPhoneConfirm(arguments[0])">{{
          $t('button_confirm')
        }}</VButton>
      </span>
    </ElDialog>
    <!--  {{$t('operation_log_List_xiuGaiShouJiHao')}}  -->
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('operation_log_List_xiuGaiShouJiHao')"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.editPhone"
    >
      <ElForm :model="phoneForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" :label="$t('user_Center_dangQianShouJi')">
          <ElInput
            v-model="phoneForm.current"
            :placeholder="$t('user_Center_qingShuRuDangQian')"
            maxlength="50"
            disabled
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" :label="$t('user_Center_jiuShouJiYanZheng')" class="inline-form-item">
          <ElInput
            v-model="phoneForm.oldCode"
            :placeholder="$t('user_Center_qingShuRuJiuShou')"
            maxlength="50"
          ></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(phoneForm.current, 'CHANGE_PHONE')"
            :disabled="!phoneForm.current"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" :label="$t('user_Center_xinShouJi')">
          <ElInput
            v-model="phoneForm.newPhone"
            :placeholder="$t('user_Center_qingShuRuXinShou2')"
            maxlength="50"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" :label="$t('user_Center_xinShouJiYanZheng')">
          <ElInput
            v-model="phoneForm.newCode"
            :placeholder="$t('user_Center_qingShuRuXinShou')"
            maxlength="50"
          ></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(phoneForm.newPhone, 'BIND_PHONE')"
            :disabled="!phoneForm.current"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.editPhone = false">{{ $t('button_cancel') }}</VButton>
        <VButton type="primary" :disabled="editPhoneDisabled()" auto-loading @click="editPhoneConfirm(arguments[0])">{{
          $t('button_confirm')
        }}</VButton>
      </span>
    </ElDialog>
    <!--  {{$t('user_Center_bangDingWeiXin')}}  -->
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('user_Center_bangDingWeiXin')"
      :close-on-click-modal="true"
      :visible.sync="dialogObj.bindWx"
    >
      <div class="text-center">
        <img src="../../../public/images/user/bindWx.png" alt="" style="width: 200px" />
        <div class="mt-4 font-color-main">{{ $t('user_Center_qingShiYongWeiXin') }}</div>
      </div>
    </ElDialog>
    <!--  {{$t('operation_log_List_bangDingYouXiang')}}  -->
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('operation_log_List_bangDingYouXiang')"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.bindEmail"
    >
      <ElForm :model="emailForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" :label="$t('user_Center_youXiang')">
          <ElInput
            v-model="emailForm.email"
            :placeholder="$t('user_Center_qingShuRuYouXiang')"
            maxlength="50"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" :label="$t('user_Center_yanZhengMa')" class="inline-form-item">
          <ElInput v-model="emailForm.code" :placeholder="$t('user_Center_qingShuRuYanZheng')" maxlength="50"></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(emailForm.email, 'BIND_EMAIL', 'email')"
            :disabled="!emailForm.email"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.bindEmail = false">{{ $t('button_cancel') }}</VButton>
        <VButton
          type="primary"
          :disabled="!emailForm.email || !emailForm.code"
          auto-loading
          @click="bindEmailConfirm(arguments[0])"
          >{{ $t('button_confirm') }}</VButton
        >
      </span>
    </ElDialog>
    <!--  {{$t('operation_log_List_xiuGaiYouXiang')}}  -->
    <ElDialog
      width="435px"
      append-to-body
      :title="$t('operation_log_List_xiuGaiYouXiang')"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.editEmail"
    >
      <ElForm :model="emailForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="email" :label="$t('user_Center_youXiang')">
          <ElInput
            v-model="emailForm.email"
            disabled
            :placeholder="$t('user_Center_qingShuRuYouXiang')"
            maxlength="50"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="code" :label="$t('user_Center_dangQianYouXiangYan')" class="inline-form-item">
          <ElInput v-model="emailForm.code" :placeholder="$t('user_Center_qingShuRuYanZheng')" maxlength="50"></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(emailForm.email, 'CHANGE_EMAIL', 'email')"
            :disabled="!emailForm.email"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
        <ElFormItem prop="newEmail" :label="$t('user_Center_xinYouXiang')">
          <ElInput
            v-model="emailForm.newEmail"
            :placeholder="$t('user_Center_qingShuRuXinYou')"
            maxlength="50"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newCode" :label="$t('user_Center_xinYouXiangYanZheng')" class="inline-form-item">
          <ElInput
            v-model="emailForm.newCode"
            :placeholder="$t('user_Center_qingShuRuYanZheng')"
            maxlength="50"
          ></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(emailForm.newEmail, 'BIND_EMAIL', 'email')"
            :disabled="!emailForm.newEmail"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.editEmail = false">{{ $t('button_cancel') }}</VButton>
        <VButton type="primary" :disabled="editEmailDisabled()" auto-loading @click="editEmailConfirm(arguments[0])">{{
          $t('button_confirm')
        }}</VButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import i18n from '@/i18n'

import InlineInput from '@/components/InlineInput'
import VerificationCode from '@/components/VerificationCode'
import UploadFile from '@/components/UploadFile'
import { urlToBase64 } from '@/util'
import CryptoJS from 'crypto-js'

export default {
  name: 'Center',
  components: { InlineInput, VerificationCode, UploadFile },
  data() {
    return {
      userData: {
        username: '',
        nickname: '',
        avatar: '',
        telephone: '',
        wx: '',
        email: ''
      },
      nameForm: {
        nickname: ''
      },
      avatar: '',
      dialogObj: {
        avatar: false,
        password: false,
        bindPhone: false,
        editPhone: false,
        bindWx: false,
        bindEmail: false,
        editEmail: false
      },
      passwordForm: {
        telephone: '',
        code: '',
        newPassword: '',
        newAgainPassword: ''
      },
      phoneForm: {
        current: '',
        oldCode: '',
        newPhone: '',
        newCode: ''
      },
      emailForm: {
        email: '',
        code: '',
        newEmail: '',
        newCode: ''
      },
      enData: {
        companyName: '',
        website: '',
        industry: '',
        city: ''
      },
      enForm: {
        companyName: '',
        website: '',
        industry: '',
        city: ''
      },
      keyForm: {
        accessKey: '',
        secretKey: '',
        decodeSecretKey: ''
      },
      isEdit: false,
      showTooltip: false
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let { userData, nameForm } = this
      for (let key in userData) {
        userData[key] = window.__USER_INFO__[key]
      }
      userData.avatar = window.__USER_INFO__.avatar
      this.avatar = userData.avatar
      this.getEnterprise()
      this.getAkAndSk()
      this.resetPasswordForm()
      this.resetPhoneForm()
      this.resetEmailForm()
      nameForm.nickname = userData.nickname
    },
    getEnterprise() {
      this.$axios.get('tm/api/Customer').then(data => {
        for (let key in this.enData) {
          this.enData[key] = data[key] || ''
          this.enForm[key] = data[key] || ''
        }
      })
    },
    getAkAndSk() {
      this.$axios.get('api/tcm/user/ak').then(data => {
        const { accessKey, secretKey } = data?.[0] || {}
        const key = '5fa25b06ee34581d'
        this.keyForm.accessKey = accessKey
        this.keyForm.secretKey = secretKey.replace(/(\w{3})\w*(\w{3})/, '$1****$2')
        this.keyForm.decodeSecretKey = CryptoJS.AES.decrypt(
          {
            ciphertext: CryptoJS.enc.Base64.parse(secretKey)
          },
          CryptoJS.enc.Latin1.parse(key),
          {
            iv: CryptoJS.enc.Latin1.parse(key)
          }
        ).toString(CryptoJS.enc.Utf8)
      })
    },
    resetPasswordForm() {
      let { userData, passwordForm } = this
      for (let key in passwordForm) {
        if (key === 'telephone') {
          this.passwordForm.telephone = userData.telephone
        } else {
          this.passwordForm[key] = ''
        }
      }
    },
    resetPhoneForm() {
      let { userData, phoneForm } = this
      for (let key in phoneForm) {
        if (key === 'current') {
          this.phoneForm.current = userData.telephone
        } else {
          this.phoneForm[key] = ''
        }
      }
    },
    resetEmailForm() {
      let { userData, emailForm } = this
      for (let key in emailForm) {
        if (key === 'email') {
          this.emailForm.email = userData.email
        } else {
          this.emailForm[key] = ''
        }
      }
    },
    updateName(val) {
      let nickname = val
      this.$axios
        .patch('api/tcm/user', {
          nickname
        })
        .then(() => {
          this.userData.nickname = nickname
          this.$message.success(i18n.t('user_Center_xiuGaiNiChengCheng'))
        })
    },
    upload(evt) {
      let file = evt.target.files[0]
      const leftThan = file.size / 1024 < 500
      if (!leftThan) {
        this.$message.error(i18n.t('user_Center_shangChuanTouXiangTu'))
        return
      }
      urlToBase64(URL.createObjectURL(file)).then(res => {
        this.avatar = res
      })
    },
    avatarDisabled() {
      return !this.avatar || this.userData.avatar === this.avatar
    },
    editAvatar() {
      this.avatar = this.userData.avatar
      this.dialogObj.avatar = true
    },
    avatarConfirm(resetLoading) {
      const avatar = encodeURI(this.avatar)
      this.$axios
        .patch('api/tcm/user', {
          avatar
        })
        .then(() => {
          this.$message.success(i18n.t('user_Center_xiuGaiTouXiangCheng'))
          this.userData.avatar = avatar
          this.refreshRootUser()
          this.dialogObj.avatar = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    sendCode(phone, scene) {
      return this.$axios.post('api/tcm/sms/captcha', {
        phone,
        scene
      })
    },
    getCodeOptions(val, scene, type = 'sms') {
      let params = {
        scene
      }
      if (type === 'sms') {
        params.phone = val
      } else {
        params.email = val
      }
      return {
        method: 'post',
        url: `api/tcm/${type}/captcha`,
        params
      }
    },
    editPassword() {
      if (!this.userData.telephone) {
        this.$confirm(i18n.t('user_Center_qingXianBangDingShou'), i18n.t('user_Center_bangDingShouJi'), {
          type: 'warning'
        }).then(resFlag => {
          if (resFlag) {
            this.dialogObj.bindPhone = true
          }
        })
        return
      }
      this.passwordForm.telephone = this.userData.telephone
      this.dialogObj.password = true
    },
    passwordConfirm(resetLoading) {
      let { passwordForm } = this
      let { newPassword, newAgainPassword } = passwordForm
      if (newPassword !== newAgainPassword) {
        this.$message.error(i18n.t('user_Center_shuRuMiMaBu'))
        resetLoading?.()
        return
      }
      this.$axios
        .patch('api/tcm/user/password', {
          phoneCode: passwordForm.code,
          password: CryptoJS.RC4.encrypt(passwordForm.newPassword, 'XWFSxfs8wFcs').toString()
        })
        .then(() => {
          this.$message.success(i18n.t('user_Center_xiuGaiMiMaCheng'))
          this.resetPasswordForm()
          this.dialogObj.password = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    // bindPhoneSendCode() {
    //   return this.sendCode(this.phoneForm.current, 'BIND_PHONE')
    // },
    bindPhoneConfirm(resetLoading) {
      let { phoneForm } = this
      this.$axios
        .post('api/tcm/user/phone', {
          phone: phoneForm.current,
          code: phoneForm.oldCode
        })
        .then(() => {
          this.userData.telephone = phoneForm.current
          this.resetPhoneForm()
          this.$message.success(i18n.t('user_Center_bangDingShouJiCheng'))
          this.dialogObj.bindPhone = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    editPhone() {
      this.phoneForm.current = this.userData.telephone
      this.dialogObj.editPhone = true
    },
    editPhoneOldSendCode() {
      return this.$axios.get('tm/api/user/sendCode')
    },
    editPhoneNewSendCode() {
      return this.$axios.get('tm/api/user/sendCode')
    },
    editPhoneDisabled() {
      let flag = false
      const { phoneForm } = this
      for (let key in phoneForm) {
        if (phoneForm[key]) {
          flag = true
        }
      }
      return !flag
    },
    editPhoneConfirm(resetLoading) {
      let { phoneForm } = this
      this.$axios
        .patch('api/tcm/user/phone', {
          oldPhoneCode: phoneForm.oldCode,
          phone: phoneForm.newPhone,
          phoneCode: phoneForm.newCode
        })
        .then(() => {
          this.userData.telephone = phoneForm.newPhone
          this.resetPhoneForm()
          this.$message.success(i18n.t('user_Center_xiuGaiShouJiCheng'))
          this.dialogObj.editPhone = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    unbindWx() {
      this.$confirm(i18n.t('user_Center_jieChuHouJiangWu'), i18n.t('user_Center_jieChuWeiXin'), {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.$axios.patch('tm/api/user/unbindWx').then(() => {
            this.userData.wx = ''
            this.$message.success(i18n.t('user_Center_jieBangWeiXinCheng'))
            this.dialogObj.editPhone = false
          })
        }
      })
    },
    bindEmailSendCode() {
      return this.$axios.get('tm/api/user/sendCode')
    },
    bindEmailConfirm(resetLoading) {
      let { emailForm } = this
      this.$axios
        .post('api/tcm/user/email', {
          email: emailForm.email,
          code: emailForm.code
        })
        .then(() => {
          this.userData.email = emailForm.email
          this.resetEmailForm()
          this.$message.success(i18n.t('user_Center_bangDingYouXiangCheng'))
          this.dialogObj.bindEmail = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    editEmail() {
      this.emailForm.email = this.userData.email
      this.dialogObj.editEmail = true
    },
    editEmailDisabled() {
      let flag = false
      const { emailForm } = this
      for (let key in emailForm) {
        if (emailForm[key]) {
          flag = true
        }
      }
      return !flag
    },
    editEmailConfirm(resetLoading) {
      let { emailForm } = this
      this.$axios
        .patch('api/tcm/user/email', {
          // email: emailForm.email,
          oldEmailCode: emailForm.code,
          email: emailForm.newEmail,
          emailCode: emailForm.newCode
        })
        .then(() => {
          this.userData.email = emailForm.newEmail
          this.resetEmailForm()
          this.$message.success(i18n.t('user_Center_xiuGaiYouXiangCheng'))
          this.dialogObj.editEmail = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    editEnData() {
      this.enForm = Object.assign({}, this.enData)
      this.isEdit = true
    },
    cancelEditEnData() {
      this.isEdit = false
    },
    saveEnData(resetLoading) {
      let { enForm } = this
      this.$axios
        .patch('tm/api/Customer', {
          companyName: enForm.companyName,
          website: enForm.website,
          industry: enForm.industry,
          city: enForm.city
        })
        .then(() => {
          this.$message.success(i18n.t('user_Center_xiuGaiQiYeXin'))
          this.enData = Object.assign({}, enForm)
          this.isEdit = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    refreshRootUser() {
      this.$root.$emit('get-user')
    },
    handleCopy() {
      this.showTooltip = true
    }
  }
}
</script>

<style lang="scss" scoped>
.user-item {
  display: flex;
  align-items: center;
}
.user-item__label {
  width: 80px;
}
.user-item__value {
  width: 180px;
}
.enterprise-item {
  display: flex;
  align-items: center;
  line-height: 34px;
}
.enterprise-item__label {
  width: 80px;
}
.enterprise-item__value {
  width: 240px;
}
.avatar-uploader-icon {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
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
.click-style {
  padding-left: 10px;
  font-size: 12px;
  font-style: normal;
  color: map-get($color, primary);
  font-weight: normal;
  cursor: pointer;
}
</style>

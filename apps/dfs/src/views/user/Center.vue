<template>
  <div class="user-center g-panel-container flex-fill">
    <div class="fs-7">个人信息</div>
    <ElDivider class="my-6"></ElDivider>
    <div>
      <div>
        <el-row :gutter="40" class="section-header mb-6">
          <el-col :span="12" class="user-item">
            <div class="user-item__label">用户名：</div>
            <div class="user-item__value">{{ userData.username }}</div>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="section-header mb-6">
          <el-col :span="12" class="user-item">
            <div class="user-item__label">用户昵称：</div>
            <InlineInput
              class="inline-input fs-8"
              :value="userData.nickname"
              :icon-config="{ class: 'color-primary', size: '12' }"
              type="text"
              style="width: 202px"
              @save="updateName($event)"
            ></InlineInput>
          </el-col>
          <el-col :span="12" class="user-item">
            <div class="user-item__label">密码：</div>
            <div class="user-item__value">******</div>
            <ElLink type="primary" @click="editPassword">修改</ElLink>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="section-header mb-6">
          <el-col :span="12" class="user-item">
            <div class="user-item__label">手机号：</div>
            <div class="user-item__value">{{ userData.telephone || '未绑定' }}</div>
            <ElLink v-if="userData.telephone" type="primary" @click="editPhone">修改</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindPhone = true">绑定</ElLink>
          </el-col>
          <el-col :span="12" class="user-item">
            <div class="user-item__label">头像：</div>
            <div class="user-item__value position-relative">
              <img
                v-if="userData.avatar"
                :src="userData.avatar"
                alt=""
                style="position: absolute; top: -24px; left: 0; width: 56px; height: 56px; border-radius: 50%"
              />
              <span v-else>暂无</span>
            </div>
            <ElLink type="primary" @click="editAvatar">修改</ElLink>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="section-header mb-6">
          <!--          <el-col :span="12" class="user-item">-->
          <!--            <div class="user-item__label">微信：</div>-->
          <!--            <div class="user-item__value">{{ userData.wx || '未绑定' }}</div>-->
          <!--            <ElLink v-if="userData.wx" type="primary" @click="unbindWx">解绑</ElLink>-->
          <!--            <ElLink v-else type="primary" @click="dialogObj.bindWx = true">绑定</ElLink>-->
          <!--          </el-col>-->
          <el-col :span="12" class="user-item">
            <div class="user-item__label">邮箱：</div>
            <div class="user-item__value">{{ userData.email || '未绑定' }}</div>
            <ElLink v-if="userData.email" type="primary" @click="editEmail">修改</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindEmail = true">绑定</ElLink>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="mt-12 fs-7">企业信息</div>
    <ElDivider class="my-6"></ElDivider>
    <div>
      <div>
        <el-row :gutter="40" class="section-header mb-2">
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">公司名称：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.companyName || '未填写' }}</div>
            <ElInput v-else v-model="enForm.companyName" class="enterprise-item__value"></ElInput>
          </el-col>
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">公司官网：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.website || '未填写' }}</div>
            <ElInput v-else v-model="enForm.website" class="enterprise-item__value"></ElInput>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="section-header mb-2">
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">所属行业：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.industry || '未填写' }}</div>
            <ElInput v-else v-model="enForm.industry" class="enterprise-item__value"></ElInput>
          </el-col>
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">所属城市：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.city || '未填写' }}</div>
            <ElInput v-else v-model="enForm.city" class="enterprise-item__value"></ElInput>
          </el-col>
        </el-row>
        <VButton v-if="!isEdit" type="text" @click="editEnData">企业信息修改</VButton>
        <template v-else>
          <VButton type="text" @click="cancelEditEnData">取消</VButton>
          <VButton type="text" auto-loading @click="saveEnData(arguments[0])">保存</VButton>
        </template>
      </div>
    </div>
    <!--  上传头像  -->
    <ElDialog
      width="435px"
      append-to-body
      title="上传头像"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.avatar"
    >
      <div class="text-center">
        <UploadFile :upload="upload" accept="image/*">
          <img v-if="avatar" :src="avatar" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <div class="my-4 font-color-main">支持JPG、PNG和GIF格式，图片大小需在500KB以内</div>
          <VButton type="primary">上传头像</VButton>
        </UploadFile>
      </div>
      <div class="mt-6 text-center">
        <VButton @click="dialogObj.avatar = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="avatarDisabled()" auto-loading @click="avatarConfirm(arguments[0])">{{
          $t('dataVerify.confirm')
        }}</VButton>
      </div>
    </ElDialog>
    <!--  修改密码  -->
    <ElDialog
      width="435px"
      append-to-body
      title="修改密码"
      label-width="120px"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.password"
    >
      <ElForm :model="passwordForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" label="当前手机：">
          <ElInput v-model="passwordForm.telephone" placeholder="请输入当前手机" maxlength="50" disabled></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="手机验证码：" class="inline-form-item">
          <ElInput v-model="passwordForm.code" placeholder="请输入手机验证码" maxlength="50"></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(passwordForm.telephone, 'RESET_PASSWORD')"
            :disabled="!passwordForm.telephone"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="新密码：">
          <ElInput
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
            maxlength="50"
            show-password
            onkeyup="value=value.replace(/[^\w\.\/]/ig,'')"
          ></ElInput>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" label="确认密码：">
          <ElInput
            v-model="passwordForm.newAgainPassword"
            placeholder="请输入新密码"
            maxlength="50"
            show-password
            onkeyup="value=value.replace(/[^\w\.\/]/ig,'')"
          ></ElInput>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.password = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" auto-loading @click="passwordConfirm(arguments[0])" @>{{
          $t('dataVerify.confirm')
        }}</VButton>
      </span>
    </ElDialog>
    <!--  绑定手机号  -->
    <ElDialog
      width="435px"
      append-to-body
      title="绑定手机号"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.bindPhone"
    >
      <ElForm :model="phoneForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" label="当前手机：">
          <ElInput v-model="phoneForm.current" placeholder="请输入当前手机" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="验证码：" class="inline-form-item">
          <ElInput v-model="phoneForm.oldCode" placeholder="请输入手机验证码" maxlength="50"></ElInput>
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
        <VButton @click="dialogObj.bindPhone = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="!phoneForm.oldCode" auto-loading @click="bindPhoneConfirm(arguments[0])">{{
          $t('dataVerify.confirm')
        }}</VButton>
      </span>
    </ElDialog>
    <!--  修改手机号  -->
    <ElDialog
      width="435px"
      append-to-body
      title="修改手机号"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.editPhone"
    >
      <ElForm :model="phoneForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" label="当前手机：">
          <ElInput v-model="phoneForm.current" placeholder="请输入当前手机" maxlength="50" disabled></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="旧手机验证码：" class="inline-form-item">
          <ElInput v-model="phoneForm.oldCode" placeholder="请输入旧手机验证码" maxlength="50"></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(phoneForm.current, 'CHANGE_PHONE')"
            :disabled="!phoneForm.current"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" label="新手机：">
          <ElInput v-model="phoneForm.newPhone" placeholder="请输入新手机" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" label="新手机验证码：">
          <ElInput v-model="phoneForm.newCode" placeholder="请输入新手机验证码" maxlength="50"></ElInput>
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
        <VButton @click="dialogObj.editPhone = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="editPhoneDisabled()" auto-loading @click="editPhoneConfirm(arguments[0])">{{
          $t('dataVerify.confirm')
        }}</VButton>
      </span>
    </ElDialog>
    <!--  绑定微信  -->
    <ElDialog
      width="435px"
      append-to-body
      title="绑定微信"
      :close-on-click-modal="true"
      :visible.sync="dialogObj.bindWx"
    >
      <div class="text-center">
        <img src="../../../public/images/user/bindWx.png" alt="" style="width: 200px" />
        <div class="mt-4 font-color-main">请使用微信扫描二维码绑定Tapdata Cloud</div>
      </div>
    </ElDialog>
    <!--  绑定邮箱  -->
    <ElDialog
      width="435px"
      append-to-body
      title="绑定邮箱"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.bindEmail"
    >
      <ElForm :model="emailForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" label="邮箱：">
          <ElInput v-model="emailForm.email" placeholder="请输入邮箱" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="验证码：" class="inline-form-item">
          <ElInput v-model="emailForm.code" placeholder="请输入验证码" maxlength="50"></ElInput>
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
        <VButton @click="dialogObj.bindEmail = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton
          type="primary"
          :disabled="!emailForm.email || !emailForm.code"
          auto-loading
          @click="bindEmailConfirm(arguments[0])"
          >{{ $t('dataVerify.confirm') }}</VButton
        >
      </span>
    </ElDialog>
    <!--  修改邮箱  -->
    <ElDialog
      width="435px"
      append-to-body
      title="修改邮箱"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.editEmail"
    >
      <ElForm :model="emailForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="email" label="邮箱：">
          <ElInput v-model="emailForm.email" disabled placeholder="请输入邮箱" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="code" label="当前邮箱验证码：" class="inline-form-item">
          <ElInput v-model="emailForm.code" placeholder="请输入验证码" maxlength="50"></ElInput>
          <VerificationCode
            :request-options="getCodeOptions(emailForm.email, 'CHANGE_EMAIL', 'email')"
            :disabled="!emailForm.email"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
        <ElFormItem prop="newEmail" label="新邮箱：">
          <ElInput v-model="emailForm.newEmail" placeholder="请输入新邮箱" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="newCode" label="新邮箱验证码：" class="inline-form-item">
          <ElInput v-model="emailForm.newCode" placeholder="请输入验证码" maxlength="50"></ElInput>
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
        <VButton @click="dialogObj.editEmail = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="editEmailDisabled()" auto-loading @click="editEmailConfirm(arguments[0])">{{
          $t('dataVerify.confirm')
        }}</VButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
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
      isEdit: false
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
          this.$message.success('修改昵称成功')
        })
    },
    upload(evt) {
      let file = evt.target.files[0]
      const leftThan = file.size / 1024 < 500
      if (!leftThan) {
        this.$message.error('上传头像图片大小不能超过 500KB!')
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
          this.$message.success('修改头像成功')
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
        this.$confirm('请先绑定手机号', '绑定手机', {
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
      // CryptoJS.RC4.encrypt(this.form.password, 'XWFSxfs8wFcs').toString()
      let { passwordForm } = this
      let { newPassword, newAgainPassword } = passwordForm
      if (newPassword !== newAgainPassword) {
        this.$message.error('输入密码不一致')
        resetLoading?.()
        return
      }
      this.$axios
        .patch('api/tcm/user/password', {
          phoneCode: passwordForm.code,
          password: CryptoJS.RC4.encrypt(passwordForm.newPassword, 'XWFSxfs8wFcs').toString()
        })
        .then(() => {
          this.$message.success('修改密码成功')
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
          this.$message.success('绑定手机成功')
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
          this.$message.success('修改手机成功')
          this.dialogObj.editPhone = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    unbindWx() {
      this.$confirm('解除后将无法使用微信登录和接收微信通知，确定解绑吗', '解除微信', {
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.$axios.patch('tm/api/user/unbindWx').then(() => {
            this.userData.wx = ''
            this.$message.success('解绑微信成功')
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
          this.$message.success('绑定邮箱成功')
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
          this.$message.success('修改邮箱成功')
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
          this.$message.success('修改企业信息成功')
          this.enData = Object.assign({}, enForm)
          this.isEdit = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    refreshRootUser() {
      this.$root.$emit('get-user')
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
</style>

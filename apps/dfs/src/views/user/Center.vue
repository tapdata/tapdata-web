<template>
  <div class="user-center g-panel-container h-100">
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
              class="inline-input color-primary fs-8"
              :value="nameForm.nickname"
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
            <div class="user-item__value">{{ userData.phone || '未绑定' }}</div>
            <ElLink v-if="userData.phone" type="primary" @click="dialogObj.editPhone = true">修改</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindPhone = true">绑定</ElLink>
          </el-col>
          <el-col :span="12" class="user-item">
            <div class="user-item__label">头像：</div>
            <div class="user-item__value">
              <img v-if="userData.avatar" :src="userData.avatar" alt="" style="width: 56px" />
              <span v-else>暂无</span>
            </div>
            <ElLink type="primary" @click="dialogObj.avatar = true">修改</ElLink>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="section-header mb-6">
          <el-col :span="12" class="user-item">
            <div class="user-item__label">微信：</div>
            <div class="user-item__value">{{ userData.wx || '未绑定' }}</div>
            <ElLink v-if="userData.wx" type="primary" @click="unbindWx">解绑</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindWx = true">绑定</ElLink>
          </el-col>
          <el-col :span="12" class="user-item">
            <div class="user-item__label">邮箱：</div>
            <div class="user-item__value">{{ userData.email || '未绑定' }}</div>
            <ElLink v-if="userData.email" type="primary" @click="dialogObj.editEmail = true">修改</ElLink>
            <ElLink v-else type="primary" @click="dialogObj.bindEmail = true">绑定</ElLink>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="mt-12 fs-7">企业信息</div>
    <ElDivider class="my-6"></ElDivider>
    <div>
      <div>
        <el-row :gutter="40" class="section-header mb-6">
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">公司名称：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.name || '未填写' }}</div>
            <ElInput v-else v-model="enForm.name" class="enterprise-item__value"></ElInput>
          </el-col>
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">公司官网：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.website || '未填写' }}</div>
            <ElInput v-else v-model="enForm.website" class="enterprise-item__value"></ElInput>
          </el-col>
        </el-row>
        <el-row :gutter="40" class="section-header mb-6">
          <el-col :span="12" class="enterprise-item">
            <div class="enterprise-item__label">所属行业：</div>
            <div v-if="!isEdit" class="enterprise-item__value">{{ enData.in || '未填写' }}</div>
            <ElInput v-else v-model="enForm.in" class="enterprise-item__value"></ElInput>
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
          <VButton type="text" @click="saveEnData(arguments[0])">保存</VButton>
        </template>
      </div>
    </div>
    <!--  上传头像  -->
    <ElDialog
      width="435px"
      append-to-body
      title="上传头像"
      :close-on-click-modal="true"
      :visible.sync="dialogObj.avatar"
    >
      <div class="text-center">
        <!--        <img :src="imageUrl" alt="" style="width: 100px" />-->
        <ElUpload
          class="avatar-uploader"
          action="tm/api/user/upload"
          accept="image/*"
          ref="avatarUploader"
          :show-file-list="false"
          :on-error="handleAvatarError"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <div class="my-4 font-color-main">支持JPG、PNG和GIF格式，图片大小需在500KB以内</div>
          <VButton type="primary">上传头像</VButton>
        </ElUpload>
      </div>
      <div class="mt-6 text-center">
        <VButton @click="dialogObj.avatar = true">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="!imageUrl" @click="avatarConfirm(arguments[0])">{{
          $t('dataVerify.confirm')
        }}</VButton>
      </div>
    </ElDialog>
    <!--  密码  -->
    <ElDialog
      width="435px"
      append-to-body
      title="修改密码"
      label-width="120px"
      :close-on-click-modal="false"
      :visible.sync="dialogObj.password"
    >
      <ElForm :model="passwordForm" label-width="120px" @submit.native.prevent>
        <ElFormItem prop="current" label="当前密码：">
          <ElInput v-model="passwordForm.current" placeholder="请输入当前密码" maxlength="50" show-password></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="新密码：">
          <ElInput v-model="passwordForm.newPassword" placeholder="请输入新密码" maxlength="50" show-password></ElInput>
        </ElFormItem>
        <ElFormItem prop="newAgainPassword" label="确认密码：">
          <ElInput
            v-model="passwordForm.newAgainPassword"
            placeholder="请输入新密码"
            maxlength="50"
            show-password
          ></ElInput>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.password = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" @click="passwordConfirm(arguments[0])" @>{{ $t('dataVerify.confirm') }}</VButton>
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
        <ElFormItem prop="newPassword" label="旧手机验证码：" class="inline-form-item">
          <ElInput v-model="phoneForm.oldCode" placeholder="请输入手机验证码" maxlength="50"></ElInput>
          <VerificationCode
            :remote-method="bindPhoneSendCode"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.bindPhone = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="!phoneForm.oldCode" @click="bindPhoneConfirm(arguments[0])">{{
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
          <ElInput v-model="phoneForm.current" placeholder="请输入当前手机" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="newPassword" label="旧手机验证码：" class="inline-form-item">
          <ElInput v-model="phoneForm.oldCode" placeholder="请输入旧手机验证码" maxlength="50"></ElInput>
          <VerificationCode
            :remote-method="editPhoneOldSendCode"
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
            :remote-method="editPhoneNewSendCode"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.editPhone = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="editPhoneDisabled()" @click="editPhoneConfirm(arguments[0])">{{
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
            :remote-method="bindEmailSendCode"
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
          <ElInput v-model="emailForm.email" placeholder="请输入邮箱" maxlength="50"></ElInput>
        </ElFormItem>
        <ElFormItem prop="code" label="当前邮箱验证码：" class="inline-form-item">
          <ElInput v-model="emailForm.code" placeholder="请输入验证码" maxlength="50"></ElInput>
          <VerificationCode
            :remote-method="editEmailOldSendCode"
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
            :remote-method="editEmailNewSendCode"
            :style="{ width: '120px', textAlign: 'center' }"
            class="ml-6"
            type="text"
          ></VerificationCode>
        </ElFormItem>
      </ElForm>

      <span slot="footer" class="dialog-footer">
        <VButton @click="dialogObj.editEmail = false">{{ $t('dataVerify.cancel') }}</VButton>
        <VButton type="primary" :disabled="editEmailDisabled()" @click="editEmailConfirm(arguments[0])">{{
          $t('dataVerify.confirm')
        }}</VButton>
      </span>
    </ElDialog>
  </div>
</template>

<script>
import InlineInput from '@/components/InlineInput'
import VerificationCode from '@/components/VerificationCode'
export default {
  name: 'Center',
  components: { InlineInput, VerificationCode },
  data() {
    return {
      userData: {
        username: '',
        nickname: '',
        avatar: '',
        phone: '',
        wx: '',
        email: ''
      },
      nameForm: {
        nickname: ''
      },
      imageUrl: '',
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
        current: '',
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
        name: '',
        website: '',
        in: '',
        city: ''
      },
      enForm: {
        name: '',
        website: '',
        in: '',
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
      // window.__USER_INFO__
      // if (isEmpty(this.userData)) {
      //   // this.userData = window.__USER_INFO__
      //
      // }
      let { userData, nameForm, phoneForm, wxForm, emailForm } = this
      for (let key in userData) {
        userData[key] = window.__USER_INFO__[key]
      }
      this.resetPhoneForm()
      this.resetEmailForm()
      nameForm.nickname = userData.nickname
    },
    resetPhoneForm() {
      let { userData, phoneForm } = this
      for (let key in phoneForm) {
        if (key === 'current') {
          this.phoneForm.current = userData.phone
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
    updateName() {
      let { nickname } = this.nameForm
      this.$axios
        .patch('tm/api/user', {
          nickname
        })
        .then(() => {
          this.userData.nickname = nickname
          this.$message.success('修改昵称成功')
        })
    },
    handleAvatarError(res, file) {
      console.log('handleAvatarError', res, file)
      // this.imageUrl = URL.createObjectURL(file.raw)
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type.indexOf('image/') > -1
      const isLt2M = file.size / 1024 / 1024 < 2
      const leftThan = file.size / 1024 < 500

      if (!isJPG) {
        this.$message.error('上传头像只能图片格式!')
      }
      if (!leftThan) {
        this.$message.error('上传头像图片大小不能超过 500KB!')
      }
      return isJPG && isLt2M
    },
    avatarConfirm(resetLoading) {
      const avatar = this.imageUrl.toString('base64')
      this.$axios
        .patch('tm/api/user', {
          avatar
        })
        .then(() => {
          this.$message.success('修改头像成功')
          this.userData.avatar = avatar
          this.dialogObj.avatar = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    editPassword() {
      this.dialogObj.password = true
    },
    passwordConfirm(resetLoading) {
      let { passwordForm } = this
      this.$axios
        .patch('tm/api/user', {
          current: passwordForm.current,
          newPassword: passwordForm.newPassword,
          newAgainPassword: passwordForm.newAgainPassword
        })
        .then(() => {
          this.$message.success('修改密码成功')
          this.dialogObj.password = false
        })
        .finally(() => {
          resetLoading?.()
        })
    },
    bindPhoneSendCode() {
      return this.$axios.get('tm/api/user/sendCode')
    },
    bindPhoneConfirm(resetLoading) {
      let { phoneForm } = this
      this.$axios
        .patch('tm/api/user', {
          current: phoneForm.current,
          oldCode: phoneForm.oldCode
        })
        .then(() => {
          this.userData.phone = phoneForm.current
          this.resetPhoneForm()
          this.$message.success('绑定手机成功')
          this.dialogObj.bindPhone = false
        })
        .finally(() => {
          resetLoading?.()
        })
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
        .patch('tm/api/user', {
          current: phoneForm.current,
          oldCode: phoneForm.oldCode,
          newPhone: phoneForm.newPhone,
          newCode: phoneForm.newCode
        })
        .then(() => {
          this.userData.phone = phoneForm.newPhone
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
        .patch('tm/api/user', {
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
    editEmailOldSendCode() {
      return this.$axios.get('tm/api/user/sendCode')
    },
    editEmailNewSendCode() {
      return this.$axios.get('tm/api/user/sendCode')
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
        .patch('tm/api/user', {
          email: emailForm.email,
          code: emailForm.code,
          newEmail: emailForm.newEmail,
          newCode: emailForm.newCode
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
        .patch('tm/api/user/enterprise', {
          name: enForm.name,
          website: enForm.website,
          in: enForm.in,
          city: enForm.city
        })
        .then(() => {
          this.$message.success('修改密码成功')
          this.enData = Object.assign({}, enForm)
          this.isEdit = false
        })
        .finally(() => {
          resetLoading?.()
        })
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

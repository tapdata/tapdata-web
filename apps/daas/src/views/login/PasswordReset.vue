<template>
  <LoginPage>
    <section class="page-registry" slot="main">
      <div class="sign-in-panel">
        <div class="title">{{ $t('app.signIn.modifyPassword') }}</div>
        <div class="tip">
          {{ $t('app.signIn.newPasswordTip') }}
        </div>
        <div class="error-tips" v-show="errorMessage">
          <i class="el-icon-warning-outline"></i>
          {{ errorMessage }}
        </div>
        <el-form ref="form" :model="form" :rules="rules">
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              autocomplete="username"
              type="email"
              :placeholder="$t('app.signIn.email_placeholder')"
            ></el-input>
          </el-form-item>
          <el-form-item prop="newPassword">
            <el-input
              v-model="form.newPassword"
              autocomplete="current-password"
              :type="passwordType"
              :placeholder="$t('app.signIn.newpassword_placeholder')"
              @keyup.13="submit"
            >
              <i
                slot="suffix"
                :class="[flag ? 'icon-openeye' : 'icon-closeeye', 'iconfont']"
                style="margin-top: 8px; font-size: 18px; cursor: pointer"
                autocomplete="auto"
                @click="passwordTypeChange"
              />
            </el-input>
          </el-form-item>
          <el-form-item prop="validateCode">
            <el-row :gutter="10">
              <el-col :span="17">
                <el-input
                  v-model="form.validateCode"
                  type="text"
                  maxlength="6"
                  :placeholder="$t('signin_verify_code')"
                ></el-input>
              </el-col>
              <el-col :span="7">
                <ElButton @click="handleSendCode">{{ $t('signin_code') }}</ElButton>
              </el-col>
            </el-row>
          </el-form-item>
          <ElButton class="btn-sign-in" type="primary" size="medium" :loading="loading" @click="submit">
            {{ $t('app.signIn.nextStep') }}
          </ElButton>
        </el-form>
        <div class="back-login">
          {{ $t('app.signIn.rememberPasswords') }}
          <ElButton type="text" @click="backLogin">{{ $t('app.signIn.backLogin') }}</ElButton>
        </div>
      </div>
    </section>
  </LoginPage>
</template>

<script>
import { usersApi } from '@tap/api'
import LoginPage from './LoginPage'
export default {
  name: 'SignIn',
  components: { LoginPage },
  data() {
    return {
      loading: false,
      form: {
        email: '',
        newPassword: '',
        validateCode: '',
        location_origin: window.location.origin
      },
      errorMessage: '',
      flag: false,
      passwordType: 'password',
      rules: {
        email: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error(this.$t('signin_email_require')))
                // eslint-disable-next-line
              } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
                callback(new Error(this.$t('signin_verify_email_invalid')))
              } else {
                callback()
              }
            }
          }
        ],
        newPassword: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value || value.length < 5) {
                callback(new Error(this.$t('signin_verify_password_invalid')))
              } else if (/[\s\u4E00-\u9FA5]/.test(value)) {
                callback(new Error(this.$t('signin_verify_password_notCN')))
              } else {
                callback()
              }
            }
          }
        ],
        validateCode: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error(this.$t('signin_verify_code_not_empty')))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },

  methods: {
    passwordTypeChange() {
      this.flag = !this.flag
      this.passwordType = this.flag ? 'text' : 'password'
    },
    submit() {
      // let form = this.form
      // let message = ''
      // if (!form.email || !form.email.trim()) {
      //   message = this.$t('signin_email_require')
      // } else if (
      //   // eslint-disable-next-line
      //   !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)
      // ) {
      //   message = this.$t('signin_verify_email_invalid')
      // } else if (!form.newPassword || form.newPassword.length < 5) {
      //   message = this.$t('signin_verify_password_invalid')
      //   // eslint-disable-next-line
      // } else if (/[\s\u4E00-\u9FA5]/.test(form.newPassword)) {
      //   message = this.$t('signin_verify_password_notCN')
      // } else if (!form.validateCode) {
      //   message = this.$t('signin_verify_code_not_empty')
      // }

      // if (message) {
      //   this.errorMessage = message
      //   return
      // }
      this.$refs.form.validate(async valid => {
        if (valid) {
          this.loading = true

          usersApi
            .reset(this.form)
            .then(res => {
              if (res) {
                this.$router.push({
                  name: 'verificationEmail',
                  params: { first: 1, data: this.form, type: 'reset' }
                })
              }
            })
            .catch(e => {
              if (e?.data?.message) {
                if (e.data.message === '找不到电子邮件') {
                  this.errorMessage = this.$t('signin_not_mailbox')
                } else if (e.data.message === '尚未验证电子邮件') {
                  this.errorMessage = this.$t('signin_verify_email_invalid')
                } else if (e.data.message.includes('Incorect')) {
                  this.errorMessage = this.$t('signin_verify_code_not_incorrect')
                } else {
                  this.errorMessage = e.data.message
                }
              }
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          return false
        }
      })
      this.loading = false
    },

    // 发送验证码
    handleSendCode() {
      let form = this.form
      let message = ''
      if (!form.email || !form.email.trim()) {
        message = this.$t('signin_email_require')
      } else if (
        // eslint-disable-next-line
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)
      ) {
        message = this.$t('signin_email_invalid')
      }
      if (message) {
        this.errorMessage = message
        return
      }
      let params = {
        email: this.form.email
      }
      usersApi.sendValidateCode(params).then(res => {
        if (res) {
          this.$message.success(this.$t('signin_verify_code_success'))
        }
      })
      // .catch(() => {
      //   this.$message.error(this.$t('signin_verify_code_error'))
      // })
    },

    // 跳转登录
    backLogin() {
      this.$router.replace({
        name: 'login',
        query: { email: this.form.email }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-registry {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  .sign-in-panel {
    width: 400px;
    height: 500px;
    margin: auto;
    padding: 25px;

    .title {
      margin-bottom: 30px;
      font-size: 32px;
      font-weight: 600;
      color: map-get($fontColor, dark);
    }
    .tip {
      padding-bottom: 10px;
      font-size: 14px;
      color: map-get($fontColor, slight);
    }
    .error-tips {
      margin-bottom: 22px;
      padding: 0 15px;
      height: 42px;
      line-height: 42px;
      background: rgba(254, 240, 240, 1);
      border: 1px solid rgba(245, 108, 108, 0.44);
      border-radius: 3px;
      font-size: 12px;
      white-space: nowrap;
      color: rgba(245, 108, 108, 1);
    }
    // form {
    // 	border-radius: 4px;
    // 	overflow: hidden;
    // 	// border: 1px solid #dedee4;
    // 	.input {
    // 		// display: block;
    // 		// padding: 15px;
    // 		// width: 100%;
    // 		// height: 44px;
    // 		// color: #606266;
    // 		// line-height: 44px;
    // 		// border-radius: 0;
    // 		// box-sizing: border-box;
    // 		// border: none;
    // 		// outline: none;
    // 		// font-size: 14px;
    // 		// font-family: inherit;
    // 		// &:last-child {
    // 		// 	// border-top: 1px solid #dedee4;
    // 		// }
    // 		// &::placeholder {
    // 		// 	font-size: 14px;
    // 		// 	color: rgba(204, 204, 204, 1);
    // 		// }
    // 	}
    // }
    .keep-sign-in {
      font-size: 14px;
      color: rgba(153, 153, 153, 1);
    }
    .btn-sign-in {
      display: block;
      width: 100%;
      margin-top: 40px;
    }
    .back-login {
      padding-top: 20px;
      font-size: 12px;
      text-align: right;
      color: map-get($fontColor, light);
      user-select: none;
      span {
        color: map-get($color, primary);
        cursor: pointer;
      }
    }
  }
}
</style>

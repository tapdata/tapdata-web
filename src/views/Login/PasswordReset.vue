<template>
  <section class="page-registry">
    <Header></Header>
    <main>
      <div class="body">
        <el-card class="sign-in-panel">
          <div class="title">{{ $t('app.signIn.modifyPassword') }}</div>
          <div class="tip">
            {{ $t('app.signIn.newPasswordTip') }}
          </div>
          <div class="error-tips" v-show="errorMessage">
            <i class="el-icon-warning-outline"></i>
            {{ errorMessage }}
          </div>
          <el-form ref="form" :model="form">
            <el-form-item>
              <el-input
                v-model="form.email"
                autocomplete="username"
                type="email"
                :placeholder="$t('app.signIn.email_placeholder')"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="form.newPassword"
                autocomplete="current-password"
                :type="passwordType"
                :placeholder="$t('app.signIn.newpassword_placeholder')"
                @keyup.enter="submit"
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
            <el-button
              class="btn-sign-in"
              type="primary"
              size="medium"
              :loading="loading"
              @click="submit"
            >
              {{ $t('app.signIn.nextStep') }}
            </el-button>
          </el-form>
          <div class="back-login">
            {{ $t('app.signIn.rememberPasswords') }}
            <span @click="backLogin">{{ $t('app.signIn.backLogin') }}</span>
          </div>
        </el-card>
      </div>
    </main>
  </section>
</template>

<script>
import Header from './component/header'
import factory from '@/api/factory'
const usersModel = factory('users')

export default {
  name: 'SignIn',
  components: { Header },
  data() {
    return {
      loading: false,
      form: {
        email: '',
        newPassword: '',
        location_origin: window.location.origin
      },
      errorMessage: '',
      flag: false,
      passwordType: 'password'
    }
  },

  methods: {
    passwordTypeChange() {
      this.flag = !this.flag
      this.passwordType = this.flag ? 'text' : 'password'
    },
    async submit() {
      let form = this.form
      let message = ''
      if (!form.email || !form.email.trim()) {
        message = this.$t('app.signIn.email_require')
        // eslint-disable-next-line
			} else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)) {
        message = this.$t('app.signIn.email_invalid')
      } else if (!form.newPassword || form.newPassword.length < 5) {
        message = this.$t('app.signIn.password_invalid')
        // eslint-disable-next-line
			} else if (/[\s\u4E00-\u9FA5]/.test(form.newPassword)) {
        message = this.$t('account.passwordNotCN')
      }
      if (message) {
        this.errorMessage = message
        return
      }
      this.loading = true
      try {
        await usersModel.reset(this.form)

        setTimeout(() => {
          this.$router.push({
            name: 'verificationEmail',
            params: { first: 1, data: this.form, type: 'reset' }
          })
        }, 500)
      } catch (e) {
        if (e.response.msg) {
          if (e.response.msg === '找不到电子邮件') {
            this.errorMessage = this.$t('app.signIn.notMailbox')
          } else if (e.response.msg === '尚未验证电子邮件') {
            this.errorMessage = this.$t('app.signIn.email_invalid')
          } else {
            this.errorMessage = e.response.msg
          }
        }
      } finally {
        this.loading = false
      }
    },

    // 跳转登录
    backLogin() {
      this.$router.push({
        path: '/login',
        query: { email: this.form.email }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-registry {
  background: #fafafa;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  main {
    position: relative;
    margin-top: 60px;
    .body {
      margin: 0 auto;
      position: relative;
      height: 600px;
      width: 1400px;
      box-sizing: border-box;
      .carousel {
        position: absolute;
        top: 0;
        left: 80px;
      }
    }
    .sign-in-panel {
      position: absolute;
      top: 60px;
      left: 0;
      right: 0;
      width: 400px;
      margin: auto;
      padding: 25px 5px;

      .title {
        margin-bottom: 30px;
        font-size: 26px;
        font-weight: 500;
        color: rgba(51, 51, 51, 1);
      }
      .tip {
        padding-bottom: 10px;
        font-size: 14px;
        color: #aaa;
      }
      .error-tips {
        margin-bottom: 22px;
        padding: 0 15px;
        height: 42px;
        line-height: 42px;
        background: rgba(254, 240, 240, 1);
        border: 1px solid rgba(245, 108, 108, 0.44);
        border-radius: 3px;
        font-size: 14px;
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
        color: #666;
        user-select: none;
        span {
          color: #48b6e2;
          cursor: pointer;
        }
      }
    }
  }
}
</style>

<template>
  <section class="page-registry">
    <Header></Header>
    <main>
      <div class="body">
        <el-card class="sign-in-panel">
          <div class="title">{{ $t('app.signIn.registry') }}</div>
          <div class="error-tips" v-show="errorMessage">
            <i class="el-icon-warning-outline"></i>
            {{ errorMessage }}
          </div>
          <el-form ref="form" :model="form">
            <el-form-item prop="email">
              <el-input v-model="form.email" type="email" :placeholder="$t('app.signIn.email_placeholder')"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                :type="passwordType"
                :placeholder="$t('app.signIn.password_placeholder')"
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
            <el-form-item prop="inviteCode">
              <el-input
                v-model="form.inviteCode"
                type="text"
                :placeholder="$t('app.signIn.inviteCode_placeholder')"
              ></el-input>
            </el-form-item>
            <el-checkbox class="keep-sign-in" v-model="keepSignIn" style="display: none">
              <span style="color: #999"
                >{{ $t('app.signIn.registry_tip') }} <i>{{ $t('app.signIn.userPplicy') }}</i></span
              >
            </el-checkbox>
            <el-button
              class="btn-sign-in"
              type="primary"
              size="medium"
              :disabled="!keepSignIn"
              :loading="loading"
              @click="submit"
            >
              {{ $t('app.signIn.nextStep') }}
            </el-button>
          </el-form>

          <div class="back-login">
            {{ $t('app.signIn.haveAccpunt') }}
            <span @click="backLogin">{{ $t('app.signIn.backLogin') }}</span>
          </div>
        </el-card>
        <el-card class="qrCode">
          <div class="title">{{ $t('app.signIn.getCode') }}</div>
          <p>{{ $t('app.signIn.qrCodeText') }}</p>
          <div class="imageBox">
            <el-image class="image" :src="require('@/assets/images/tapdateQR.png')" fit="cover"></el-image>
          </div>
        </el-card>
      </div>
    </main>
  </section>
</template>

<script>
// import crypto from 'crypto';
// import CryptoJS from 'crypto-js';
import Header from './Header'
// import _ from 'lodash';

// const Languages = {
// 	sc: '中文 (简)',
// 	en: 'English',
// 	tc: '中文 (繁)'
// };
export default {
  name: 'SignIn',
  components: { Header },
  data() {
    // var userEmail = (rule, value, callback) => {
    // 	// eslint-disable-next-line
    // 	const mailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // 	if (!value) {
    // 		return callback(new Error(this.$t('app.signIn.email_null')));
    // 	}
    // 	setTimeout(() => {
    // 		if (mailReg.test(value)) {
    // 			callback();
    // 		} else {
    // 			callback(new Error(this.$t('app.signIn.email_invalid')));
    // 		}
    // 	}, 100);
    // };
    // var validatePass = (rule, value, callback) => {
    // 	if (!value || value.length < 5) {
    // 		callback(new Error(this.$t('app.signIn.password_invalid')));
    // 	}
    // };
    return {
      // originUrl: window.location.origin,
      loading: false,
      form: {
        email: '',
        password: '',
        emailVerified: true,
        role: 0
      },
      errorMessage: '',
      keepSignIn: true,
      passwordType: 'password',
      flag: false
      // rules: {
      // 	email: [{ validator: userEmail, trigger: 'blur' }],
      // 	password: [{ validator: validatePass, trigger: 'blur' }]
      // }
    }
  },

  methods: {
    passwordTypeChange() {
      this.flag = !this.flag
      this.passwordType = this.flag ? 'text' : 'password'
    },
    async submit() {
      let form = this.form
      form.source = 'registration'
      let message = ''
      if (!form.email || !form.email.trim()) {
        message = this.$t('app.signIn.email_require')
        // eslint-disable-next-line
      } else if (!form.inviteCode) {
        message = this.$t('app.signIn.inviteCode_require')
      } else if (
        // eslint-disable-next-line
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)
      ) {
        message = this.$t('app.signIn.email_invalid')
      } else if (!form.password || form.password.length < 5) {
        message = this.$t('app.signIn.password_invalid')
        // eslint-disable-next-line
      } else if (/[\s\u4E00-\u9FA5]/.test(form.password)) {
        message = this.$t('account.passwordNotCN')
      } else {
        message = ''
      }
      if (message) {
        this.errorMessage = message
        return
      }
      if (!this.keepSignIn) {
        this.$t('app.signIn.userPplicy_message')
        return
      }

      this.loading = true
      try {
        let usersModel = this.$api('users')

        this.$cookie.set('location_origin', window.location.origin)

        let { data } = await usersModel.post(this.form)
        if (data.textStatus === 'DISABLE_SIGNUP') {
          this.errorMessage = data.textStatus
          return
        }
        this.$cookie.set('user_id', data.id)
        this.$router.replace({
          name: 'verificationEmail',
          params: { data: this.form }
        })
      } catch (e) {
        if (e.response && e.response.msg) {
          if (e.response.msg.indexOf('Email already exists') !== -1) {
            this.errorMessage = this.$t('app.signIn.hasMailbox')
          }
          if (e.response.msg.indexOf('Invite Code Invalid') !== -1) {
            this.errorMessage = this.$t('app.signIn.inviteCode_invalid')
          } else if (e.response.msg.indexOf('Disable Signup') !== -1) {
            this.errorMessage = this.$t('app.signIn.disableSignup')
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
  background: #fafafa;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  header {
    padding: 70px 80px 0 80px;
    margin: 0 auto;
    user-select: none;
    min-width: 1400px;
    box-sizing: border-box;
    .logo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      img {
        display: block;
        width: 144px;
      }
      .switch-lang {
        color: #dedee4;
        font-size: 16px;
        span {
          display: inline-block;
          padding: 0 10px;
          border-left: 1px solid #333333;
          box-sizing: border-box;
          height: 18px;
          line-height: 18px;
          cursor: pointer;
          &:first-child {
            border: none;
          }
          &:hover {
            color: map-get($fontColor, dark);
          }
        }
        .bold {
          color: map-get($fontColor, dark);
          font-weight: 500;
        }
      }
    }
    .slogan {
      margin-top: 8px;
      height: 15px;
      line-height: 15px;
      font-size: 14px;
      color: rgba(153, 153, 153, 1);
    }
  }
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
      .error-tips {
        margin-bottom: 22px;
        padding: 0 15px;
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
      // 	border: 1px solid #dedee4;
      // 	.input {
      // 		display: block;
      // 		padding: 15px;
      // 		width: 100%;
      // 		height: 44px;
      // 		color: #606266;
      // 		line-height: 44px;
      // 		border-radius: 0;
      // 		box-sizing: border-box;
      // 		border: none;
      // 		outline: none;
      // 		font-size: 14px;
      // 		font-family: inherit;
      // 		&:last-child {
      // 			border-top: 1px solid #dedee4;
      // 		}
      // 		&::placeholder {
      // 			font-size: 14px;
      // 			color: rgba(204, 204, 204, 1);
      // 		}
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
          color: #409eff;
          cursor: pointer;
        }
      }
    }
    .qrCode {
      position: absolute;
      top: 60px;
      right: 20px;
      width: 400px;
      padding: 25px 5px;
      box-sizing: border-box;
      div.title {
        padding-bottom: 30px;
        font-size: 26px;
        font-weight: 500;
        color: map-get($fontColor, dark);
      }
      p {
        font-size: 12px;
      }
      .imageBox {
        padding: 40px 0 15px;
        text-align: center;
        .image {
          width: 200px;
          height: 200px;
          text-align: center;
        }
      }
    }
  }
}
</style>

<template>
  <LoginPage>
    <section class="page-sign-in" slot="main">
      <div class="sign-in-panel">
        <div class="title">
          {{ $t('app.signIn.signIn') }}
          <span v-if="$getSettingByKey('SHOW_REGISTER')" @click="registry">{{ $t('app.signIn.Registration') }}</span>
        </div>
        <div class="error-tips" v-show="errorMessage">
          <i class="el-icon-warning-outline"></i>
          {{ errorMessage }}
        </div>
        <form>
          <input
            class="input"
            type="email"
            autocomplete="username"
            :placeholder="$t('app.signIn.email_placeholder')"
            v-model="form.email"
          />
          <input
            class="input"
            type="password"
            autocomplete="current-password"
            :placeholder="$t('app.signIn.password_placeholder')"
            v-model="form.password"
            @keyup.13="submit"
          />
        </form>
        <el-checkbox class="keep-sign-in" v-model="keepSignIn">
          {{ $t('app.signIn.keepSignIn') }}
        </el-checkbox>
        <ElButton class="btn-sign-in" type="primary" size="medium" :loading="loading" @click="submit">
          {{ $t('app.signIn.signIn') }}
        </ElButton>

        <div class="remember">
          <ElButton type="text" @click="forgetPassword">{{ $t('app.signIn.forgetPassword') }}</ElButton>
        </div>
      </div>
    </section>
  </LoginPage>
</template>

<script>
import cryptoJS from 'crypto-js'
import LoginPage from './LoginPage'
import Cookie from '@tap/shared/src/cookie'
import { usersApi, timeStampApi } from '@tap/api'
import { configUser } from '@/utils/util'

export default {
  name: 'SignIn',
  components: { LoginPage },
  data() {
    return {
      loading: false,
      form: {
        email: '',
        password: ''
      },
      keepSignIn: true,
      errorMessage: ''
    }
  },
  created() {
    if (this.$route.query) {
      this.form.email = this.$route.query.email
    }
  },
  methods: {
    async submit() {
      let form = this.form
      let oldPassword = this.form.password + ''
      let message = ''
      if (!form.email || !form.email.trim()) {
        message = this.$t('app.signIn.email_require')
      } else if (
        // eslint-disable-next-line
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)
      ) {
        message = this.$t('app.signIn.email_invalid')
      } else if (!form.password || form.password.length < 5) {
        message = this.$t('app.signIn.password_invalid')
      }
      if (message) {
        this.errorMessage = message
        return
      }
      this.loading = true
      try {
        //登陆密码加密
        let timeStampData = await timeStampApi.get()
        this.form['stime'] = timeStampData.data
        this.form.password = cryptoJS.RC4.encrypt(this.form.password, 'Gotapd8').toString()
        let Str = this.form.email + this.form.password + this.form.stime + 'Gotapd8'
        this.form['sign'] = cryptoJS.SHA1(Str).toString().toUpperCase()

        let data = await usersApi.login(this.form)
        Cookie.set('token', data?.id)
        // eslint-disable-next-line
        console.log('登录成功：', data)

        let user = await usersApi.getInfo()
        configUser(user)
        let lastLocationHref = sessionStorage.getItem('lastLocationHref')
        if (lastLocationHref) {
          location.href = lastLocationHref.includes('login') ? location.href.split('#')[0] : lastLocationHref
          setTimeout(() => {
            sessionStorage.removeItem('lastLocationHref')
          }, 50)
        } else {
          this.$router.push({
            name: 'dashboard'
          })
        }
      } catch (e) {
        this.loading = false
        this.form.password = oldPassword
      }
    },
    // 注册账号
    registry() {
      this.$router.push({
        name: 'registry'
      })
    },

    // 忘记密码
    forgetPassword() {
      this.$router.push({ name: 'passwordReset' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-sign-in {
  display: flex;
  align-items: center;
  justify-content: center;
  // background: map-get($bgColor, normal);
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  .sign-in-panel {
    padding: 25px;
    width: 400px;
    height: 500px;
    margin: auto;
    .title {
      margin-bottom: 30px;
      font-size: 32px;
      font-weight: 600;
      color: map-get($fontColor, dark);
      span {
        float: right;
        padding-top: 16px;
        font-size: 12px;
        text-align: right;
        color: map-get($color, primary);
        cursor: pointer;
      }
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
    form {
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #dedee4;
      .input {
        display: block;
        padding-left: 15px;
        width: 100%;
        height: 44px;
        color: map-get($fontColor, light);
        line-height: 44px;
        border-radius: 0;
        box-sizing: border-box;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        &:last-child {
          border-top: 1px solid #dedee4;
        }
        &::placeholder {
          font-weight: 400;
          font-size: 14px;
          color: map-get($fontColor, slight);
        }
      }
    }
    .keep-sign-in {
      margin-top: 15px;
      font-size: 14px;
      color: rgba(153, 153, 153, 1);
    }
    .btn-sign-in {
      display: block;
      width: 100%;
      margin-top: 50px;
    }
    ::v-deep {
      .el-checkbox__label {
        color: map-get($fontColor, light);
      }
    }
    .remember {
      padding-top: 16px;
      font-size: 12px;
      color: map-get($color, primary);
      span {
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>

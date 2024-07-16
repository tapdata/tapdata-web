<template>
  <div class="page flex-column position-relative">
    <div class="login-top flex align-center px-8 w-100 bg-white position-fixed top-0 start-0">
      <span>联系方式：4008-672-818</span>
    </div>

    <div class="login-main flex flex-1 min-h-0 justify-center align-center">
      <div class="login-form-wrapper flex rounded-lg overflow-hidden">
        <div class="login-form-left flex justify-center align-center flex-1 p-6 position-relative">
          <img src="../images/logo.png" alt="logo" class="login-logo position-absolute" />
          <div class="color-white text-lg">欢迎使用</div>
        </div>
        <div class="login-form-main flex-1 p-6 bg-white">
          <div class="fs-5 mb-12 text-center color-primary fw-sub">数据库应用双活管理平台</div>
          <el-form :model="form" size="large">
            <el-form-item>
              <el-input v-model="form.email" prefix-icon="el-icon-user" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input
                v-model="form.password"
                prefix-icon="el-icon-lock"
                placeholder="请输入密码"
                type="password"
                @keyup.enter="submit"
              ></el-input>
            </el-form-item>
            <el-checkbox class="keep-sign-in" v-model="keepSignIn">
              {{ $t('app_signIn_keepSignIn') }}
            </el-checkbox>
          </el-form>

          <ElButton class="w-100 mt-6 mb-8" type="primary" size="large" :loading="loading" @click="submit">
            {{ $t('app_signIn_signIn') }}
          </ElButton>
        </div>
      </div>
    </div>

    <img src="../images/login_bg.png" class="login-bg position-absolute" />
  </div>
</template>
<script>
import i18n from '@/i18n'

import cryptoJS from 'crypto-js'
import Cookie from '@tap/shared/src/cookie'
import { usersApi, timeStampApi } from '@tap/api'
import { configUser } from '@/utils/util'

export default {
  name: 'Login',
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

  computed: {
    loginImageStyle() {
      return {
        background: `url('${window._TAPDATA_OPTIONS_.loginUrl}') left 0 no-repeat`,
        backgroundSize: window._TAPDATA_OPTIONS_.loginSize || 'cover'
      }
    }
  },

  methods: {
    async submit() {
      let form = { ...this.form }
      let oldPassword = form.password
      let message = ''

      if (!form.email || !form.email.trim()) {
        message = this.$t('app_signIn_email_require')
      } else if (
        // eslint-disable-next-line
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email)
      ) {
        if (form.email === 'admin') {
          form.email += '@admin.com'
        } else {
          message = this.$t('app_signIn_email_invalid')
        }
      } else if (!form.password || form.password.length < 5) {
        message = this.$t('app_signIn_password_invalid')
      }
      if (message) {
        this.errorMessage = message
        this.$message.error(message)
        return
      }
      this.loading = true
      try {
        //登陆密码加密
        let timeStampData = await timeStampApi.get()
        form['stime'] = timeStampData.data
        form.password = cryptoJS.RC4.encrypt(this.form.password, 'Gotapd8').toString()
        let Str = form.email + form.password + form.stime + 'Gotapd8'
        form['sign'] = cryptoJS.SHA1(Str).toString().toUpperCase()

        let data = await usersApi.login(form)
        Cookie.set('access_token', data?.id)
        Cookie.set('tem_token', data?.id)
        // eslint-disable-next-line
        console.log(i18n.t('daas_login_login_dengluchenggong'), data)

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
    }
  }
}
</script>
<style scoped lang="scss">
.login-top {
  height: 52px;
}
.login-logo {
  width: auto;
  height: 32px;
  left: 24px;
  top: 24px;
}
.page {
  display: flex;
  flex-direction: row;
  min-width: 1440px;
  height: 100%;

  background: linear-gradient(180deg, #eeeeee 0%, rgba(238, 238, 238, 0) 100%);

  .login-form-wrapper {
    width: 640px;
    box-shadow: 0 5px 15px 0 #0000001a;
  }

  .login-form-left {
    background-color: #c95252;
  }

  .login-bg {
    left: 0;
    bottom: 0;
    max-width: 100%;
    height: auto;
    z-index: -1;
  }

  .page-image {
    flex: 1;
    background-size: cover;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .page-main {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: map-get($bgColor, white);
    .page-main-box {
      display: flex;
      flex-direction: column;
      width: 500px;
      height: 100%;
    }
    .switch-lang {
      padding-top: 50px;
      text-align: right;
      color: map-get($fontColor, slight);
      font-weight: 500;
      font-size: 14px;
      span {
        display: inline-block;
        box-sizing: border-box;
        height: 18px;
        line-height: 18px;
        cursor: pointer;
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
}
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
        border-left: 1px solid map-get($fontColor, dark);
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
</style>

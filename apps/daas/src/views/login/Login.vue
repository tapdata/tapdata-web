<script>
import {
  checkLdapLoginEnable,
  fetchTimestamp,
  getUserInfoByToken,
  login,
} from '@tap/api'
import Cookie from '@tap/shared/src/cookie'
import { getSettingByKey } from '@tap/shared/src/settings'
import { useDark } from '@vueuse/core'
import cryptoJS from 'crypto-js'
import { configUser } from '@/utils/util'
import LoginPage from './LoginPage.vue'

export default {
  name: 'SignIn',
  components: {
    LoginPage,
  },
  data() {
    return {
      loading: false,
      form: {
        email: '',
        password: '',
      },
      keepSignIn: true,
      errorMessage: '',
      adEnable: false,
    }
  },
  created() {
    useDark()
    this.loadAdEnable()
    if (this.$route.query) {
      this.form.email = this.$route.query.email
    }
  },
  methods: {
    getSettingByKey,
    async loadAdEnable() {
      const data = await checkLdapLoginEnable()
      this.adEnable = data
    },
    async submit() {
      const form = this.form
      const oldPassword = String(this.form.password)
      let message = ''
      if (!form.email || !form.email.trim()) {
        message = this.$t(
          this.adEnable
            ? 'login_email_and_ad_placeholder'
            : 'app_signIn_email_require',
        )
      } else if (
        // eslint-disable-next-line
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email) &&
        !this.adEnable
      ) {
        message = this.$t('app_signIn_email_invalid')
      } else if (!form.password || form.password.length < 5) {
        message = this.$t('app_signIn_password_invalid')
      }
      if (message) {
        this.errorMessage = message
        return
      }
      this.loading = true
      try {
        //登陆密码加密
        const timeStampData = await fetchTimestamp()
        this.form.stime = timeStampData.data
        this.form.password = cryptoJS.RC4.encrypt(
          this.form.password,
          'Gotapd8',
        ).toString()
        const Str = `${this.form.email + this.form.password + this.form.stime}Gotapd8`
        this.form.sign = cryptoJS.SHA1(Str).toString().toUpperCase()

        const data = await login(this.form)
        Cookie.set('access_token', data?.id)
        Cookie.set('tem_token', data?.id)

        await this.$store.dispatch('feature/getFeatures')

        const user = await getUserInfoByToken()
        configUser(user)
        const lastLocationHref = sessionStorage.getItem('lastLocationHref')
        if (lastLocationHref) {
          location.href = lastLocationHref.includes('login')
            ? location.href.split('#')[0]
            : lastLocationHref
          setTimeout(() => {
            sessionStorage.removeItem('lastLocationHref')
          }, 50)
        } else {
          this.$router.push({
            name: 'dashboard',
          })
        }
      } catch (error) {
        this.loading = false
        this.form.password = oldPassword
        this.errorMessage = error?.data?.message || error?.message
      }
    },
    // 注册账号
    registry() {
      this.$router.push({
        name: 'registry',
      })
    },

    // 忘记密码
    forgetPassword() {
      this.$router.push({ name: 'passwordReset' })
    },
  },
}
</script>

<template>
  <LoginPage>
    <template #main>
      <section class="page-sign-in">
        <div class="sign-in-panel">
          <div class="title">
            {{ $t('app_signIn_signIn') }}
            <span v-if="getSettingByKey('SHOW_REGISTER')" @click="registry">{{
              $t('app_signIn_Registration')
            }}</span>
          </div>
          <el-alert
            v-if="!!errorMessage"
            class="mb-5"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
          <form class="rounded-lg">
            <input
              v-model="form.email"
              class="input"
              type="email"
              autocomplete="username"
              :placeholder="
                $t(
                  adEnable
                    ? 'login_email_and_ad_placeholder'
                    : 'app_signIn_email_placeholder',
                )
              "
            />
            <input
              v-model="form.password"
              class="input"
              type="password"
              autocomplete="current-password"
              :placeholder="$t('app_signIn_password_placeholder')"
              @keyup.enter="submit"
            />
          </form>
          <el-checkbox v-model="keepSignIn" class="keep-sign-in">
            {{ $t('app_signIn_keepSignIn') }}
          </el-checkbox>
          <ElButton
            id="login-button"
            class="mt-12 w-100"
            size="large"
            type="primary"
            :loading="loading"
            @click="submit"
          >
            {{ $t('app_signIn_signIn') }}
          </ElButton>

          <div class="remember">
            <ElButton text @click="forgetPassword">{{
              $t('app_signIn_forgetPassword')
            }}</ElButton>
          </div>
        </div>
      </section>
    </template>
  </LoginPage>
</template>

<style lang="scss" scoped>
.page-sign-in {
  display: flex;
  align-items: center;
  justify-content: center; /*// background: var(--bg-normal);*/
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
      color: var(--text-dark);
      span {
        float: right;
        padding-top: 16px;
        font-size: 12px;
        text-align: right;
        color: var(--color-primary);
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
      border: 1px solid var(--el-border-color);
      .input {
        display: block;
        padding-left: 15px;
        width: 100%;
        height: 44px;
        color: var(--text-light);
        line-height: 44px;
        border-radius: 0;
        box-sizing: border-box;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        &:last-child {
          border-top: 1px solid var(--el-border-color);
        }
        &::placeholder {
          font-weight: 400;
          font-size: 14px;
          color: var(--text-slight);
        }
      }
    }
    .keep-sign-in {
      margin-top: 15px;
      font-size: 14px;
      color: rgba(153, 153, 153, 1);
    }

    :deep(.el-checkbox__label) {
      color: var(--text-light);
    }

    .remember {
      padding-top: 16px;
      font-size: 12px;
      color: var(--color-primary);
      span {
        cursor: pointer;
        user-select: none;
      }
    }
  }
}
</style>

<script>
import { fetchSettings } from '@tap/api/core/settings'
import { checkSamlLoginEnable, getSamlLoginUrl } from '@tap/api/src/core/sso'
import { fetchTimestamp } from '@tap/api/src/core/timestamp'
import {
  checkLdapLoginEnable,
  getUserInfoByToken,
  login,
} from '@tap/api/src/core/users'
import Cookie from '@tap/shared/src/cookie'
import { setSettings } from '@tap/shared/src/settings'
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
      samlEnable: false,
      samlChecking: true,
      samlRedirecting: false,
    }
  },
  created() {
    useDark()
    this.loadAdEnable()
    if (this.$route.query) {
      this.form.email = this.$route.query.email
      const ssoError = this.$route.query.sso_error
      if (ssoError) {
        this.errorMessage = this.getSsoErrorMessage(ssoError)
      }
    }
  },
  mounted() {
    // Wait until the login route has finished mounting before starting the
    // browser redirect. This keeps the automatic flow aligned with the
    // existing button flow and avoids navigating during router resolution.
    this.loadSamlEnable()
  },
  methods: {
    getSsoErrorMessage(code) {
      const messages = {
        user_disabled: 'app_signIn_ssoUserDisabled',
        user_pending: 'app_signIn_ssoUserPending',
        user_not_found: 'app_signIn_ssoUserNotFound',
        sso_failed: 'app_signIn_ssoFailed',
      }
      return this.$t(messages[code] || messages.sso_failed)
    },
    async loadAdEnable() {
      const data = await checkLdapLoginEnable()
      this.adEnable = data
    },
    async loadSamlEnable() {
      try {
        this.samlEnable = await checkSamlLoginEnable()
        if (this.samlEnable && this.shouldRedirectToSaml()) {
          this.samlRedirecting = true
          this.loginWithSaml()
          return
        }
      } catch {
        this.samlEnable = false
      } finally {
        if (!this.samlRedirecting) {
          this.samlChecking = false
        }
      }
    },
    shouldRedirectToSaml() {
      const routeQuery = this.$route.query || {}
      const ssoError = routeQuery.sso_error

      // sso=1 is used to bring an admin to the login page. It must not start
      // an IdP redirect automatically; the SSO button remains available there.
      if (sessionStorage.getItem('samlManualLogin') === '1') {
        sessionStorage.removeItem('samlManualLogin')
        return false
      }

      // Keep the login page visible after an SSO failure so the user can read
      // the error and use the original password login flow if needed.
      if (ssoError) {
        return false
      }

      return true
    },
    loginWithSaml() {
      // Full browser navigation so the IdP redirect chain runs in the tab.
      window.location.href = getSamlLoginUrl()
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

        const settings = await fetchSettings()
        setSettings(settings)

        await this.$store.dispatch('feature/getFeatures')

        if (settings.length) {
          localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(settings))
          this.$store.commit('setAppearanceBySetting', settings)
        }

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
        this.errorMessage = error?.message
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
      <section
        v-if="samlChecking || samlRedirecting"
        class="page-sign-in saml-auto-login"
      >
        <div class="saml-auto-login-message">
          {{ $t('app_signIn_ssoProcessing') }}
        </div>
      </section>
      <section v-else class="page-sign-in">
        <div class="sign-in-panel">
          <div class="title">
            {{ $t('app_signIn_signIn') }}
          </div>
          <el-alert
            v-if="!!errorMessage"
            class="mb-5"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
          <form class="rounded-xl">
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
            class="login-action mt-12 w-100"
            size="large"
            type="primary"
            :loading="loading"
            @click="submit"
          >
            {{ $t('app_signIn_signIn') }}
          </ElButton>

          <ElButton
            v-if="samlEnable"
            class="login-action mt-4 w-100"
            size="large"
            @click="loginWithSaml"
          >
            {{ $t('app_signIn_samlLogin') }}
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

    // Element Plus adds a default left margin to adjacent buttons. Since these
    // actions are stacked and both span the panel width, remove that margin so
    // their left and right edges stay aligned.
    .login-action {
      display: flex;
      margin-left: 0 !important;
      box-sizing: border-box;
    }
  }
}

.saml-auto-login-message {
  color: var(--text-light);
  font-size: 16px;
}
</style>

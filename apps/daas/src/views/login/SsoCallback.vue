<script>
import { fetchSettings } from '@tap/api/core/settings'
import { exchangeSsoLoginCode } from '@tap/api/src/core/sso'
import { getUserInfoByToken } from '@tap/api/src/core/users'
import Cookie from '@tap/shared/src/cookie'
import { setSettings } from '@tap/shared/src/settings'
import { configUser, getUrlSearch } from '@/utils/util'
import LoginPage from './LoginPage.vue'

export default {
  name: 'SsoCallback',
  components: {
    LoginPage,
  },
  data() {
    return {
      errorMessage: '',
    }
  },
  created() {
    this.handleCallback()
  },
  methods: {
    async handleCallback() {
      // SAML ACS redirects here with a one-time login_code (TAP-11883).
      // COMPAT: still accept a legacy ?access_token= and immediately move it into a cookie.
      const loginCode = getUrlSearch('login_code')
      const legacyToken = getUrlSearch('access_token')
      let accessToken = ''
      try {
        if (loginCode) {
          const exchanged = await exchangeSsoLoginCode(loginCode)
          accessToken =
            typeof exchanged === 'string' ? exchanged : exchanged?.id
        } else if (legacyToken) {
          accessToken = legacyToken
        }
        if (!accessToken) {
          this.redirectToLogin()
          return
        }
        this.stripAuthParamsFromUrl()
        Cookie.set('access_token', accessToken)
        Cookie.set('tem_token', accessToken)
        // Mark the session so logout can trigger SP-initiated SLO.
        Cookie.set('auth_method', 'saml')

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
        if (lastLocationHref && !lastLocationHref.includes('login')) {
          sessionStorage.removeItem('lastLocationHref')
          location.href = lastLocationHref
        } else {
          sessionStorage.removeItem('lastLocationHref')
          this.$router.replace({ name: 'dashboard' })
        }
      } catch (error) {
        this.redirectToLogin(error?.message)
      }
    },
    stripAuthParamsFromUrl() {
      const [hashPath, hashQuery] = location.hash.split('?')
      if (!hashQuery) {
        return
      }
      const params = new URLSearchParams(hashQuery)
      params.delete('access_token')
      params.delete('login_code')
      const nextHash = params.toString() ? `${hashPath}?${params}` : hashPath
      history.replaceState(
        null,
        '',
        `${location.pathname}${location.search}${nextHash}`,
      )
    },
    redirectToLogin(message) {
      Cookie.remove('access_token')
      Cookie.remove('tem_token')
      Cookie.remove('auth_method')
      this.errorMessage = message || this.$t('app_signIn_ssoFailed')
      setTimeout(() => {
        this.$router.replace({ name: 'login' })
      }, 2000)
    },
  },
}
</script>

<template>
  <LoginPage>
    <template #main>
      <section class="page-sso-callback">
        <div class="sso-callback-panel">
          <el-alert
            v-if="!!errorMessage"
            class="mb-5"
            :title="errorMessage"
            type="error"
            show-icon
            :closable="false"
          />
          <div v-else v-loading="true" class="loading-box">
            {{ $t('app_signIn_ssoProcessing') }}
          </div>
        </div>
      </section>
    </template>
  </LoginPage>
</template>

<style lang="scss" scoped>
.page-sso-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  .sso-callback-panel {
    padding: 25px;
    width: 400px;
    margin: auto;
    .loading-box {
      padding: 40px 0;
      text-align: center;
      color: var(--text-light);
    }
  }
}
</style>

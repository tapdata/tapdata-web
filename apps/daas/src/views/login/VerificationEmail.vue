<template>
  <LoginPage>
    <template v-slot:main>
      <section class="page-registry_email" v-loading="loading">
        <div class="email-main">
          <div class="image iconfont icon-fasongyoujian"></div>
          <div class="text">
            <p>
              {{ type === 'reset' ? $t('app_signIn_passwordResetText') : $t('app_signIn_confirmationEmail') }}
              <i>{{ email }}</i>
            </p>
            <p>{{ $t('app_signIn_mailbox') }}</p>
            <div>
              {{ $t('app_signIn_receiveEmail') }}
              <span @click="resetSend" :class="{ noClick: time > 0 }" v-if="type === 'reset'"
                >{{ $t('app_signIn_resend') }} <i v-if="time > 0">({{ time }}s)</i></span
              >
              <span @click="send" :class="{ noClick: time > 0 }" v-else
                >{{ $t('app_signIn_resend') }} <i v-if="time > 0">({{ time }}s)</i></span
              >,

              {{ $t('app_signIn_orClick') }}
              <span @click="backLogin">{{ $t('app_signIn_signIn') }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </LoginPage>
</template>

<script>
import LoginPage from './LoginPage'
import Cookie from '@tap/shared/src/cookie'
import { usersApi } from '@tap/api'

export default {
  name: 'SignIn',
  components: { LoginPage },
  data() {
    return {
      type: 'reset',
      loading: false,
      flag: false,
      email: '',
      password: '',
      timer: null,
      time: 0,
      form: null,
    }
  },

  created() {
    if (this.$route.params?.data) {
      this.form = this.$route.params.data
      this.email = this.form.email
      this.inviteCode = this.form.inviteCode
      this.type = this.$route.params.type ? this.$route.params.type : ''
    }
  },

  methods: {
    // 重新发送
    async send() {
      const TIME_COUNT = 60
      // this.loading = true;
      if (!this.timer) {
        try {
          this.time = TIME_COUNT
          Cookie.set('location_origin', window.location.origin)

          this.timer = setInterval(() => {
            if (this.time > 0 && this.time <= TIME_COUNT) {
              this.time--
            } else {
              this.time = 0
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
          await usersApi.sendVerifyEmail({
            email: this.email,
            inviteCode: this.inviteCode,
          })
        } catch (e) {
          // if (e.response && e.response.msg) {
          //   if (e.response.msg.indexOf('Email already exists')) {
          //     this.$message.error(this.$t('app_signIn_email_existed'))
          //   } else {
          //     this.$message.error(`${e.response.msg}`)
          //   }
          // }
          clearInterval(this.timer)
          this.timer = null
          // this.loading = false;
        }
      }
      // this.loading = false;
    },

    // 重置密码重新发送
    async resetSend() {
      const TIME_COUNT = 60
      // this.loading = true;
      if (!this.timer) {
        this.time = TIME_COUNT
        Cookie.set('location_origin', window.location.origin)
        this.timer = setInterval(() => {
          if (this.time > 0 && this.time <= TIME_COUNT) {
            this.time--
          } else {
            this.time = 0
            clearInterval(this.timer)
            this.timer = null
          }
        }, 1000)
        await usersApi.reset(this.form)
      }
    },

    // 邮件跳转登录
    backLogin() {
      this.$router.replace({
        name: 'login',
        query: { email: this.email },
      })
    },
  },

  unmounted() {
    clearInterval(this.timer)
    this.timer = null
  },
}
</script>

<style lang="scss" scoped>
.page-registry_email {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
            color: var(--text-dark);
          }
        }
        .bold {
          color: var(--text-dark);
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

  .email-main {
    display: flex;
    flex-direction: row;
    width: 500px;
    height: 150px;
    margin: 0 auto;
    text-align: left;
    .image {
      padding: 2px 20px 0 0;
      font-size: 30px;
      color: var(--color-primary);
    }
    .text {
      font-size: 14px;
      color: var(--text-light);
      p {
        font-size: 18px;
        user-select: none;
        padding-bottom: 6px;
        i {
          color: var(--color-primary);
        }
      }
      div {
        padding-top: 20px;
        span {
          color: var(--color-primary);
          cursor: pointer;
          i {
            color: var(--text-light);
          }
        }
        .noClick {
          cursor: default;
        }
      }
    }
  }
}
</style>

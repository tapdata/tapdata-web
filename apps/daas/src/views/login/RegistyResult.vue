<template>
  <section class="page-registry_status" v-loading="loading">
    <Header></Header>
    <main>
      <div class="email-main">
        <template v-if="result === 'success'">
          <div class="image iconfont icon-zhuhe"></div>
          <div class="text">
            <p>
              {{ $t('app.signIn.account') }}
              <i>{{ email }}</i>
              {{ type === 'registy' ? $t('app.signIn.accountSuccess') : $t('app.signIn.resetAccountSuccess') }}
            </p>
            <p v-if="type === 'registy'">{{ $t('app.signIn.clickBtn') }}</p>
            <p v-else>{{ $t('app.signIn.resetClickBtn') }}</p>

            <el-button class="btn" type="primary" size="mini" @click="goLogin">{{
              $t('app.signIn.goLogin')
            }}</el-button>
          </div>
        </template>

        <template v-if="result === 'error'">
          <div class="image iconfont icon-cuowu errorIcon"></div>
          <div class="text">
            <p>
              {{ $t('app.signIn.account') }}<i>{{ email }}</i
              >{{ type === 'registy' ? $t('app.signIn.connectionFailed') : $t('app.signIn.resetConnectionFailed') }}
            </p>
            <div style="font-size: 18px">
              {{ $t('app.signIn.confirmEmail')
              }}<span @click="backRegisty">{{
                type === 'registy' ? $t('app.signIn.registered') : $t('app.signIn.modifyPassword')
              }}</span>
            </div>
          </div>
        </template>
      </div>
    </main>
  </section>
</template>

<script>
import Header from './Header'
import { usersApi } from '@tap/api'

export default {
  name: 'SignIn',
  components: { Header },
  data() {
    return {
      type: 'registy',
      loading: false,
      flag: false,
      email: '',
      timer: null,
      time: 0,
      result: '',
      queryData: null
    }
  },
  created() {
    if (this.$route.query) {
      this.queryData = this.$route.query
      this.type = this.$route.query.type ? this.$route.query.type : ''
      this.email = this.queryData.email
    }

    if (this.type === 'registy') {
      if (this.queryData.uid && this.queryData.token) {
        this.getRegistydata(this.queryData.uid, this.queryData.token)
      }
    } else {
      if (this.queryData.access_token) {
        this.getResetdata()
      }
    }
  },

  methods: {
    getResetdata() {
      this.loading = true
      usersApi
        .newResetPassword(this.queryData.access_token)
        .then(() => {
          this.result = 'success'
        })
        .catch(() => {
          this.result = 'error'
        })
        .finally(() => {
          this.loading = false
        })
    },

    getRegistydata(uid, token) {
      this.loading = true
      usersApi
        .confirm(uid, token)
        .then(() => {
          this.result = 'success'
        })
        .catch(() => {
          this.result = 'error'
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 去注册
    backRegisty() {
      this.$router.replace({
        name: 'registry'
      })
    },

    // 去登录
    goLogin() {
      this.$router.replace({
        name: 'login',
        query: { email: this.email }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-registry_status {
  background: map-get($bgColor, normal);
  height: 100%;
  overflow: auto;
  box-sizing: border-box;

  main {
    position: relative;
    margin-top: 100px;
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
        color: map-get($color, primary);
      }
      .errorIcon {
        color: #f00 !important;
      }
      .text {
        padding-top: 8px;
        font-size: 14px;
        color: map-get($fontColor, light);
        text-align: center;
        p {
          font-size: 18px;
          text-align: left;
          user-select: none;
          padding-bottom: 6px;
          i {
            color: map-get($color, primary);
          }
        }
        div {
          text-align: left;
          span {
            color: map-get($color, primary);
            cursor: pointer;
            i {
              color: map-get($fontColor, light);
            }
          }
        }
        .btn {
          margin-top: 60px;
        }
      }
    }
  }
}
</style>

<template>
  <div class="verification-code">
    <ElButton
      :type="type"
      :loading="loading"
      :disabled="disabled || btnDisabled"
      :style="buttonStyle"
      @click="sendFnc"
      >{{ num ? num + 's' : buttonText }}</ElButton
    >
  </div>
</template>

<script>
export default {
  name: 'VerificationCode',
  props: {
    type: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    buttonText: {
      type: String,
      default: '发送验证码'
    },
    remoteMethod: {
      type: Function
    },
    buttonStyle: {
      type: Object,
      default: () => {}
    },
    requestOptions: {
      type: Object,
      default: () => {
        return {
          method: 'get',
          url: '',
          params: {}
        }
      }
    }
  },
  data() {
    return {
      timer: null,
      loading: false,
      btnDisabled: false,
      num: ''
    }
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    sendFnc() {
      this.loading = true
      try {
        // if (this.remoteMethod) {
        //   this.remoteMethod().then(() => {
        //     this.startSend()
        //   })
        // } else {
        // const { requestOptions } = this
        const { method, url, params } = this.requestOptions
        // method: 'get',
        //   url: '',
        //   params: {}
        if (url) {
          this.$axios[method](url, params)
            .then(() => {
              this.startSend()
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          this.startSend()
        }
      } catch (err) {
        this.loading = false
      }
    },
    startSend() {
      this.loading = false
      this.btnDisabled = true
      this.num = 60
      this.countdown()
    },
    countdown() {
      this.timer = setInterval(() => {
        if (this.num <= 1) {
          this.clearTimer()
        }
        this.num--
      }, 300)
    },
    clearTimer() {
      this.btnDisabled = false
      this.loading = false
      this.timer && clearInterval(this.timer)
    }
  }
}
</script>

<style scoped></style>

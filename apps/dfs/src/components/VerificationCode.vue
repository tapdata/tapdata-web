<template>
  <div class="verification-code">
    <ElButton :type="type" :loading="loading" :disabled="disabled" :style="buttonStyle" @click="sendFnc">{{
      num ? num + 's' : buttonText
    }}</ElButton>
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
    }
  },
  data() {
    return {
      timer: null,
      loading: false,
      disabled: false,
      num: ''
    }
  },
  beforeDestroy() {
    this.clearTimer()
  },
  methods: {
    sendFnc() {
      console.log('sendFnc', this.remoteMethod)
      this.loading = true
      try {
        if (this.remoteMethod) {
          this.remoteMethod().then(() => {
            this.startSend()
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
      this.disabled = true
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
      this.disabled = false
      this.loading = false
      this.timer && clearInterval(this.timer)
    }
  }
}
</script>

<style scoped></style>

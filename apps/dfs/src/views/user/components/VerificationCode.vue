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
import i18n from '@/i18n'

export default {
  name: 'VerificationCode',
  props: {
    type: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    buttonText: {
      type: String,
      default: () => {
        return i18n.t('components_VerificationCode_faSongYanZhengMa')
      },
    },
    remoteMethod: {
      type: Function,
    },
    buttonStyle: {
      type: Object,
      default: () => {},
    },
    requestOptions: {
      type: Object,
      default: () => {
        return {
          method: 'get',
          url: '',
          params: {},
        }
      },
    },
    spacing: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      timer: null,
      loading: false,
      btnDisabled: false,
      num: '',
    }
  },
  beforeUnmount() {
    this.clearTimer()
  },
  methods: {
    sendFnc() {
      this.loading = true
      try {
        const { method, url, params } = this.requestOptions
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
      }, this.spacing)
    },
    clearTimer() {
      this.btnDisabled = false
      this.loading = false
      this.timer && clearInterval(this.timer)
    },
  },
}
</script>

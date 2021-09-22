<template>
  <transition name="msgbox-fade">
    <div v-show="visible" class="message-box__wrapper" tabindex="-1" role="dialog" aria-modal="true">
      <div
        :class="['message-box position-relative', customClass, center && 'el-message-box--center']"
        :style="{ width: width }"
      >
        <div class="message-box__header position-relative">
          <div class="message-box__title flex align-items-center">
            <VIcon v-if="icon && !onlyMessage" :size="iconSize" :color="iconColor" :class="['v-icon', iconClass]">{{
              icon
            }}</VIcon>
            <span v-if="title" :class="titleClass">{{ title }}</span>
          </div>
          <button
            type="button"
            class="message-box__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
            @keydown.enter="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
          >
            <i class="el-message-box__close el-icon-close"></i>
          </button>
        </div>
        <div class="message-box__body">
          <div class="el-message-box__container">
            <div class="el-message-box__message flex" v-if="message !== ''">
              <VIcon
                v-if="icon && onlyMessage"
                :size="iconSize"
                :color="iconColor"
                :class="['v-icon', 'flex-shrink-0', iconClass]"
                >{{ icon }}</VIcon
              >
              <slot>
                <div v-if="!dangerouslyUseHTMLString" :class="['message-box__content', messageClass]">
                  {{ message }}
                </div>
                <div v-else v-html="message" :class="['message-box__content', messageClass]"></div>
              </slot>
            </div>
          </div>
        </div>
        <div class="message-box__btns">
          <el-button
            type="primary"
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[confirmButtonClasses]"
            v-show="showConfirmButton"
            size="small"
            @click.native="handleAction('confirm')"
            @keydown.enter="handleAction('confirm')"
          >
            {{ confirmButtonText || '确认' }}
          </el-button>
          <el-button
            :loading="cancelButtonLoading"
            :class="[cancelButtonClasses]"
            v-if="showCancelButton"
            size="small"
            @click.native="handleAction('cancel')"
            @keydown.enter="handleAction('cancel')"
          >
            {{ cancelButtonText || '取消' }}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import VIcon from '@/components/VIcon'
export default {
  components: { VIcon },
  props: {
    value: Boolean
  },
  data() {
    return {
      visible: false,
      uid: 1,
      callback: null,
      hideIcon: false,
      icon: '', // 图标
      iconColor: '',
      iconSize: 25,
      title: '', // 标题
      message: '', // 内容
      type: '', // 常用的几种提示类型： success、info、warning、error。不然需要自己传递 icon的属性
      iconClass: '', // 图标的类名
      titleClass: '', // 标题的类名
      messageClass: '', // 内容的类名
      showClose: true,
      center: false,
      customClass: '',
      showConfirmButton: true,
      showCancelButton: false,
      action: '',
      confirmButtonText: '',
      cancelButtonText: '',
      confirmButtonLoading: false,
      cancelButtonLoading: false,
      confirmButtonClass: '',
      confirmButtonDisabled: false,
      cancelButtonClass: '',
      dangerouslyUseHTMLString: false,
      distinguishCancelAndClose: false,
      width: '416px' // 需要完整的像素字符串
    }
  },
  computed: {
    confirmButtonClasses() {
      return `el-button--primary ${this.confirmButtonClass}`
    },
    cancelButtonClasses() {
      return `${this.cancelButtonClass}`
    },
    onlyMessage() {
      let { title, message } = this
      console.log('onlyMessage', !title && !!message)
      return !title && !!message
    }
  },
  watch: {
    value(v) {
      this.visible = v
    },
    visible(v) {
      v && this.init()
    }
  },
  beforeDestroy() {
    this.close()
  },
  methods: {
    init() {
      console.log('init', this.type)
      this.getIconByType(this.type)
    },
    handleAction(action) {
      this.close()
      if (action !== 'close') {
        this.callback(action, this)
      }
    },
    close() {
      this.visible = false
    },
    getIconByType(type) {
      this.icon = type
      this.iconClass = 'color-' + type
    }
  }
}
</script>

<style lang="scss" scoped>
.message-box__wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 3001;
  &::after {
    content: '';
    display: inline-block;
    height: 100%;
    width: 0;
    vertical-align: middle;
  }
}
.message-box {
  display: inline-flex;
  flex-direction: column;
  max-height: 100%;
  vertical-align: middle;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  font-size: 18px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  text-align: left;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  box-sizing: border-box;
}
.message-box__header {
  padding: 24px 24px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
}
.v-icon {
  margin-right: 15px;
}
.el-button {
  padding: 8px 16px;
  & + .el-button {
    margin-left: 16px;
  }
}
.message-box__headerbtn {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 0;
  border: none;
  outline: 0;
  background: 0 0;
  font-size: 16px;
  cursor: pointer;
}
.message-box__body {
  margin: 24px 0;
  padding: 0 24px;
  flex: 1;
  overflow: auto;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}
.message-box__content {
  padding-top: 4px;
}
.message-box__btns {
  padding: 0 24px 24px;
  text-align: right;
}
</style>

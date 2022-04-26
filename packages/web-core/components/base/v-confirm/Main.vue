<template>
  <transition name="msgbox-fade">
    <div v-show="visible" class="message-box__wrapper" tabindex="-1" role="dialog" aria-modal="true">
      <div
        :class="['message-box position-relative', customClass, center && 'el-message-box--center']"
        :style="{ width: width }"
      >
        <!-- <div class="message-box__header position-relative">
          <div class="message-box__title flex align-items-center">
            <VIcon
              v-if="icon && haveTitleAndMessage"
              :size="iconSize"
              :color="iconColor"
              :class="['v-icon', iconClass]"
              >{{ icon }}</VIcon
            >
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
        </div> -->
        <div class="message-box__body">
          <div class="el-message-box__container">
            <div class="el-message-box__message flex" v-if="message !== ''">
              <VIcon
                v-if="icon"
                :size="iconSize"
                :color="iconColor"
                :class="['v-icon', 'flex-shrink-0', { invisible: !onlyMessage }, iconClass]"
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
            :loading="cancelButtonLoading"
            :class="[{ cancelButtonClasses }, 'message-button-cancel']"
            v-if="showCancelButton"
            size="mini"
            @click.native="handleAction('cancel')"
            @keydown.enter="handleAction('cancel')"
          >
            {{ cancelButtonText || '取消' }}
          </el-button>
          <el-button
            type="primary"
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[confirmButtonClasses]"
            v-show="showConfirmButton"
            size="mini"
            @click.native="handleAction('confirm')"
            @keydown.enter="handleAction('confirm')"
          >
            {{ confirmButtonText || '确认' }}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import error from 'web-core/assets/icons/svg/error.svg'
import info from 'web-core/assets/icons/svg/info.svg'
import success from 'web-core/assets/icons/svg/success.svg'
import warning from 'web-core/assets/icons/svg/warning.svg'

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
      error,
      info,
      success,
      warning,
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
      return !title && message
    },
    haveTitleAndMessage() {
      let { title, message } = this
      return title && message
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
      this.getIconByType(this.type)
    },
    handleAction(action) {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(action, this, this.close)
      } else {
        this.close()
      }
      if (action !== 'close') {
        this.callback(action, this)
      }
    },
    close() {
      this.visible = false
    },
    getIconByType(type) {
      this.icon = type
      if (type === 'error') {
        this.iconClass = 'color-danger'
        return
      }
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
  z-index: 3200;
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
  font-weight: 700;
}
.v-icon {
  margin-right: 12px;
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
  margin: 8px 0 24px;
  padding: 0 24px;
  flex: 1;
  overflow: auto;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}
.message-box__content {
  padding: 4px 24px 0 0;
  flex: 1;
  width: 0;
  box-sizing: border-box;
}
.message-box__btns {
  padding: 0 24px 24px;
  text-align: right;
  .el-button {
    padding: 0 16px;
    &.el-button--mini {
      height: 28px;
      line-height: 28px;
    }
  }
}
.message-button-cancel {
  padding: 7px 16px;
}
</style>

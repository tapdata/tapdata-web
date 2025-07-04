<template>
  <transition name="msgbox-fade">
    <div
      class="el-message-box__wrapper"
      tabindex="-1"
      v-show="visible"
      @click.self="handleWrapperClick"
      role="dialog"
      aria-modal="true"
      :aria-label="title || 'dialog'"
    >
      <div class="el-message-box" :class="[customClass, center && 'el-message-box--center']" :style="{ width }">
        <div class="el-message-box__header" v-if="title">
          <div class="el-message-box__title flex align-center">
            <VIcon v-if="icon" class="mr-3" :size="iconSize" :color="iconColor" :class="statusClass">{{ icon }}</VIcon>
            <span class="font-weight-bold fs-6">{{ title }}</span>
          </div>
          <button
            type="button"
            class="el-message-box__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
            @keydown.enter="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
          >
            <el-icon class="el-message-box__close"><el-icon-close /></el-icon>
          </button>
        </div>
        <div class="el-message-box__content" :class="{ 'mt-3': !title }">
          <div class="el-message-box__container">
            <div class="el-message-box__message flex" v-if="message !== ''">
              <VIcon
                v-if="icon"
                :size="iconSize"
                :color="iconColor"
                class="mr-3 flex-shrink-0 pt-1"
                :class="[{ invisible: !showContentIcon }, statusClass]"
                >{{ icon }}</VIcon
              >
              <slot>
                <p v-if="!dangerouslyUseHTMLString">{{ message }}</p>
                <p v-else v-html="message"></p>
              </slot>
            </div>
          </div>
          <div class="el-message-box__input" v-show="showInput">
            <el-input
              v-model="inputValue"
              :type="inputType"
              @keydown.enter="handleInputEnter"
              :placeholder="inputPlaceholder"
              ref="input"
            ></el-input>
            <div
              class="el-message-box__errormsg"
              :style="{
                visibility: !!editorErrorMessage ? 'visible' : 'hidden',
              }"
            >
              {{ editorErrorMessage }}
            </div>
          </div>
        </div>
        <div class="el-message-box__btns">
          <el-button
            :loading="cancelButtonLoading"
            :class="[cancelButtonClasses]"
            v-if="showCancelButton"
            :round="roundButton"
            @click="handleAction('cancel')"
            @keydown.enter="handleAction('cancel')"
          >
            {{ cancelButtonText || cancelButtonTextDefault }}
          </el-button>
          <el-button
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[confirmButtonClasses]"
            v-show="showConfirmButton"
            :round="roundButton"
            @click="handleAction('confirm')"
            @keydown.enter="handleAction('confirm')"
          >
            {{ confirmButtonText || confirmButtonTextDefault }}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { VIcon } from '@tap/component'
import MsgBox from 'element-plus/lib/components/message-box/index'
import i18n from '@/i18n'

export default {
  components: {
    VIcon,
  },
  extends: MsgBox,
  data() {
    return {
      width: null,
      cancelButtonTextDefault: i18n.t('public_button_cancel'),
      confirmButtonTextDefault: i18n.t('public_button_confirm'),
    }
  },
  computed: {
    icon() {
      const { type } = this
      return type
    },
    statusClass() {
      const { type } = this
      if (type === 'error') {
        return 'color-danger'
      }
      return 'color-' + type
    },
    showContentIcon() {
      let { title, message } = this
      return !title && message
    },
  },
}
</script>

<style lang="scss" scoped>
.el-message-box__wrapper {
  .el-message-box {
    padding-bottom: 24px;

    &__header {
      padding: 24px 24px 0;
    }
    &__title {
      font-size: 14px;
      color: var(--text-normal);
    }
    &__content {
      padding: 10px 24px;
    }
    &__message {
      max-height: 300px;
      overflow-y: auto;
    }
    &__btns {
      padding: 14px 24px 0;
    }
  }
}
</style>

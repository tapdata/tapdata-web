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
            <span>{{ title }}</span>
          </div>
          <button
            type="button"
            class="el-message-box__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
            @keydown.enter="handleAction(distinguishCancelAndClose ? 'close' : 'cancel')"
          >
            <i class="el-message-box__close el-icon-close"></i>
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
              @keydown.enter.native="handleInputEnter"
              :placeholder="inputPlaceholder"
              ref="input"
            ></el-input>
            <div class="el-message-box__errormsg" :style="{ visibility: !!editorErrorMessage ? 'visible' : 'hidden' }">
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
            size="small"
            @click.native="handleAction('cancel')"
            @keydown.enter="handleAction('cancel')"
          >
            {{ cancelButtonText || $t('el.messagebox.cancel') }}
          </el-button>
          <el-button
            :loading="confirmButtonLoading"
            ref="confirm"
            :class="[confirmButtonClasses]"
            v-show="showConfirmButton"
            :round="roundButton"
            size="small"
            @click.native="handleAction('confirm')"
            @keydown.enter="handleAction('confirm')"
          >
            {{ confirmButtonText || $t('el.messagebox.confirm') }}
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import VIcon from 'web-core/components/VIcon'
import MsgBox from 'element-ui/packages/message-box/src/main.vue'

export default {
  extends: MsgBox,

  components: { VIcon },

  data() {
    return {
      width: null
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
    }
  }
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
      color: map-get($fontColor, normal);
    }
    &__content {
      padding: 10px 24px;
    }
    &__btns {
      padding: 14px 24px 0;
    }
  }
}
</style>

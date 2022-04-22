<template>
  <div>
    <div class="error-item">{{ errorTitle }}</div>
    <div v-show="code" class="error-item">
      <span class="error-item__label">{{ codeLabel }}</span>
      <span class="error-item__value">{{ code }}</span>
    </div>
    <div v-show="reqId" class="error-item">
      <span class="error-item__label">{{ reqIdLabel }}</span>
      <span class="error-item__value cursor-pointer" @click="onCopy">{{ reqId }}</span>
      <ElTooltip
        placement="top"
        manual
        :content="copiedTip"
        popper-class="copy-tooltip"
        :tabindex="10086"
        :value="showTooltip"
      >
        <span class="operaKey" v-clipboard:copy="reqId" v-clipboard:success="onCopy" @mouseleave="showTooltip = false">
          <VIcon size="14" :class="[{ 'copied-icon': copied }, 'cursor-pointer', 'ml-2']">copy</VIcon>
        </span>
      </ElTooltip>
    </div>
    <div v-show="message">
      <div class="inline-flex align-items-center expand-operation cursor-pointer" @click="expand = !expand">
        <span class="error-item__label">{{ errorDetailLabel }}</span>
        <VIcon size="14" :class="[{ expand: expand }, 'v-icon', 'ml-1']" @click.prevent.stop="expand = !expand"
          >arrow-down</VIcon
        >
      </div>
      <div v-show="expand" class="font-color-disable">{{ message }}</div>
    </div>
  </div>
</template>

<script>
import VIcon from '@/components/VIcon'
import i18n from '@/i18n'

export default {
  name: 'RequestErrorMessage',
  components: { VIcon },
  props: {
    err: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      expand: false,
      showTooltip: false,
      copied: false,
      errData: {},
      copiedTip: i18n.t('components_RequestErrorMessage_yiFuZhi'),
      errorTitle: i18n.t('RequestErrorMessage_error_title'),
      codeLabel: i18n.t('RequestErrorMessage_code_label'),
      reqIdLabel: i18n.t('RequestErrorMessage_req_id_label'),
      errorDetailLabel: i18n.t('RequestErrorMessage_error_detail_label')
    }
  },
  computed: {
    code() {
      return this.errData.code
    },
    reqId() {
      return this.errData.data?.reqId
    },
    message() {
      return this.errData.message
    }
  },
  methods: {
    onCopy() {
      this.showTooltip = true
      this.copied = true
    },
    clickItem() {
      this.expand = !this.expand
    }
  }
}
</script>

<style lang="scss" scoped>
.error-item {
  margin-bottom: 8px;
  line-height: 20px;
}
.expand-operation {
  margin-bottom: 4px;
  line-height: 20px;
}
.v-icon {
  transition: 0.5s;
  &.expand {
    transform: rotate(180deg);
  }
}
.copied-icon {
  color: map-get($color, primary);
}
</style>

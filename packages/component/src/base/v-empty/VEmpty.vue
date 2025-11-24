<script>
import i18n from '@tap/i18n'

export default {
  name: 'VEmpty',
  props: {
    small: Boolean,
    large: Boolean,
    description: {
      type: String,
      default: () => {
        return i18n.t('public_data_no_data')
      },
    },
  },
  computed: {
    imgSrc() {
      return new URL('./empty.svg', import.meta.url).href
    },
  },
}
</script>

<template>
  <div
    class="v-empty-wrap"
    :class="{
      'empty-small': small,
      'empty-large': large,
    }"
  >
    <div class="empty-image">
      <slot name="image">
        <ElImage :src="imgSrc" />
      </slot>
    </div>
    <slot name="default">
      <p class="empty-desc">{{ description }}</p>
    </slot>
  </div>
</template>

<style lang="scss">
.v-empty-wrap {
  margin: 32px 0;
  font-size: 13px;
  line-height: 1.5715;
  text-align: center;
  color: var(--el-text-color-placeholder);
  &.empty-small {
    margin: 8px 0;
    font-size: 12px;

    .empty-image {
      height: 40px;
    }
  }

  &.empty-large {
    font-size: 14px;
    .empty-image {
      height: 64px;
      margin-bottom: 16px;
    }
  }

  .empty-image {
    height: 48px;
    margin-bottom: 8px;
    .el-image {
      height: 100%;
      margin: auto;
      overflow: hidden;
    }
  }
}
</style>

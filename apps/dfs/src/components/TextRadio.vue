<template>
  <div class="text-radio-group flex">
    <div v-for="(item, index) in items" :key="index" class="text-radio__item">
      <span :class="['text-radio__label', { 'color-primary': active === item.value }]" @click="clickItem(item)">{{
        item.label
      }}</span>
      <ElDivider v-if="index !== items.length - 1" direction="vertical" class="text-radio__divider"></ElDivider>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextRadio',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    value: {
      type: [Number, String]
    }
  },
  data() {
    return {
      active: ''
    }
  },
  mounted() {
    this.active = this.value
  },
  methods: {
    clickItem(item) {
      if (this.active === item.value) {
        return
      }
      this.active = item.value
      this.$emit('input', this.active).$emit('change', this.active)
    }
  }
}
</script>

<style lang="scss" scoped>
.text-radio__label {
  cursor: pointer;
}
</style>

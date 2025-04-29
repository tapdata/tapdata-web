<script>
export default {
  name: 'SwitchNumber',
  props: {
    value: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      switchValue: this.value === 1,
    }
  },
  watch: {
    value(value) {
      this.switchValue = value === 1
    },
  },
  methods: {
    handleChange(value) {
      const newValue = value ? 1 : 0
      this.$emit('change', newValue)
      this.$emit('update:value', newValue)
    },
  },
}
</script>

<template>
  <ElSwitch v-model="switchValue" v-bind="$attrs" @change="handleChange" />
</template>

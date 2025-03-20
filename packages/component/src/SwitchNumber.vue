<template>
  <ElSwitch v-model="switchValue" @change="handleChange" v-bind="$attrs" />
</template>

<script>
export default {
  name: 'SwitchNumber',
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      switchValue: this.value === 1
    }
  },
  watch: {
    value(value) {
      this.switchValue = value === 1
    }
  },
  methods: {
    handleChange(value) {
      const newValue = value ? 1 : 0
      this.$emit('change', newValue)
      this.$emit('input', newValue)
    }
  }
}
</script>

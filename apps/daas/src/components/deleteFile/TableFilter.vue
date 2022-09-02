<template>
  <span class="table-filter">
    <i
      class="iconfont icon-shaixuan2 table-filter__icon"
      :class="{ 'color-primary': !!value }"
      style="margin-left: 10px"
      @click="toggole"
    ></i>
    <ElSelect
      popper-append-to-body
      ref="select"
      class="table-filter__select"
      popper-class="table-filter__popper"
      :value="value"
      @input="input"
    >
      <ElOption value="" :label="$t('button_all')"></ElOption>
      <ElOption v-for="(opt, key) in options" :key="key" :value="opt.value || key" :label="opt.label || opt"></ElOption>
    </ElSelect>
  </span>
</template>

<script>
export default {
  props: {
    value: {
      type: String
    },
    options: {
      type: [Array, Object]
    }
  },
  data() {
    return {
      visible: false
    }
  },
  watch: {
    options() {
      this.$nextTick(() => {
        this.$parent.$forceUpdate()
      })
    }
  },
  created() {
    window.addEventListener('click', e => {
      if (e.target.className.indexOf?.('table-filter__icon') < 0) {
        this.visible = false
      }
    })
  },
  methods: {
    input(value) {
      this.visible = false
      this.$emit('input', value)
      this.$nextTick(() => {
        this.$parent.$forceUpdate()
      })
    },
    toggole() {
      let select = this.$refs.select
      if (!this.visible) {
        select.visible = true
        this.visible = true
      } else {
        this.visible = false
      }
    }
  }
}
</script>

<style lang="scss">
.table-filter__icon {
  font-size: 12px;
  cursor: pointer;
}
.table-filter__select {
  width: 0;
  height: 0;
  visibility: hidden;
}
.table-filter__popper {
  transform: translate(-36px, -10px) !important;
}
</style>

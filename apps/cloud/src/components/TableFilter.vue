<script>
import { VIcon } from '@tap/component'
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'
export default {
  components: { VIcon },
  props: {
    value: {
      type: String,
    },
    options: {
      type: [Array, Object],
    },
  },
  emits: ['update:value'],
  data() {
    return {
      visible: false,
    }
  },
  watch: {
    options() {
      this.$nextTick(() => {
        this.$parent.$forceUpdate()
      })
    },
  },
  created() {
    window.addEventListener('click', (e) => {
      if (!e.target.className.indexOf('table-filter__icon') < 0) {
        this.visible = false
      }
    })
  },
  methods: {
    input(value) {
      this.visible = false
      $emit(this, 'update:value', value)
      this.$nextTick(() => {
        this.$parent.$forceUpdate()
      })
    },
    toggole() {
      const select = this.$refs.select
      if (!this.visible) {
        select.visible = true
        this.visible = true
      } else {
        this.visible = false
      }
    },
  },
}
</script>

<template>
  <span class="table-filter">
    <VIcon
      class="table-filter__icon"
      style="margin-left: 2px"
      :class="{ 'is-active': !!value }"
      @click="toggole"
      >refresh</VIcon
    >
    <ElSelect
      ref="select"
      popper-append-to-body
      class="table-filter__select"
      popper-class="table-filter__popper"
      :model-value="value"
      @input="input"
    >
      <ElOption value="" :label="$t('public_select_option_all')"/>
      <ElOption
        v-for="(opt, key) in options"
        :key="key"
        :value="opt.value || key"
        :label="opt.label || opt"
      />
    </ElSelect>
  </span>
</template>

<template>
  <span class="table-filter">
    <VIcon
      class="table-filter__icon"
      style="margin-left: 2px"
      :class="{ 'is-active': !!value }"
      @click="toggole"
      >refresh</VIcon
    >
    <ElSelect
      ref="select"
      popper-append-to-body
      class="table-filter__select"
      popper-class="table-filter__popper"
      :model-value="value"
      @input="input"
    >
      <ElOption value="" :label="$t('public_select_option_all')" />
      <ElOption
        v-for="(opt, key) in options"
        :key="key"
        :value="opt.value || key"
        :label="opt.label || opt"
      />
    </ElSelect>
  </span>
</template>.includes('table-filter__icon')) {
        this.visible = false
      }
    })
  },
  methods: {
    input(value) {
      this.visible = false
      $emit(this, 'update:value', value)
      this.$nextTick(() => {
        this.$parent.$forceUpdate()
      })
    },
    toggole() {
      const select = this.$refs.select
      if (!this.visible) {
        select.visible = true
        this.visible = true
      } else {
        this.visible = false
      }
    },
  },
}
</script>

<style lang="scss">
.table-filter__icon {
  color: map.get($fontColor, normal);
  font-size: 12px;
  cursor: pointer;
  &.is-active {
    color: map.get($color, primary);
  }
}
.table-filter__select {
  width: 0;
  height: 0;
  visibility: hidden;
}
.table-filter__popper {
  transform: translate(-33px, -10px);
}
</style>

<style lang="scss">
.table-filter__icon {
  color: map.get($fontColor, normal);
  font-size: 12px;
  cursor: pointer;
  &.is-active {
    color: map.get($color, primary);
  }
}
.table-filter__select {
  width: 0;
  height: 0;
  visibility: hidden;
}
.table-filter__popper {
  transform: translate(-33px, -10px);
}
</style>

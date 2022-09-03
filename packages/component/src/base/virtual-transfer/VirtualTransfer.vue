<template>
  <div class="el-transfer">
    <VirtualTransferPanel
      v-slot="{ option }"
      v-bind="$props"
      ref="leftPanel"
      :data="sourceData"
      :title="titles[0] || $t('packages_component_transfer_titles_0')"
      :default-checked="leftDefaultChecked"
      :placeholder="filterPlaceholder || $t('packages_component_filter_placeholder')"
      @checked-change="onSourceCheckedChange"
    >
      <slot name="left" :option="option"></slot>
      <slot name="left-footer"></slot>
    </VirtualTransferPanel>
    <div class="el-transfer__buttons">
      <el-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        @click.native="addToLeft"
        :disabled="rightChecked.length === 0"
      >
        <i class="el-icon-arrow-left"></i>
        <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
      </el-button>
      <el-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        @click.native="addToRight"
        :disabled="leftChecked.length === 0"
      >
        <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
        <i class="el-icon-arrow-right"></i>
      </el-button>
    </div>
    <VirtualTransferPanel
      v-slot="{ option }"
      v-bind="$props"
      ref="rightPanel"
      :data="targetData"
      :title="titles[1] || $t('packages_component_transfer_titles_1')"
      :default-checked="rightDefaultChecked"
      :placeholder="filterPlaceholder || $t('packages_component_filter_placeholder')"
      @checked-change="onTargetCheckedChange"
    >
      <slot name="right" :option="option"></slot>
      <slot name="right-footer"></slot>
    </VirtualTransferPanel>
  </div>
</template>

<script>
import { Transfer } from 'element-ui'
import VirtualTransferPanel from './VirtualTransferPanel'

export default {
  name: 'VirtualTransfer',
  components: { VirtualTransferPanel },
  extends: Transfer,
  computed: {
    sourceData() {
      // console.time('sourceData')
      const valueObj = {}
      this.value.forEach(item => {
        valueObj[item] = true
      })
      const data = this.data.filter(item => !valueObj[item[this.props.key]])
      // console.timeEnd('sourceData')
      return data
    },

    targetData() {
      // console.time('targetData')
      let data
      if (this.targetOrder === 'original') {
        const valueObj = {}
        this.value.forEach(item => {
          valueObj[item] = true
        })
        data = this.data.filter(item => valueObj[item[this.props.key]])
      } else {
        data = this.value.reduce((arr, cur) => {
          const val = this.dataObj[cur]
          if (val) {
            arr.push(val)
          }
          return arr
        }, [])
      }
      // console.timeEnd('targetData')
      return data
    }
  },

  methods: {
    addToRight() {
      // console.time('addToRight')
      let currentValue = this.value.slice()
      const itemsToBeMoved = []
      const key = this.props.key

      let leftCheckedKeyPropsObj = {}
      this.leftChecked.forEach(item => {
        leftCheckedKeyPropsObj[item] = true
      })
      let valueKeyPropsObj = {}
      this.value.forEach(item => {
        valueKeyPropsObj[item] = true
      })

      this.data.forEach(item => {
        const itemKey = item[key]
        if (leftCheckedKeyPropsObj[itemKey] && !valueKeyPropsObj[itemKey]) {
          itemsToBeMoved.push(itemKey)
        }
      })
      currentValue =
        this.targetOrder === 'unshift' ? itemsToBeMoved.concat(currentValue) : currentValue.concat(itemsToBeMoved)
      this.$emit('input', currentValue)
      this.$emit('change', currentValue, 'right', this.leftChecked)
      // console.timeEnd('addToRight')
    }
  }
}
</script>

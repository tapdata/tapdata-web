<script>
import { ElTransfer as Transfer } from 'element-plus'
import { $emit } from '../../../utils/gogocodeTransfer'
import VirtualTransferPanel from './VirtualTransferPanel'

export default {
  name: 'VirtualTransfer',
  components: {
    VirtualTransferPanel,
  },
  extends: Transfer,
  emits: ['update:value', 'change'],
  computed: {
    sourceData() {
      // console.time('sourceData')
      const valueObj = {}
      this.value.forEach((item) => {
        valueObj[item] = true
      })
      const data = this.data.filter((item) => !valueObj[item[this.props.key]])
      // console.timeEnd('sourceData')
      return data
    },

    targetData() {
      // console.time('targetData')
      let data
      if (this.targetOrder === 'original') {
        const valueObj = {}
        this.value.forEach((item) => {
          valueObj[item] = true
        })
        data = this.data.filter((item) => valueObj[item[this.props.key]])
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
    },
  },
  methods: {
    addToRight() {
      // console.time('addToRight')
      let currentValue = this.value.slice()
      const itemsToBeMoved = []
      const key = this.props.key

      const leftCheckedKeyPropsObj = {}
      this.leftChecked.forEach((item) => {
        leftCheckedKeyPropsObj[item] = true
      })
      const valueKeyPropsObj = {}
      this.value.forEach((item) => {
        valueKeyPropsObj[item] = true
      })

      this.data.forEach((item) => {
        const itemKey = item[key]
        if (leftCheckedKeyPropsObj[itemKey] && !valueKeyPropsObj[itemKey]) {
          itemsToBeMoved.push(itemKey)
        }
      })
      currentValue =
        this.targetOrder === 'unshift'
          ? itemsToBeMoved.concat(currentValue)
          : currentValue.concat(itemsToBeMoved)
      $emit(this, 'update:value', currentValue)
      $emit(this, 'change', currentValue, 'right', this.leftChecked)
      // console.timeEnd('addToRight')
    },
  },
}
</script>

<template>
  <div class="el-transfer">
    <VirtualTransferPanel
      v-bind="$props"
      v-slot="{ option }"
      ref="leftPanel"
      :data="sourceData"
      :title="titles[0] || $t('packages_component_transfer_titles_0')"
      :default-checked="leftDefaultChecked"
      :placeholder="
        filterPlaceholder || $t('packages_component_filter_placeholder')
      "
      @checked-change="onSourceCheckedChange"
    >
      <slot name="left" :option="option" />
      <slot name="left-footer" />
    </VirtualTransferPanel>
    <div class="el-transfer__buttons">
      <el-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        :disabled="rightChecked.length === 0"
        @click="addToLeft"
      >
        <el-icon><el-icon-arrow-left /></el-icon>
        <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
      </el-button>
      <el-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        :disabled="leftChecked.length === 0"
        @click="addToRight"
      >
        <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
        <el-icon><el-icon-arrow-right /></el-icon>
      </el-button>
    </div>
    <VirtualTransferPanel
      v-bind="$props"
      v-slot="{ option }"
      ref="rightPanel"
      :data="targetData"
      :title="titles[1] || $t('packages_component_transfer_titles_1')"
      :default-checked="rightDefaultChecked"
      :placeholder="
        filterPlaceholder || $t('packages_component_filter_placeholder')
      "
      @checked-change="onTargetCheckedChange"
    >
      <slot name="right" :option="option" />
      <slot name="right-footer" />
    </VirtualTransferPanel>
  </div>
</template>

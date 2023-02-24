<template>
  <div class="el-transfer inline-flex">
    <VirtualTransferPanel
      v-bind="$props"
      v-slot="{ option }"
      ref="leftPanel"
      class="flex-1"
      :data="sourceData"
      :title="titles[0] || $t('packages_component_transfer_titles_0')"
      :default-checked="leftDefaultChecked"
      :placeholder="filterPlaceholder || $t('packages_component_filter_placeholder')"
      @checked-change="onSourceCheckedChange"
    >
      <slot name="left" :option="option"></slot>
      <slot name="left-footer"></slot>
    </VirtualTransferPanel>
    <div class="inline-flex flex-column">
      <div class="el-transfer__buttons flex-column flex-1">
        <!-- class="mb-0 mr-4" -->
        <el-button
          type="primary"
          :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
          @click="addToLeft()"
          :disabled="topChecked.length === 0"
        >
          <el-icon><el-icon-arrow-left /></el-icon>
          <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
        </el-button>
        <el-button
          type="primary"
          class="mb-0"
          :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
          @click="addToRight()"
          :disabled="leftChecked.length === 0"
        >
          <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
          <el-icon><el-icon-arrow-right /></el-icon>
        </el-button>
      </div>
      <div class="el-transfer__buttons flex-column flex-1">
        <!-- class="mb-0 mr-4" -->
        <el-button
          type="primary"
          :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
          @click="addToLeft('bottom')"
          :disabled="bottomChecked.length === 0"
        >
          <el-icon><el-icon-arrow-left /></el-icon>
          <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
        </el-button>
        <el-button
          type="primary"
          class="mb-0"
          :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
          @click="addToRight('bottom')"
          :disabled="leftChecked.length === 0"
        >
          <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
          <el-icon><el-icon-arrow-right /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="inline-flex flex-column flex-1">
      <VirtualTransferPanel
        v-bind="$props"
        v-slot="{ option }"
        ref="rightPanel"
        class="w-100 mb-4"
        :data="rightTopData"
        :title="titles[1] || $t('packages_component_transfer_titles_1')"
        :default-checked="rightTopDefaultChecked"
        :placeholder="filterPlaceholder || $t('packages_component_filter_placeholder')"
        @checked-change="onTargetCheckedChange('top', ...arguments)"
      >
        <slot name="right" :option="option"></slot>
        <slot name="right-footer"></slot>
      </VirtualTransferPanel>
      <VirtualTransferPanel
        v-bind="$props"
        v-slot="{ option }"
        ref="rightPanel"
        class="w-100"
        :data="rightBottomData"
        :title="titles[2] || $t('packages_component_transfer_titles_1')"
        :default-checked="rightBottomDefaultChecked"
        :placeholder="filterPlaceholder || $t('packages_component_filter_placeholder')"
        @checked-change="onTargetCheckedChange('bottom', ...arguments)"
      >
        <slot name="right" :option="option"></slot>
        <slot name="right-footer"></slot>
      </VirtualTransferPanel>
    </div>
  </div>
</template>

<script>
import { ArrowLeft as ElIconArrowLeft, ArrowRight as ElIconArrowRight } from '@element-plus/icons'
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import { ElTransfer as Transfer } from 'element-plus'
import { VirtualTransferPanel } from '@tap/component'

export default {
  components: {
    VirtualTransferPanel,
    ElIconArrowLeft,
    ElIconArrowRight
  },
  name: 'MqTransfer',
  extends: Transfer,
  props: {
    topValue: {
      type: Array,
      default() {
        return []
      }
    },
    bottomValue: {
      type: Array,
      default() {
        return []
      }
    },
    rightTopDefaultChecked: {
      type: Array,
      default() {
        return []
      }
    },
    rightBottomDefaultChecked: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      topChecked: [],
      bottomChecked: []
    }
  },
  computed: {
    sourceData() {
      const allValue = [...this.topValue, ...this.bottomValue]
      const valueObj = {}
      allValue.forEach(item => {
        valueObj[item] = true
      })
      return this.data.filter(item => !valueObj[item[this.props.key]])
    },

    rightTopData() {
      let data
      if (this.targetOrder === 'original') {
        const valueObj = {}
        this.topValue.forEach(item => {
          valueObj[item] = true
        })
        data = this.data.filter(item => valueObj[item[this.props.key]])
      } else {
        data = this.topValue.reduce((arr, cur) => {
          const val = this.dataObj[cur]
          if (val) {
            arr.push(val)
          }
          return arr
        }, [])
      }
      return data
    },

    rightBottomData() {
      let data
      if (this.targetOrder === 'original') {
        const valueObj = {}
        this.bottomValue.forEach(item => {
          valueObj[item] = true
        })
        data = this.data.filter(item => valueObj[item[this.props.key]])
      } else {
        data = this.bottomValue.reduce((arr, cur) => {
          const val = this.dataObj[cur]
          if (val) {
            arr.push(val)
          }
          return arr
        }, [])
      }
      return data
    }
  },
  methods: {
    onTargetCheckedChange(from, val, movedKeys) {
      this[`${from}Checked`] = val
      if (movedKeys === undefined) return
      $emit(this, 'right-top-check-change', val, movedKeys)
    },

    addToLeft(from = 'top') {
      const valueKey = `${from}Value`
      let currentValue = this[valueKey].slice()
      const currentChecked = this[`${from}Checked`]
      currentChecked.forEach(item => {
        const index = currentValue.indexOf(item)
        if (index > -1) {
          currentValue.splice(index, 1)
        }
      })
      $emit(this, `update:${valueKey}`, currentValue)
      $emit(this, 'change', currentValue, 'left', currentChecked)
    },

    addToRight(to = 'top') {
      const valueKey = `${to}Value`
      const allValue = [...this.topValue, ...this.bottomValue]
      let currentValue = this[valueKey].slice()
      const itemsToBeMoved = []
      const key = this.props.key

      let leftCheckedKeyPropsObj = {}
      this.leftChecked.forEach(item => {
        leftCheckedKeyPropsObj[item] = true
      })

      let valueKeyPropsObj = {}
      allValue.forEach(item => {
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

      $emit(this, `update:${valueKey}`, currentValue)
      $emit(this, 'change', currentValue, `right-${to}`, this.leftChecked)
    }
  },
  emits: ['right-top-check-change', , 'change']
}
</script>

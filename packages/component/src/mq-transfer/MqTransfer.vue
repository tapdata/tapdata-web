<script>
import VirtualTransferPanel from '@tap/component/src/base/virtual-transfer/VirtualTransferPanel.vue'
import { ElTransfer as Transfer } from 'element-plus'

export default {
  name: 'MqTransfer',
  components: {
    VirtualTransferPanel,
    ElIconArrowRight,
  },
  extends: Transfer,
  props: {
    topValue: {
      type: Array,
      default() {
        return []
      },
    },
    bottomValue: {
      type: Array,
      default() {
        return []
      },
    },
    rightTopDefaultChecked: {
      type: Array,
      default() {
        return []
      },
    },
    rightBottomDefaultChecked: {
      type: Array,
      default() {
        return []
      },
    },
  },
  emits: ['right-top-check-change', , 'change'],
  data() {
    return {
      topChecked: [],
      bottomChecked: [],
    }
  },
  computed: {
    sourceData() {
      const allValue = [...this.topValue, ...this.bottomValue]
      const valueObj = {}
      allValue.forEach((item) => {
        valueObj[item] = true
      })
      return this.data.filter((item) => !valueObj[item[this.props.key]])
    },

    rightTopData() {
      let data
      if (this.targetOrder === 'original') {
        const valueObj = {}
        this.topValue.forEach((item) => {
          valueObj[item] = true
        })
        data = this.data.filter((item) => valueObj[item[this.props.key]])
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
        this.bottomValue.forEach((item) => {
          valueObj[item] = true
        })
        data = this.data.filter((item) => valueObj[item[this.props.key]])
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
    },
  },
  methods: {
    onTargetCheckedChange(from, val, movedKeys) {
      this[`${from}Checked`] = val
      if (movedKeys === undefined) return
      this.$emit('right-top-check-change', val, movedKeys)
    },

    addToLeft(from = 'top') {
      const valueKey = `${from}Value`
      const currentValue = this[valueKey].slice()
      const currentChecked = this[`${from}Checked`]
      currentChecked.forEach((item) => {
        const index = currentValue.indexOf(item)
        if (index !== -1) {
          currentValue.splice(index, 1)
        }
      })
      this.$emit(`update:${valueKey}`, currentValue)
      this.$emit('change', currentValue, 'left', currentChecked)
    },

    addToRight(to = 'top') {
      const valueKey = `${to}Value`
      const allValue = [...this.topValue, ...this.bottomValue]
      let currentValue = this[valueKey].slice()
      const itemsToBeMoved = []
      const key = this.props.key

      const leftCheckedKeyPropsObj = {}
      this.leftChecked.forEach((item) => {
        leftCheckedKeyPropsObj[item] = true
      })

      const valueKeyPropsObj = {}
      allValue.forEach((item) => {
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

      this.$emit(`update:${valueKey}`, currentValue)
      this.$emit('change', currentValue, `right-${to}`, this.leftChecked)
    },
  },
}
</script>

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
      :placeholder="
        filterPlaceholder || $t('packages_component_filter_placeholder')
      "
      @checked-change="onSourceCheckedChange"
    >
      <slot name="left" :option="option" />
      <slot name="left-footer" />
    </VirtualTransferPanel>
    <div class="inline-flex flex-column">
      <div class="el-transfer__buttons flex-column flex-1">
        <!-- class="mb-0 mr-4" -->
        <el-button
          type="primary"
          :class="[
            'el-transfer__button',
            hasButtonTexts ? 'is-with-texts' : '',
          ]"
          :disabled="topChecked.length === 0"
          @click="addToLeft()"
        >
          <el-icon><el-icon-arrow-left /></el-icon>
          <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
        </el-button>
        <el-button
          type="primary"
          class="mb-0"
          :class="[
            'el-transfer__button',
            hasButtonTexts ? 'is-with-texts' : '',
          ]"
          :disabled="leftChecked.length === 0"
          @click="addToRight()"
        >
          <span v-if="buttonTexts[1] !== undefined">{{ buttonTexts[1] }}</span>
          <el-icon><el-icon-arrow-right /></el-icon>
        </el-button>
      </div>
      <div class="el-transfer__buttons flex-column flex-1">
        <!-- class="mb-0 mr-4" -->
        <el-button
          type="primary"
          :class="[
            'el-transfer__button',
            hasButtonTexts ? 'is-with-texts' : '',
          ]"
          :disabled="bottomChecked.length === 0"
          @click="addToLeft('bottom')"
        >
          <el-icon><el-icon-arrow-left /></el-icon>
          <span v-if="buttonTexts[0] !== undefined">{{ buttonTexts[0] }}</span>
        </el-button>
        <el-button
          type="primary"
          class="mb-0"
          :class="[
            'el-transfer__button',
            hasButtonTexts ? 'is-with-texts' : '',
          ]"
          :disabled="leftChecked.length === 0"
          @click="addToRight('bottom')"
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
        :placeholder="
          filterPlaceholder || $t('packages_component_filter_placeholder')
        "
        @checked-change="onTargetCheckedChange('top', ...arguments)"
      >
        <slot name="right" :option="option" />
        <slot name="right-footer" />
      </VirtualTransferPanel>
      <VirtualTransferPanel
        v-bind="$props"
        v-slot="{ option }"
        ref="rightPanel"
        class="w-100"
        :data="rightBottomData"
        :title="titles[2] || $t('packages_component_transfer_titles_1')"
        :default-checked="rightBottomDefaultChecked"
        :placeholder="
          filterPlaceholder || $t('packages_component_filter_placeholder')
        "
        @checked-change="onTargetCheckedChange('bottom', ...arguments)"
      >
        <slot name="right" :option="option" />
        <slot name="right-footer" />
      </VirtualTransferPanel>
    </div>
  </div>
</template>

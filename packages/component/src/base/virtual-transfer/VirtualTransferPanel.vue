<template>
  <div class="el-transfer-panel">
    <p class="el-transfer-panel__header">
      <el-checkbox v-model="allChecked" @change="handleAllCheckedChange" :indeterminate="isIndeterminate">
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>

    <div :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']">
      <el-input
        class="el-transfer-panel__filter"
        v-model="query"
        size="small"
        :placeholder="placeholder"
        @input="handleQueryInput"
        @mouseenter.native="inputHover = true"
        @mouseleave.native="inputHover = false"
        v-if="filterable"
      >
        <i slot="prefix" :class="['el-input__icon', 'el-icon-' + inputIcon]" @click="clearQuery"></i>
      </el-input>
      <el-checkbox-group
        v-model="checked"
        v-show="!hasNoMatch && data.length > 0"
        :class="{ 'is-filterable': filterable }"
        class="el-transfer-panel__list"
      >
        <RecycleScroller
          ref="scroller"
          class="el-transfer-panel__scroller"
          :key-field="keyProp"
          :item-size="36"
          :buffer="50"
          :items="filteredData"
        >
          <template #default="{ item }">
            <el-checkbox
              class="el-transfer-panel__item"
              :label="item[keyProp]"
              :disabled="item[disabledProp]"
              :key="item[keyProp]"
            >
              <option-content :option="item"></option-content>
            </el-checkbox>
          </template>
        </RecycleScroller>
      </el-checkbox-group>
      <p class="el-transfer-panel__empty" v-show="hasNoMatch">{{ $t('packages_component_no_match') }}</p>
      <p class="el-transfer-panel__empty" v-show="data.length === 0 && !hasNoMatch">
        {{ $t('packages_component_no_data') }}
      </p>
    </div>
    <p class="el-transfer-panel__footer" v-if="hasFooter">
      <slot></slot>
    </p>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { Transfer } from 'element-ui'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
const TransferPanel = cloneDeep(Transfer.components.TransferPanel)

delete TransferPanel.watch.checked

export default {
  name: 'VirtualTransferPanel',

  components: {
    RecycleScroller,

    OptionContent: {
      props: {
        option: Object
      },
      render(h) {
        const getParent = vm => {
          if (vm.$options.name === 'VirtualTransferPanel') {
            return vm
          } else if (vm.$parent) {
            return getParent(vm.$parent)
          } else {
            return vm
          }
        }
        const panel = getParent(this)
        const transfer = panel.$parent || panel
        const transferSlots = transfer.$scopedSlots

        return panel.renderContent ? (
          panel.renderContent(h, this.option)
        ) : transferSlots.default ? (
          transferSlots.default({ option: this.option })
        ) : transferSlots.left || transferSlots.right ? (
          panel.$scopedSlots.default({ option: this.option }) || (
            <span>{this.option[panel.labelProp] || this.option[panel.keyProp]}</span>
          )
        ) : (
          <span>{this.option[panel.labelProp] || this.option[panel.keyProp]}</span>
        )
      }
    }
  },

  extends: TransferPanel,

  props: {
    buffer: {
      type: Number,
      default: 50
    },
    itemSize: {
      type: Number,
      default: null
    },
    searchAfterScrollTop: {
      type: Boolean,
      default: true
    }
  },

  watch: {
    checked(val, oldVal) {
      // console.time('checked')
      this.updateAllChecked()

      const newObj = {}
      val.every(item => {
        newObj[item] = true
      })
      const oldObj = {}
      oldVal.every(item => {
        oldObj[item] = true
      })
      if (this.checkChangeByUser) {
        const movedKeys = val.concat(oldVal).filter(v => newObj[v] || oldVal[v])
        this.$emit('checked-change', val, movedKeys)
      } else {
        this.$emit('checked-change', val)
        this.checkChangeByUser = true
      }
      // console.timeEnd('checked')
    }
  },

  methods: {
    updateAllChecked() {
      // console.time('do-updateAllChecked')
      const checkObj = {}
      this.checked.forEach(item => {
        checkObj[item] = true
      })
      this.allChecked =
        this.checkableData.length > 0 &&
        this.checked.length > 0 &&
        this.checkableData.every(item => checkObj[item[this.keyProp]])
      // console.timeEnd('do-updateAllChecked')
    },

    handleQueryInput() {
      if (this.searchAfterScrollTop) {
        this.$refs.scroller.scrollToPosition(0)
        this.$refs.scroller.updateVisibleItems(false)
      }
    },

    clearQuery() {
      if (this.inputIcon === 'circle-close') {
        this.query = ''
        this.handleQueryInput()
      }
    }
  }
}
</script>

<style>
.el-transfer-panel__scroller {
  height: 100%;
}
</style>

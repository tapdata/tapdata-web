<script lang="jsx">
import { ElTransfer as Transfer } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import * as Vue from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { $emit } from '../../../utils/gogocodeTransfer'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
const TransferPanel = cloneDeep(Transfer.components.TransferPanel)

delete TransferPanel.watch.checked

export default {
  name: 'VirtualTransferPanel',
  components: {
    RecycleScroller,

    OptionContent: {
      props: {
        option: Object,
      },
      render() {
        const getParent = (vm) => {
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
        const transferSlots = transfer.$slots

        return panel.renderContent ? (
          panel.renderContent(Vue.h, this.option)
        ) : transferSlots.default ? (
          transferSlots.default({ option: this.option })
        ) : transferSlots.left || transferSlots.right ? (
          (panel.$slots.default && panel.$slots.default())({
            option: this.option,
          }) || (
            <span>
              {this.option[panel.labelProp] || this.option[panel.keyProp]}
            </span>
          )
        ) : (
          <span>
            {this.option[panel.labelProp] || this.option[panel.keyProp]}
          </span>
        )
      },
    },
  },
  extends: TransferPanel,
  props: {
    buffer: {
      type: Number,
      default: 50,
    },
    itemSize: {
      type: Number,
      default: null,
    },
    searchAfterScrollTop: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['checked-change'],
  watch: {
    checked(val, oldVal) {
      // console.time('checked')
      this.updateAllChecked()

      const newObj = {}
      val.every((item) => {
        newObj[item] = true
      })
      const oldObj = {}
      oldVal.every((item) => {
        oldObj[item] = true
      })
      if (this.checkChangeByUser) {
        const movedKeys = val
          .concat(oldVal)
          .filter((v) => newObj[v] || oldVal[v])
        $emit(this, 'checked-change', val, movedKeys)
      } else {
        $emit(this, 'checked-change', val)
        this.checkChangeByUser = true
      }
      // console.timeEnd('checked')
    },
  },
  methods: {
    updateAllChecked() {
      // console.time('do-updateAllChecked')
      const checkObj = {}
      this.checked.forEach((item) => {
        checkObj[item] = true
      })
      this.allChecked =
        this.checkableData.length > 0 &&
        this.checked.length > 0 &&
        this.checkableData.every((item) => checkObj[item[this.keyProp]])
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
    },
  },
}
</script>

<template>
  <div class="el-transfer-panel">
    <p class="el-transfer-panel__header">
      <el-checkbox
        v-model="allChecked"
        :indeterminate="isIndeterminate"
        @change="handleAllCheckedChange"
      >
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </el-checkbox>
    </p>

    <div
      :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']"
    >
      <el-input
        v-if="filterable"
        v-model="query"
        class="el-transfer-panel__filter"
        :placeholder="placeholder"
        @input="handleQueryInput"
        @mouseenter="inputHover = true"
        @mouseleave="inputHover = false"
      >
        <template #prefix>
          <i
            :class="['el-input__icon', `el-icon-${inputIcon}`]"
            @click="clearQuery"
          />
        </template>
      </el-input>
      <el-checkbox-group
        v-show="!hasNoMatch && data.length > 0"
        v-model="checked"
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
              :key="item[keyProp]"
              class="el-transfer-panel__item"
              :label="item[keyProp]"
              :disabled="item[disabledProp]"
            >
              <option-content :option="item" />
            </el-checkbox>
          </template>
        </RecycleScroller>
      </el-checkbox-group>
      <p v-show="hasNoMatch" class="el-transfer-panel__empty">
        {{ $t('packages_component_no_match') }}
      </p>
      <p
        v-show="data.length === 0 && !hasNoMatch"
        class="el-transfer-panel__empty"
      >
        {{ $t('public_data_no_data1') }}
      </p>
    </div>
    <p v-if="hasFooter" class="el-transfer-panel__footer">
      <slot />
    </p>
  </div>
</template>

<style>
.el-transfer-panel__scroller {
  height: 100%;
}
</style>

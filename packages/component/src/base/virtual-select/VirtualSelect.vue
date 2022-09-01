<template>
  <div
    class="el-select"
    :class="[selectSize ? 'el-select--' + selectSize : '']"
    @click.stop="toggleMenu"
    v-clickoutside="handleClose"
  >
    <div
      class="el-select__tags"
      v-if="multiple"
      ref="tags"
      :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }"
    >
      <span v-if="collapseTags && selected.length">
        <el-tag
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="selected[0].hitState"
          type="info"
          @close="deleteTag($event, selected[0])"
          disable-transitions
        >
          <span class="el-select__tags-text">{{ selected[0].currentLabel }}</span>
        </el-tag>
        <el-tag v-if="selected.length > 1" :closable="false" :size="collapseTagSize" type="info" disable-transitions>
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group @after-leave="resetInputHeight" v-if="!collapseTags">
        <el-tag
          v-for="item in selected"
          :key="getValueKey(item)"
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="item.hitState"
          type="info"
          @close="deleteTag($event, item)"
          disable-transitions
        >
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>

      <input
        type="text"
        class="el-select__input"
        :class="[selectSize ? `is-${selectSize}` : '']"
        :disabled="selectDisabled"
        :autocomplete="autoComplete || autocomplete"
        @focus="handleFocus"
        @blur="softFocus = false"
        @keyup="managePlaceholder"
        @keydown="resetInputState"
        @keydown.down.prevent="navigateOptions('next')"
        @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption"
        @keydown.esc.stop.prevent="visible = false"
        @keydown.delete="deletePrevTag"
        @keydown.tab="visible = false"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        v-model="query"
        @input="debouncedQueryChange"
        v-if="filterable"
        :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }"
        ref="input"
      />
    </div>
    <ElInput
      ref="reference"
      v-model="selectedLabel"
      :id="id"
      type="text"
      :name="name"
      :placeholder="currentPlaceholder"
      :autocomplete="autoComplete || autocomplete"
      :size="selectSize"
      :disabled="selectDisabled"
      :readonly="readonly"
      :validate-event="false"
      :class="{ 'is-focus': visible }"
      :tabindex="multiple && filterable ? '-1' : null"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.native="debouncedOnInputChange"
      @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')"
      @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false"
      @keydown.native.tab.stop.prevent="visible = false"
      @paste.native="debouncedOnInputChange"
      @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false"
    >
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix" />
      </template>
      <template slot="suffix">
        <span v-if="loading" class="el-select__loading">
          <svg
            viewBox="0 0 1024 1024"
            focusable="false"
            data-icon="loading"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"
            ></path>
          </svg>
        </span>
        <template v-else>
          <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]" />
          <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick" />
        </template>
      </template>
    </ElInput>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <ElSelectMenu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <div
          class="el-select-dropdown__wrap el-scrollbar__wrap virtual-scroller-wrap"
          v-show="filteredItems.length > 0 && !loading"
        >
          <RecycleScroller
            ref="virtualScroller"
            :items="filteredItems"
            :buffer="buffer"
            key-field="value"
            :item-size="itemSize"
            class="scroller"
            :style="scrollerStyle"
          >
            <template #before>
              <slot name="before" />
            </template>
            <template #default="{ item, index, active }">
              <slot :item="item" :index="index" :active="active">
                <ElOption :key="item.value" :label="item.label" :value="item.value" />
              </slot>
            </template>
            <template #after>
              <slot name="after" />
            </template>
          </RecycleScroller>
        </div>
        <template v-if="emptyText && (!allowCreate || loading || (allowCreate && filteredItems.length === 0))">
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="el-select-dropdown__empty" v-else>
            {{ emptyText }}
          </p>
        </template>
      </ElSelectMenu>
    </transition>
  </div>
</template>

<script>
import { Select } from 'element-ui'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { getValueByPath } from 'element-ui/lib/utils/util'

export default {
  name: 'VirtualSelect',

  components: {
    RecycleScroller
  },

  extends: Select,

  props: {
    items: {
      type: Array,
      required: true
    },
    buffer: {
      type: Number,
      default: 30
    },
    itemSize: {
      type: Number,
      default: null
    },
    filterDelay: {
      type: Number,
      default: 200
    }
  },

  data() {
    return {
      lazySearch: '',
      filteredItems: this.items
    }
  },

  computed: {
    scrollerStyle() {
      const count = Math.min(this.filteredItems.length, 5)
      const height = this.itemSize * count
      return `height: ${height}px`
    },

    debounce() {
      return this.filterDelay
    },

    emptyText() {
      if (this.loading) {
        return this.loadingText || this.$t('loading')
      } else {
        if (this.remote && this.query === '' && this.options.length === 0) return false
        if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
          return this.noMatchText || this.$t('no_match')
        }
        if (this.filteredItems.length === 0) {
          return this.noDataText || this.$t('no_data')
        }
      }
      return null
    }
  },

  watch: {
    items(val) {
      this.filteredItems = val
    },
    visible(val) {
      if (val) {
        this.filteredItems = this.items
      }
    }
  },

  methods: {
    handleQueryChange(val) {
      if (this.previousQuery === val || this.isOnComposition) return
      if (
        this.previousQuery === null &&
        (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')
      ) {
        this.previousQuery = val
        return
      }
      this.previousQuery = val
      this.$nextTick(() => {
        if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper')
      })
      this.hoverIndex = -1
      if (this.multiple && this.filterable) {
        this.$nextTick(() => {
          const length = this.$refs.input.value.length * 15 + 20
          this.inputLength = this.collapseTags ? Math.min(50, length) : length
          this.managePlaceholder()
          this.resetInputHeight()
        })
      }
      if (this.remote && typeof this.remoteMethod === 'function') {
        this.hoverIndex = -1
        this.remoteMethod(val)
      } else if (typeof this.filterMethod === 'function') {
        this.filterMethod(val)
        this.broadcast('ElOptionGroup', 'queryChange')
      } else {
        if (val) {
          this.filteredItems = this.items.filter(item => {
            return item.label.toLowerCase().includes(val.toLowerCase())
          })
        } else {
          this.filteredItems = this.items
        }
        this.filteredOptionsCount = this.filteredItems.length
      }
      if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
        this.checkDefaultFirstOption()
      }
    },

    scrollToOption(option) {
      const $option = Array.isArray(option) ? option[0] : option
      if ($option) {
        const { value } = $option
        const index = this.items.findIndex(item => item.value === value)
        this.$refs.virtualScroller.scrollToItem(index)
      }
    },

    getOption(value) {
      let option
      const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]'
      const isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]'
      const isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]'

      for (let i = this.items.length - 1; i >= 0; i--) {
        const cachedOption = this.items[i]
        const isEqual = isObject
          ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
          : cachedOption.value === value
        if (isEqual) {
          option = { ...cachedOption, currentLabel: cachedOption.label }
          break
        }
      }
      if (option) return option
      const label = !isObject && !isNull && !isUndefined ? String(value) : ''
      let newOption = {
        value: value,
        currentLabel: label
      }
      if (this.multiple) {
        newOption.hitState = false
      }
      return newOption
    }
  }
}
</script>

<style lang="scss" scoped>
.scroller {
  height: 274px;
}
.virtual-scroller-wrap {
  position: relative;
  padding: 6px 0;
  overflow: hidden;
}
</style>

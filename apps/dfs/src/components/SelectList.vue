<template>
  <div
    class="v-select-list el-select"
    :class="[selectSize ? 'el-select--' + selectSize : '', { 'none-border': noneBorder }]"
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
        <ElTag
          :closable="!selectDisabled"
          :size="collapseTagSize"
          :hit="selected[0].hitState"
          type="info"
          @close="deleteTag($event, selected[0])"
          disable-transitions
        >
          <span class="el-select__tags-text">{{ selected[0].currentLabel }}</span>
        </ElTag>
        <ElTag v-if="selected.length > 1" :closable="false" :size="collapseTagSize" type="info" disable-transitions>
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </ElTag>
      </span>
      <TransitionGroup @after-leave="resetInputHeight" v-if="!collapseTags">
        <ElTag
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
        </ElTag>
      </TransitionGroup>

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
      v-if="!innerLabel"
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
      <template slot="prepend" v-if="$slots.prepend">
        <slot name="prepend" />
      </template>
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix" />
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]" />
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-circle-close" @click="handleClearClick" />
      </template>
    </ElInput>
    <div
      v-else
      ref="reference"
      :class="['inner-select', { 'is-focus': visible }, 'inline-flex align-items-center']"
      :validate-event="false"
      @mouseenter="inputHovering = true"
      @mouseleave="inputHovering = false"
    >
      <span class="inner-select__label">{{ innerLabel }}</span>
      <span
        :class="['inner-select__selected', { placeholder: !selectedLabel }]"
        :style="{ 'max-width': selectedWidth }"
        >{{ selectedLabel || $t('gl_placeholder_select') }}</span
      >
      <VIcon v-if="showClose" size="10" class="icon-btn ml-1" @click.native="handleClearClick">close</VIcon>
      <VIcon v-else size="10" class="icon-btn ml-1">arrow-down-fill</VIcon>
    </div>
    <div v-if="loading" class="el-select__loading">
      <i class="el-icon-loading"></i>
    </div>
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
            @scroll.native="scrollFnc"
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
              <slot name="after">
                <div v-if="!!lastPageText && isLastPage" class="pl-5 py-2 fs-7 font-color-disable">
                  {{ lastPageText }}
                </div>
              </slot>
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
import i18n from '@/i18n'

import { deepCopy, uniqueArr } from '@/util'
import { Select } from 'element-ui'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VIcon from '@/components/VIcon'

export default {
  name: 'SelectList',

  components: {
    RecycleScroller,
    VIcon
  },

  extends: Select,

  props: {
    items: {
      type: [Array, Function],
      default: () => []
    },
    buffer: {
      type: Number,
      default: 30
    },
    itemSize: {
      type: Number,
      default: 30
    },
    filterDelay: {
      type: Number,
      default: 200
    },
    url: {
      type: String
    },
    params: {
      type: Object,
      default: () => {}
    },
    labelKey: {
      type: String,
      default: 'name'
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    filterKey: {
      type: String,
      default: 'name'
    },
    // 回填搜索的key
    echoKey: {
      type: String,
      default: 'id'
    },
    lastPageText: {
      type: String,
      default: i18n.t('components_SelectList_meiYouGengDuoShu')
    },
    menuMinWidth: {
      type: String,
      default: '200px'
    },
    innerLabel: {
      type: String
    },
    formatData: {
      type: Function
    },
    noneBorder: {
      type: Boolean
    },
    selectedWidth: {
      type: String,
      default: '80px'
    }
  },

  data() {
    return {
      list: [], // 本地数据
      filteredItems: [],
      pageObj: {
        size: 50,
        page: 1,
        totalPage: 1
      }
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
        return this.loadingText || this.t('el.select.loading')
      } else {
        if (this.remote && this.query === '' && this.options.length === 0) return false
        if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
          return this.noMatchText || this.t('el.select.noMatch')
        }
        if (this.filteredItems.length === 0) {
          return this.noDataText || this.t('el.select.noData')
        }
      }
      return null
    },
    // 是否最后一页
    isLastPage() {
      const { page, totalPage } = this.pageObj
      return page >= totalPage
    },
    // 是否远程数据
    isRemote() {
      return !!this.url
    }
    // comItems() {
    //   const { items } = this
    //   if (typeof items === 'function') {
    //     return items()
    //   }
    //   return items || []
    // }
  },

  watch: {
    visible(val) {
      val && this.initWidth()
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      if (this.isRemote) {
        this.resetPage()
        this.value && this.getSelectLabel() // 回显
        this.getData()
      } else {
        const { items } = this
        if (typeof items === 'function') {
          this.list = await this.items()
        } else {
          this.list = deepCopy(this.items)
        }
        this.filteredItems = deepCopy(this.list)
        this.getSelectLabel()
      }
    },
    initWidth() {
      // 设置列表的宽度
      const { menuMinWidth } = this
      if (menuMinWidth) {
        this.$nextTick(() => {
          this.$refs.popper.minWidth = menuMinWidth
        })
      }
    },
    getSelectLabel() {
      const { value } = this
      if (!value) {
        return
      }
      if (this.isRemote) {
        this.getData(this.value, false, true)
        return
      }
      this.$nextTick(() => {
        this.selectedLabel = this.list.find(item => item.value === value)?.label
      })
    },
    resetInputWidth() {
      let $reference = this.$refs.reference
      if (!this.innerLabel) {
        $reference = $reference.$el
      }
      this.inputWidth = $reference.getBoundingClientRect().width
    },
    resetPage() {
      let pageObj = this.pageObj
      pageObj.page = 1
      pageObj.totalPage = 1
    },
    /**
     * @param1 val 值
     * @param2 isSearch 是否搜索
     * @param3 isEcho 回显
     * */
    getData(val, isSearch = false, isEcho = false) {
      let { size, page } = this.pageObj
      let filter = deepCopy(
        Object.assign({}, this.params, {
          size: size,
          page: page
        })
      )
      if (isSearch) {
        this.resetPage()
        if (!filter?.where) {
          filter.where = {}
        }
        filter.where[this.filterKey] = val
      }
      if (isEcho) {
        this.resetPage()
        if (!filter?.where) {
          filter.where = {}
        }
        filter.where[this.echoKey] = val
      }
      let comUrl = this.url + '?filter=' + encodeURIComponent(JSON.stringify(filter))
      this.$axios.get(comUrl).then(data => {
        // 格式化数据
        if (this.formatData) {
          data = this.formatData(data, size)
        } else {
          data.items = data.items.map(item => {
            return {
              label: item[this.labelKey],
              value: item[this.valueKey]
            }
          })
        }
        // 分页数据
        if (data.totalPage) {
          this.pageObj.totalPage = data.totalPage
        } else {
          this.pageObj.totalPage = Math.ceil((data.total || 0) / size)
        }
        // 搜索，清空数组
        if (isSearch) {
          this.filteredItems = data.items
        } else {
          this.filteredItems = uniqueArr([...this.filteredItems, ...data.items], 'value')
        }
        // 回显
        if (isEcho) {
          this.selectedLabel = this.filteredItems.find(item => item.value === this.value)?.label
        }
      })
    },
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
        // 远程数据
        if (this.isRemote) {
          if (val) {
            let findone = this.filteredItems.filter(item => {
              return item.label === val && item.value === this.value
            })
            if (findone?.length === 0) {
              this.getData({ $regex: val, $options: 'i' }, true)
            }
          } else {
            this.init()
          }
        } else {
          // 本地数据
          if (val) {
            this.filteredItems = this.list.filter(item => {
              return item.label.indexOf(val) !== -1
            })
          } else {
            this.filteredItems = deepCopy(this.list)
          }
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
        const index = this.filteredItems.findIndex(item => item.value === value)
        this.$refs.virtualScroller.scrollToItem(index)
      }
    },
    scrollFnc(e) {
      let { target } = e
      if (this.isRemote && target.scrollHeight - target.scrollTop <= target.clientHeight) {
        this.loadMore()
      }
    },
    loadMore() {
      if (this.isLastPage) {
        return
      }
      this.pageObj.page++
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
.v-select-list {
  &.none-border {
    &:hover {
      background-color: #eff1f4;
      border-radius: 2px;
      .icon-btn {
        color: map-get($fontColor, main);
      }
    }
    ::v-deep {
      .inner-select {
        border-color: transparent;
      }
      .inner-select__selected {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
.scroller {
  height: 274px;
}
.el-select__loading {
  position: absolute;
  top: 0;
  right: 30px;
}
.virtual-scroller-wrap {
  position: relative;
  padding: 6px 0;
  overflow: hidden;
}
.inner-select {
  padding: 0 8px;
  border-radius: 4px;
  cursor: pointer;
}
.inner-select__label {
  color: map-get($fontColor, sub);
}
.inner-select__selected {
  padding-left: 8px;
  color: map-get($fontColor, main);
  &.placeholder {
    //color: map-get($fontColor, sub);
  }
}
.icon-btn {
  color: map-get($fontColor, sub);
}
</style>

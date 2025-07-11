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
      <transition-group tag="span" @after-leave="resetInputHeight" v-if="!collapseTags">
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
        text
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
        v-if="filterable && !innerLabel"
        :style="{
          'flex-grow': '1',
          width: inputLength / (inputWidth - 32) + '%',
          'max-width': inputWidth - 42 + 'px',
        }"
        ref="input"
      />
    </div>
    <ElInput
      v-if="!innerLabel"
      ref="reference"
      v-model="selectedLabel"
      :id="id"
      text
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
      @keyup="debouncedOnInputChange"
      @keydown.down.stop.prevent="navigateOptions('next')"
      @keydown.up.stop.prevent="navigateOptions('prev')"
      @keydown.enter.prevent="selectOption"
      @keydown.esc.stop.prevent="visible = false"
      @keydown.tab.stop.prevent="visible = false"
      @paste="debouncedOnInputChange"
      @mouseenter="inputHovering = true"
      @mouseleave="inputHovering = false"
    >
      <template v-if="$slots.prepend" v-slot:prepend>
        <slot name="prepend" />
      </template>
      <template v-if="$slots.prefix" v-slot:prefix>
        <slot name="prefix" />
      </template>
      <template v-slot:suffix>
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]" />
        <el-icon class="el-select__caret el-input__icon">
          <el-icon-circle-close />
        </el-icon>
      </template>
    </ElInput>
    <div
      v-else
      ref="reference"
      class="rounded-4"
      :class="['inner-select', { 'is-focus': visible }, 'inline-flex align-items-center']"
      :validate-event="false"
      @mouseenter="inputHovering = true"
      @mouseleave="inputHovering = false"
    >
      <input type="hidden" />
      <span class="inner-select__label">{{ innerLabel }}</span>
      <slot name="label">
        <span
          :class="['inner-select__selected', { placeholder: !selectedLabel }]"
          :style="{ 'max-width': selectedWidth }"
          >{{ selectedLabel || currentPlaceholder || $t('public_select_placeholder') }}</span
        >
      </slot>

      <VIcon v-if="showClose" size="10" class="icon-btn ml-1" @click="handleClearClick">close</VIcon>
      <VIcon v-else size="10" class="icon-btn ml-1">arrow-down-fill</VIcon>
    </div>
    <div v-if="loading" class="el-select__loading">
      <el-icon>
        <el-icon-loading />
      </el-icon>
    </div>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <ElSelectMenu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <input v-if="!filterable" type="hidden" ref="input" />
        <div v-if="filterable && innerLabel" class="py-1 px-2 border-bottom fs-7" @click.stop.prevent>
          <ElInput
            :class="['no-border', selectSize ? `is-${selectSize}` : '']"
            :disabled="selectDisabled"
            :autocomplete="autoComplete || autocomplete"
            :placeholder="$t('public_button_search')"
            v-model="keyword"
            @input="handleSearch"
            ref="input"
            clearable
            @click.stop.prevent
          >
            <template #prefix>
              <ElIcon>
                <ElIconSearch />
              </ElIcon>
            </template>
          </ElInput>
        </div>
        <div v-if="multiple && filterable && innerLabel" class="py-2 pl-4 border-bottom fs-7">
          <span :class="[!!selectedCount ? 'font-color-light' : 'color-disable']">
            {{ $t('packages_component_src_selectlist_yixuanze') }}
            <span class="mx-1">{{ selectedCount }}</span>
            {{ $t('packages_component_src_selectlist_xiang') }}
          </span>
          <span
            v-if="!!selectedCount"
            class="ml-2 color-primary cursor-pointer"
            @click.stop.prevent="handleClearClick"
            >{{ $t('packages_component_src_selectlist_qingchuyixuan') }}</span
          >
        </div>
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
            @scroll="scrollFnc"
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
                <div v-if="!!lastPageText && isLastPage" class="pl-5 py-2 fs-7 font-color-slight">
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
import { cloneDeep, uniqBy, debounce } from 'lodash-es'
import { ElSelect as Select } from 'element-plus'
import i18n from '@tap/i18n'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VIcon from './base/VIcon.vue'

export default {
  components: {
    RecycleScroller,
    VIcon,
  },
  name: 'SelectList',
  extends: Select,
  props: {
    value: {
      type: [Number, String],
    },
    items: {
      type: [Array, Function],
      default: () => [],
    },
    buffer: {
      type: Number,
      default: 30,
    },
    itemSize: {
      type: Number,
      default: 30,
    },
    filterDelay: {
      type: Number,
      default: 200,
    },
    url: {
      type: String,
    },
    params: {
      type: Object,
      default: () => {},
    },
    labelKey: {
      type: String,
      default: 'name',
    },
    valueKey: {
      type: String,
      default: 'id',
    },
    filterKey: {
      type: String,
      default: 'name',
    },
    // 回填搜索的key
    echoKey: {
      type: String,
      default: 'id',
    },
    lastPageText: {
      type: String,
      default: () => {
        return i18n.t('packages_component_src_selectlist_meiyougengduoshu')
      },
    },
    menuMinWidth: {
      type: String,
      default: '200px',
    },
    innerLabel: {
      type: String,
    },
    formatData: {
      type: Function,
    },
    noneBorder: {
      type: Boolean,
    },
    selectedWidth: {
      type: String,
      default: '120px',
    },
  },
  data() {
    return {
      list: [], // 本地数据
      filteredItems: [],
      pageObj: {
        size: 50,
        page: 1,
        totalPage: 1,
      },
      keyword: '',
    }
  },
  computed: {
    scrollerStyle() {
      const count = Math.min(this.filteredItems.length, 5)
      const height = this.itemSize * count
      return `height: ${height}px`
    },

    emptyText() {
      if (this.loading) {
        return this.loadingText || this.$t('packages_component_loading')
      } else {
        if (this.remote && ((this.innerLabel && this.keyword === '') || this.query === '') && this.options.length === 0)
          return false
        if (
          this.filterable &&
          ((this.innerLabel && this.keyword) || this.query) &&
          this.options.length > 0 &&
          this.filteredOptionsCount === 0
        ) {
          return this.noMatchText || this.$t('packages_component_no_match')
        }
        if (this.filteredItems.length === 0) {
          return this.noDataText || this.$t('public_data_no_data1')
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
    },

    // 获取已选中的数量
    selectedCount() {
      return this.multiple ? this.value.length : this.value ? 1 : 0
    },
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
      if (val) {
        this.initWidth()
        this.handleClearQuery()
        this.handleFocusSearch()
      }
    },
    value() {
      this.getSelectLabel()
    },
    items: {
      deep: true,
      handler(v1, v2) {
        if (v1 && v2 && JSON.stringify(v1) !== JSON.stringify(v2)) {
          this.init()
        }
      },
    },
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
          this.list = cloneDeep(this.items)
        }
        this.filteredItems = cloneDeep(this.list)
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
        this.selectedLabel = this.list.find((item) => item.value === value)?.label
      })
    },
    resetInputWidth() {
      this.inputWidth = this.$refs.reference?.$el?.getBoundingClientRect()?.width || 0
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
      let filter = cloneDeep(
        Object.assign({}, this.params, {
          size: size,
          page: page,
        }),
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
      this.$axios.get(comUrl).then((data) => {
        // 格式化数据
        if (this.formatData) {
          data = this.formatData(data, size)
        } else {
          data.items = data.items.map((item) => {
            return {
              label: item[this.labelKey],
              value: item[this.valueKey],
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
          this.filteredItems = uniqBy([...this.filteredItems, ...data.items], 'value')
        }
        // 回显
        if (isEcho) {
          this.selectedLabel = this.filteredItems.find((item) => item.value === this.value)?.label
        }
      })
    },
    handleQueryChange: debounce(function (val) {
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
          const length = (this.$refs.input?.value.length || 0) * 15 + 20
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
            let findone = this.filteredItems.filter((item) => {
              return item.label === val && item.value === this.value
            })
            if (findone?.length === 0) {
              this.getData({ like: val, options: 'i' }, true)
            }
          } else {
            this.init()
          }
        } else {
          // 本地数据
          if (val) {
            this.filteredItems = this.list.filter((item) => {
              return item.label.toLowerCase().indexOf(val.toLowerCase()) !== -1
            })
          } else {
            this.filteredItems = cloneDeep(this.list)
          }
        }

        this.filteredOptionsCount = this.filteredItems.length
      }
      if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
        this.checkDefaultFirstOption()
      }
    }, 100),

    scrollToOption(option) {
      const $option = Array.isArray(option) ? option[0] : option
      if ($option) {
        const { value } = $option
        const index = this.filteredItems.findIndex((item) => item.value === value)
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
    },
    blur() {
      // this.visible = false;
      this.$refs.reference?.blur()
    },
    handleClearQuery() {
      this.keyword = ''
      this.query = ''
      this.handleQueryChange('')
    },
    handleFocusSearch() {
      if (this.filterable && this.innerLabel) {
        this.$refs.input?.focus()
      }
    },
    handleSearch() {
      this.handleQueryChange(this.keyword)
    },
  },
  emits: ['update:value'],
}
</script>

<style lang="scss" scoped>
.v-select-list {
  font-size: 14px;

  &.none-border {
    &:hover {
      background-color: var(--bg-normal);

      .icon-btn {
        color: var(--text-dark);
      }
    }

    :deep(.inner-select) {
      border-color: transparent;
    }

    :deep(.inner-select__selected) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.scroller {
  height: auto;
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
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.inner-select__label {
  color: var(--text-light);
}

.inner-select__selected {
  padding-left: 8px;
  color: var(--text-dark);
}

.icon-btn {
  color: var(--text-slight);
}

.el-select__input {
  &::placeholder {
    color: var(--color-disable);
  }
}
</style>

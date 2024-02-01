<template>
  <div
    ref="selectWrapper"
    v-click-outside:[popperPaneRef]="handleClose"
    :class="wrapperKls"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click.stop="toggleMenu"
  >
    <el-tooltip
      ref="tooltipRef"
      :visible="dropMenuVisible"
      :placement="placement"
      :teleported="teleported"
      :popper-class="[nsSelect.e('popper'), popperClass]"
      :popper-options="popperOptions"
      :fallback-placements="['bottom-start', 'top-start', 'right', 'left']"
      :effect="effect"
      pure
      trigger="click"
      :transition="`${nsSelect.namespace.value}-zoom-in-top`"
      :stop-popper-mouse-event="false"
      :gpu-acceleration="false"
      :persistent="persistent"
      @show="handleMenuEnter"
    >
      <template #default>
        <div class="select-trigger" @mouseenter="inputHovering = true" @mouseleave="inputHovering = false">
          <div v-if="multiple" ref="tags" tabindex="-1" :class="tagsKls" :style="selectTagsStyle" @click="focus">
            <transition v-if="collapseTags && selected.length" @after-leave="resetInputHeight">
              <span :class="tagWrapperKls">
                <el-tag
                  v-for="item in showTagList"
                  :key="getValueKey(item)"
                  :closable="!selectDisabled && !item.isDisabled"
                  :size="collapseTagSize"
                  :hit="item.hitState"
                  :type="tagType"
                  disable-transitions
                  @close="deleteTag($event, item)"
                >
                  <span :class="nsSelect.e('tags-text')" :style="tagTextStyle">
                    {{ item.currentLabel }}
                  </span>
                </el-tag>
                <el-tag
                  v-if="selected.length > maxCollapseTags"
                  :closable="false"
                  :size="collapseTagSize"
                  :type="tagType"
                  disable-transitions
                >
                  <el-tooltip
                    v-if="collapseTagsTooltip"
                    ref="tagTooltipRef"
                    :disabled="dropMenuVisible"
                    :fallback-placements="['bottom', 'top', 'right', 'left']"
                    :effect="effect"
                    placement="bottom"
                    :teleported="teleported"
                  >
                    <template #default>
                      <span :class="nsSelect.e('tags-text')">+ {{ selected.length - maxCollapseTags }}</span>
                    </template>
                    <template #content>
                      <div :class="nsSelect.e('collapse-tags')">
                        <div
                          v-for="item in collapseTagList"
                          :key="getValueKey(item)"
                          :class="nsSelect.e('collapse-tag')"
                        >
                          <el-tag
                            class="in-tooltip"
                            :closable="!selectDisabled && !item.isDisabled"
                            :size="collapseTagSize"
                            :hit="item.hitState"
                            :type="tagType"
                            disable-transitions
                            :style="{ margin: '2px' }"
                            @close="handleDeleteTooltipTag($event, item)"
                          >
                            <span
                              :class="nsSelect.e('tags-text')"
                              :style="{
                                maxWidth: inputWidth - 75 + 'px',
                              }"
                              >{{ item.currentLabel }}</span
                            >
                          </el-tag>
                        </div>
                      </div>
                    </template>
                  </el-tooltip>
                  <span v-else :class="nsSelect.e('tags-text')"
                    >+ {{ selected.length - maxCollapseTags }}</span
                  > </el-tag
                >
              </span>
            </transition>
            <transition v-if="!collapseTags" @after-leave="resetInputHeight">
              <span
                :class="tagWrapperKls"
                :style="prefixWidth && selected.length ? { marginLeft: `${prefixWidth}px` } : ''"
              >
                <el-tag
                  v-for="item in selected"
                  :key="getValueKey(item)"
                  :closable="!selectDisabled && !item.isDisabled"
                  :size="collapseTagSize"
                  :hit="item.hitState"
                  :type="tagType"
                  disable-transitions
                  @close="deleteTag($event, item)"
                >
                  <span :class="nsSelect.e('tags-text')" :style="{ maxWidth: inputWidth - 75 + 'px' }">{{
                    item.currentLabel
                  }}</span>
                </el-tag>
              </span>
            </transition>
            <input
              v-if="filterable && !selectDisabled"
              ref="input"
              v-model="query"
              text
              :class="inputKls"
              :disabled="selectDisabled"
              :autocomplete="autocomplete"
              :style="inputStyle"
              role="combobox"
              :aria-activedescendant="hoverOption?.id || ''"
              :aria-controls="contentId"
              :aria-expanded="dropMenuVisible"
              :aria-label="ariaLabel"
              aria-autocomplete="none"
              aria-haspopup="listbox"
              @focus="handleFocus"
              @blur="handleBlur"
              @keyup="managePlaceholder"
              @keydown="resetInputState"
              @keydown.down.prevent="navigateOptions('next')"
              @keydown.up.prevent="navigateOptions('prev')"
              @keydown.esc="handleKeydownEscape"
              @keydown.enter.stop.prevent="selectOption"
              @keydown.delete="deletePrevTag"
              @keydown.tab="visible = false"
              @compositionstart="handleComposition"
              @compositionupdate="handleComposition"
              @compositionend="handleComposition"
              @input="debouncedQueryChange"
            />
          </div>
          <input
            v-if="isIOS && !multiple && filterable && readonly"
            ref="iOSInput"
            :class="iOSInputKls"
            :disabled="selectDisabled"
            text
          />
          <el-input
            :id="id"
            ref="reference"
            v-model="selectedLabel"
            text
            :placeholder="typeof currentPlaceholder === 'function' ? currentPlaceholder() : currentPlaceholder"
            :name="name"
            :autocomplete="autocomplete"
            :size="selectSize"
            :disabled="selectDisabled"
            :readonly="readonly"
            :validate-event="false"
            :class="[nsSelect.is('focus', visible)]"
            :tabindex="multiple && filterable ? -1 : undefined"
            role="combobox"
            :aria-activedescendant="hoverOption?.id || ''"
            :aria-controls="contentId"
            :aria-expanded="dropMenuVisible"
            :label="ariaLabel"
            aria-autocomplete="none"
            aria-haspopup="listbox"
            @focus="handleFocus"
            @blur="handleBlur"
            @input="debouncedOnInputChange"
            @paste="debouncedOnInputChange"
            @compositionstart="handleComposition"
            @compositionupdate="handleComposition"
            @compositionend="handleComposition"
            @keydown.down.stop.prevent="navigateOptions('next')"
            @keydown.up.stop.prevent="navigateOptions('prev')"
            @keydown.enter.stop.prevent="selectOption"
            @keydown.esc="handleKeydownEscape"
            @keydown.tab="visible = false"
          >
            <template #prefix>
              <div style="height: 100%; display: flex; justify-content: center; align-items: center">
                <slot name="prefix" />
              </div>
            </template>
            <template #suffix>
              <span class="inline-flex align-center">
                <slot v-if="!visible" name="suffix"></slot>
                <span v-if="showLoading" class="el-select__loading">
                  <svg
                    viewBox="0 0 1024 1024"
                    focusable="false"
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
                  <el-icon
                    v-if="iconComponent && !showClose"
                    :class="[nsSelect.e('caret'), nsSelect.e('icon'), iconReverse]"
                  >
                    <component :is="iconComponent" />
                  </el-icon>
                  <el-icon
                    v-if="showClose && clearIcon"
                    :class="[nsSelect.e('caret'), nsSelect.e('icon')]"
                    @click="handleClearClick"
                  >
                    <component :is="clearIcon" />
                  </el-icon>
                </template>
              </span>
            </template>
          </el-input>
        </div>
      </template>
      <template #content>
        <el-select-menu>
          <el-scrollbar
            v-show="options.size > 0 && !loading"
            :id="contentId"
            ref="scrollbar"
            tag="ul"
            :wrap-class="nsSelect.be('dropdown', 'wrap')"
            :view-class="nsSelect.be('dropdown', 'list')"
            :class="scrollbarKls"
            role="listbox"
            :aria-label="ariaLabel"
            aria-orientation="vertical"
          >
            <div v-infinite-scroll="loadMore" :infinite-scroll-disabled="scrollDisabled">
              <el-option v-if="showNewOption" :value="query" :created="true">
                <slot name="created-option" :value="query"></slot>
              </el-option>
              <el-options @update-options="onOptionsRendered">
                <template v-if="itemType === 'string'">
                  <ElOption v-for="item in items" :key="item" :value="item" />
                </template>
                <template v-else>
                  <ElOption
                    v-for="(item, i) in items"
                    :key="item[itemValue]"
                    :label="item[itemLabel]"
                    :value="item[itemValue]"
                    :index="i"
                  />
                </template>
              </el-options>
            </div>
          </el-scrollbar>
          <template v-if="emptyText && (!allowCreate || loading || (allowCreate && options.size === 0))">
            <slot v-if="$slots.empty" name="empty" />
            <p v-else :class="nsSelect.be('dropdown', 'empty')">
              {{ emptyText }}
            </p>
          </template>
        </el-select-menu>
      </template>
    </el-tooltip>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { computed, defineComponent, onMounted, reactive, ref, toRefs, unref, provide, nextTick } from 'vue'
import { useResizeObserver, isIOS } from '@vueuse/core'
import { useId, useLocale, useNamespace, ClickOutside, CHANGE_EVENT, UPDATE_MODEL_EVENT } from 'element-plus'
import { selectKey } from 'element-plus/es/components/select/src/token'
import { useSelect, useSelectStates } from './useSelect'
import { merge, escapeRegExp, uniqBy, debounce, get } from 'lodash'
import { ElSelect as Select } from 'element-plus'
/* unplugin-vue-components disabled */
import ElSelectMenu from 'element-plus/es/components/select/src/select-dropdown'
import { CancelToken } from '@tap/api'
import { isPlainObj, isValid } from '@tap/shared'
import i18n from '@tap/i18n'

export default defineComponent({
  name: 'AsyncSelect',
  extends: Select,
  props: {
    method: {
      type: Function,
      required: true,
    },
    createValidate: Function, // 当allowCreate打开时，验证创建项
    onSetSelected: Function, // 主要是在schema场景下做交互使用
    params: Object,
    itemType: {
      type: String,
      default: 'object',
    },
    itemLabel: {
      type: String,
      default: 'label',
    },
    itemValue: {
      type: String,
      default: 'value',
    },
    itemQuery: String,
    filterable: {
      type: Boolean,
      default: true,
    },
    defaultFirstOption: {
      type: Boolean,
      default: true,
    },
    filterMethod: {
      type: Function,
      default: () => {},
    },
    remote: {
      type: Boolean,
      default: true,
    },
    remoteShowSuffix: {
      type: Boolean,
      default: true,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    currentLabel: [String, Array],
    debounceWait: {
      type: Number,
      default: 200,
    },
    inputQueryWait: {
      type: Number,
      default: 100,
    },
    pageSize: {
      type: Number,
      default: 20,
    },
  },
  components: {
    ElSelectMenu /*: Select.components.ElSelectMenu*/,
  },
  setup(props, ctx) {
    const nsSelect = useNamespace('select')
    const nsInput = useNamespace('input')
    const { t } = useLocale()
    const contentId = useId()
    const states = useSelectStates(props)
    const {
      optionList,
      optionsArray,
      hoverOption,
      selectSize,
      readonly,
      handleResize,
      collapseTagSize,
      debouncedOnInputChange,
      debouncedQueryChange,
      deletePrevTag,
      deleteTag,
      deleteSelected,
      handleOptionSelect,
      scrollToOption,
      setSelected,
      resetInputHeight,
      managePlaceholder,
      showClose,
      selectDisabled,
      iconComponent,
      iconReverse,
      showNewOption,
      emptyText,
      toggleLastOptionHitState,
      resetInputState,
      handleComposition,
      onOptionCreate,
      onOptionDestroy,
      handleMenuEnter,
      handleFocus,
      focus,
      blur,
      handleBlur,
      handleClearClick,
      handleClose,
      handleKeydownEscape,
      toggleMenu,
      selectOption,
      getValueKey,
      navigateOptions,
      handleDeleteTooltipTag,
      dropMenuVisible,

      reference,
      input,
      iOSInput,
      tooltipRef,
      tagTooltipRef,
      tags,
      selectWrapper,
      scrollbar,
      queryChange,
      groupQueryChange,
      handleMouseEnter,
      handleMouseLeave,
      showTagList,
      collapseTagList,
      // computed style
      selectTagsStyle,

      // extends
      showLoading,
      loadMore,
      scrollDisabled,
    } = useSelect(props, states, ctx)

    const {
      inputWidth,
      selected,
      inputLength,
      filteredOptionsCount,
      visible,
      selectedLabel,
      hoverIndex,
      query,
      inputHovering,
      currentPlaceholder,
      menuVisibleOnFocus,
      isOnComposition,
      options,
      cachedOptions,
      optionsCount,
      prefixWidth,
      items,
    } = toRefs(states)

    const wrapperKls = computed(() => {
      const classList = [nsSelect.b()]
      const _selectSize = unref(selectSize)
      if (_selectSize) {
        classList.push(nsSelect.m(_selectSize))
      }
      if (props.disabled) {
        classList.push(nsSelect.m('disabled'))
      }
      if (dropMenuVisible.value) {
        classList.push('is-drop-menu-visible')
      }
      return classList
    })

    const tagsKls = computed(() => [nsSelect.e('tags'), nsSelect.is('disabled', unref(selectDisabled))])

    const tagWrapperKls = computed(() => [
      nsSelect.b('tags-wrapper'),
      { 'has-prefix': unref(prefixWidth) && unref(selected).length },
    ])

    const inputKls = computed(() => [
      nsSelect.e('input'),
      nsSelect.is(unref(selectSize)),
      nsSelect.is('disabled', unref(selectDisabled)),
    ])

    const iOSInputKls = computed(() => [
      nsSelect.e('input'),
      nsSelect.is(unref(selectSize)),
      nsSelect.em('input', 'iOS'),
    ])

    const scrollbarKls = computed(() => [
      nsSelect.is('empty', !props.allowCreate && Boolean(unref(query)) && unref(filteredOptionsCount) === 0),
    ])

    const tagTextStyle = computed(() => {
      const maxWidth = unref(inputWidth) > 123 ? unref(inputWidth) - 123 : unref(inputWidth) - 75
      return { maxWidth: `${maxWidth}px` }
    })

    const inputStyle = computed(() => ({
      marginLeft: `${unref(prefixWidth)}px`,
      flexGrow: 1,
      width: `${unref(inputLength) / (unref(inputWidth) - 32)}%`,
      maxWidth: `${unref(inputWidth) - 42}px`,
    }))

    provide(
      selectKey,
      reactive({
        props,
        options,
        optionsArray,
        cachedOptions,
        optionsCount,
        filteredOptionsCount,
        hoverIndex,
        handleOptionSelect,
        onOptionCreate,
        onOptionDestroy,
        selectWrapper,
        selected,
        setSelected,
        queryChange,
        groupQueryChange,
      }),
    )

    onMounted(() => {
      states.cachedPlaceHolder = currentPlaceholder.value = props.placeholder || (() => t('el.select.placeholder'))
      if (props.multiple && Array.isArray(props.modelValue) && props.modelValue.length > 0) {
        currentPlaceholder.value = ''
      }
      useResizeObserver(selectWrapper, handleResize)
      if (props.remote && props.multiple) {
        resetInputHeight()
      }
      nextTick(() => {
        const refEl = reference.value && reference.value.$el
        if (!refEl) return
        inputWidth.value = refEl.getBoundingClientRect().width

        if (ctx.slots.prefix) {
          const prefix = refEl.querySelector(`.${nsInput.e('prefix')}`)
          prefixWidth.value = Math.max(prefix.getBoundingClientRect().width + 11, 30)
        }
      })
      setSelected()
    })

    if (props.multiple && !Array.isArray(props.modelValue)) {
      ctx.emit(UPDATE_MODEL_EVENT, [])
    }
    if (!props.multiple && Array.isArray(props.modelValue)) {
      ctx.emit(UPDATE_MODEL_EVENT, '')
    }

    const popperPaneRef = computed(() => {
      return tooltipRef.value?.popperRef?.contentRef
    })

    const onOptionsRendered = (v) => {
      optionList.value = v
    }

    return {
      isIOS,
      onOptionsRendered,
      prefixWidth,
      selectSize,
      readonly,
      handleResize,
      collapseTagSize,
      debouncedOnInputChange,
      debouncedQueryChange,
      deletePrevTag,
      deleteTag,
      handleDeleteTooltipTag,
      deleteSelected,
      handleOptionSelect,
      scrollToOption,
      inputWidth,
      selected,
      inputLength,
      filteredOptionsCount,
      visible,
      selectedLabel,
      hoverIndex,
      query,
      inputHovering,
      currentPlaceholder,
      menuVisibleOnFocus,
      isOnComposition,
      options,
      resetInputHeight,
      managePlaceholder,
      showClose,
      selectDisabled,
      iconComponent,
      iconReverse,
      showNewOption,
      emptyText,
      toggleLastOptionHitState,
      resetInputState,
      handleComposition,
      handleMenuEnter,
      handleFocus,
      focus,
      blur,
      handleBlur,
      handleClearClick,
      handleClose,
      handleKeydownEscape,
      toggleMenu,
      selectOption,
      getValueKey,
      navigateOptions,
      dropMenuVisible,

      reference,
      input,
      iOSInput,
      tooltipRef,
      popperPaneRef,
      tags,
      selectWrapper,
      scrollbar,

      wrapperKls,
      tagsKls,
      tagWrapperKls,
      inputKls,
      iOSInputKls,
      scrollbarKls,
      selectTagsStyle,
      nsSelect,
      tagTextStyle,
      inputStyle,
      handleMouseEnter,
      handleMouseLeave,
      showTagList,
      collapseTagList,
      tagTooltipRef,
      contentId,
      hoverOption,

      showLoading,
      loadMore,
      items,
      scrollDisabled,
      // pagination,
      // total,
      // items,
      // setSelected,
      // loadingMore,
      // lastQuery,
      // loadingData,
      // loadingOption
    }
  },

  emits: ['option-select', 'create', 'change-label'],
})
</script>

<style lang="scss">
.el-select__loading {
  position: absolute;
  top: 50%;
  right: 0;
  margin-top: -6px;
  width: 25px;
  vertical-align: -0.125rem;
  line-height: 1;
  text-align: center;
  animation: rotating 1s infinite linear;
  svg {
    vertical-align: top;
  }
}
.el-select-dropdown__empty {
  font-size: 12px;
}
.el-select-dropdown__loading-icon {
  width: 25px;
  vertical-align: -0.125rem;
  line-height: 1;
  text-align: center;
  svg {
    vertical-align: top;
    animation: rotating 1s infinite linear;
  }
}
</style>

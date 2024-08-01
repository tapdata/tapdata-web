<template>
  <div
    ref="selectRef"
    v-click-outside:[popperRef]="handleClickOutside"
    :class="[nsSelect.b(), nsSelect.m(selectSize)]"
    @[mouseEnterEventName]="states.inputHovering = true"
    @mouseleave="states.inputHovering = false"
    @click.prevent.stop="toggleMenu"
  >
    <el-tooltip
      ref="tooltipRef"
      :visible="dropdownMenuVisible"
      :placement="placement"
      :teleported="teleported"
      :popper-class="[nsSelect.e('popper'), popperClass]"
      :popper-options="popperOptions"
      :fallback-placements="fallbackPlacements"
      :effect="effect"
      pure
      trigger="click"
      :transition="`${nsSelect.namespace.value}-zoom-in-top`"
      :stop-popper-mouse-event="false"
      :gpu-acceleration="false"
      :persistent="persistent"
      @before-show="handleMenuEnter"
      @hide="states.isBeforeHide = false"
    >
      <template #default>
        <div
          ref="wrapperRef"
          :class="[
            nsSelect.e('wrapper'),
            nsSelect.is('focused', isFocused),
            nsSelect.is('hovering', states.inputHovering),
            nsSelect.is('filterable', filterable),
            nsSelect.is('disabled', selectDisabled),
          ]"
        >
          <div v-if="$slots.prefix" ref="prefixRef" :class="nsSelect.e('prefix')">
            <slot name="prefix" />
          </div>
          <div
            ref="selectionRef"
            :class="[
              nsSelect.e('selection'),
              nsSelect.is('near', multiple && !$slots.prefix && !!states.selected.length),
            ]"
          >
            <slot v-if="multiple" name="tag">
              <div v-for="item in showTagList" :key="getValueKey(item)" :class="nsSelect.e('selected-item')">
                <el-tag
                  :closable="!selectDisabled && !item.isDisabled"
                  :size="collapseTagSize"
                  :type="tagType"
                  disable-transitions
                  :style="tagStyle"
                  @close="deleteTag($event, item)"
                >
                  <span :class="nsSelect.e('tags-text')">
                    <slot name="label" :label="item.currentLabel" :value="item.value">
                      {{ item.currentLabel }}
                    </slot>
                  </span>
                </el-tag>
              </div>

              <el-tooltip
                v-if="collapseTags && states.selected.length > maxCollapseTags"
                ref="tagTooltipRef"
                :disabled="dropdownMenuVisible || !collapseTagsTooltip"
                :fallback-placements="['bottom', 'top', 'right', 'left']"
                :effect="effect"
                placement="bottom"
                :teleported="teleported"
              >
                <template #default>
                  <div ref="collapseItemRef" :class="nsSelect.e('selected-item')">
                    <el-tag
                      :closable="false"
                      :size="collapseTagSize"
                      :type="tagType"
                      disable-transitions
                      :style="collapseTagStyle"
                    >
                      <span :class="nsSelect.e('tags-text')"> + {{ states.selected.length - maxCollapseTags }} </span>
                    </el-tag>
                  </div>
                </template>
                <template #content>
                  <div ref="tagMenuRef" :class="nsSelect.e('selection')">
                    <div v-for="item in collapseTagList" :key="getValueKey(item)" :class="nsSelect.e('selected-item')">
                      <el-tag
                        class="in-tooltip"
                        :closable="!selectDisabled && !item.isDisabled"
                        :size="collapseTagSize"
                        :type="tagType"
                        disable-transitions
                        @close="deleteTag($event, item)"
                      >
                        <span :class="nsSelect.e('tags-text')">
                          <slot name="label" :label="item.currentLabel" :value="item.value">
                            {{ item.currentLabel }}
                          </slot>
                        </span>
                      </el-tag>
                    </div>
                  </div>
                </template>
              </el-tooltip>
            </slot>
            <div
              v-if="!selectDisabled"
              :class="[nsSelect.e('selected-item'), nsSelect.e('input-wrapper'), nsSelect.is('hidden', !filterable)]"
            >
              <input
                :id="inputId"
                ref="inputRef"
                v-model="states.inputValue"
                type="text"
                :name="name"
                :class="[nsSelect.e('input'), nsSelect.is(selectSize)]"
                :disabled="selectDisabled"
                :autocomplete="autocomplete"
                :style="inputStyle"
                role="combobox"
                :readonly="!filterable"
                spellcheck="false"
                :aria-activedescendant="hoverOption?.id || ''"
                :aria-controls="contentId"
                :aria-expanded="dropdownMenuVisible"
                :aria-label="ariaLabel"
                aria-autocomplete="none"
                aria-haspopup="listbox"
                @focus="handleFocus"
                @blur="handleBlur"
                @keydown.down.stop.prevent="navigateOptions('next')"
                @keydown.up.stop.prevent="navigateOptions('prev')"
                @keydown.esc.stop.prevent="handleEsc"
                @keydown.enter.stop.prevent="selectOption"
                @keydown.delete.stop="deletePrevTag"
                @compositionstart="handleCompositionStart"
                @compositionupdate="handleCompositionUpdate"
                @compositionend="handleCompositionEnd"
                @input="onInput"
                @click.stop="toggleMenu"
              />
              <span
                v-if="filterable"
                ref="calculatorRef"
                aria-hidden="true"
                :class="nsSelect.e('input-calculator')"
                v-text="states.inputValue"
              />
            </div>
            <div
              v-if="shouldShowPlaceholder"
              :class="[
                nsSelect.e('selected-item'),
                nsSelect.e('placeholder'),
                nsSelect.is('transparent', !hasModelValue || (expanded && !states.inputValue)),
              ]"
            >
              <slot v-if="hasModelValue" name="label" :label="currentPlaceholder" :value="modelValue">
                <span>{{ currentPlaceholder }}</span>
              </slot>
              <span v-else>{{ currentPlaceholder }}</span>
            </div>
          </div>
          <div ref="suffixRef" :class="nsSelect.e('suffix')">
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
              <el-icon v-if="validateState && validateIcon" :class="[nsInput.e('icon'), nsInput.e('validateIcon')]">
                <component :is="validateIcon" />
              </el-icon>
            </template>
          </div>
        </div>
      </template>
      <template #content>
        /* unplugin-vue-components disabled */
        <el-select-menu ref="menuRef">
          <div v-if="$slots.header" :class="nsSelect.be('dropdown', 'header')" @click.stop>
            <slot name="header" />
          </div>
          <el-scrollbar
            v-show="states.options.size > 0 && !loading"
            :id="contentId"
            ref="scrollbarRef"
            tag="ul"
            :wrap-class="nsSelect.be('dropdown', 'wrap')"
            :view-class="nsSelect.be('dropdown', 'list')"
            :class="[nsSelect.is('empty', filteredOptionsCount === 0)]"
            role="listbox"
            :aria-label="ariaLabel"
            aria-orientation="vertical"
          >
            <div v-infinite-scroll="loadMore" :infinite-scroll-disabled="scrollDisabled">
              <el-option v-if="showNewOption" :value="states.inputValue" :created="true"
                ><slot name="created-option" :value="states.inputValue"></slot
              ></el-option>

              <el-options>
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
          <div v-if="$slots.loading && loading" :class="nsSelect.be('dropdown', 'loading')">
            <slot name="loading" />
          </div>
          <div v-else-if="loading || filteredOptionsCount === 0" :class="nsSelect.be('dropdown', 'empty')">
            <slot name="empty" :query="selectedLabel">
              <span>{{ emptyText }}</span>
            </slot>
          </div>
          <div v-if="$slots.footer" :class="nsSelect.be('dropdown', 'footer')" @click.stop>
            <slot name="footer" />
          </div>
        </el-select-menu>
      </template>
    </el-tooltip>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { computed, defineComponent, onMounted, reactive, ref, toRefs, unref, provide, nextTick } from 'vue'
import {
  useId,
  useLocale,
  useNamespace,
  ClickOutside,
  CHANGE_EVENT,
  UPDATE_MODEL_EVENT,
  ElSelect as Select,
} from 'element-plus'
/* unplugin-vue-components disabled */
import ElSelectMenu from 'element-plus/es/components/select/src/select-dropdown.mjs'
/* unplugin-vue-components disabled */
import ElOptions from 'element-plus/es/components/select/src/options'
import { useSelect } from './useSelect'
import { selectKey } from 'element-plus/es/components/select/src/token'
// import ElOptions from './options'
import { SelectProps } from './select'
import type { SelectContext } from 'element-plus/es/components/select/src/token'

console.log('Select.components.ElSelectMenu', Select.components.ElSelectMenu)

export default defineComponent({
  name: 'AsyncSelect',
  extends: Select,
  components: {
    ElOptions,
    ElSelectMenu: Select.components.ElSelectMenu /*: Select.components.ElSelectMenu*/,
  },
  props: SelectProps,
  emits: [
    UPDATE_MODEL_EVENT,
    CHANGE_EVENT,
    'remove-tag',
    'clear',
    'visible-change',
    'focus',
    'blur',
    'option-select',
    'create',
    'change-label',
  ],
  setup(props, { emit }) {
    const API = useSelect(props, emit)

    provide(
      selectKey,
      reactive({
        props,
        states: API.states,
        optionsArray: API.optionsArray,
        handleOptionSelect: API.handleOptionSelect,
        onOptionCreate: API.onOptionCreate,
        onOptionDestroy: API.onOptionDestroy,
        selectRef: API.selectRef,
        setSelected: API.setSelected,
      }) as unknown as SelectContext,
    )

    return {
      ...API,
    }
  },
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

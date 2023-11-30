<template>
  <div
    ref="selectRef"
    v-click-outside:[popperRef]="handleClickOutside"
    :class="[nsSelectV2.b(), nsSelectV2.m(selectSize)]"
    @click.stop="toggleMenu"
    @mouseenter="states.comboBoxHovering = true"
    @mouseleave="states.comboBoxHovering = false"
  >
    <el-tooltip
      ref="popper"
      :visible="dropdownMenuVisible"
      :teleported="teleported"
      :popper-class="[nsSelectV2.e('popper'), popperClass]"
      :popper-style="popperStyle"
      :gpu-acceleration="false"
      :stop-popper-mouse-event="false"
      :popper-options="popperOptions"
      :fallback-placements="['bottom-start', 'top-start', 'right', 'left']"
      :effect="effect"
      :placement="placement"
      pure
      :transition="`${nsSelectV2.namespace.value}-zoom-in-top`"
      trigger="click"
      :persistent="persistent"
      @update:visible="handleUpdateVisible"
      @before-show="handleMenuEnter"
      @hide="states.inputValue = states.displayInputValue"
    >
      <template #default>
        <div
          ref="selectionRef"
          :class="[
            nsSelectV2.e('wrapper'),
            nsSelectV2.is('focused', states.isComposing || expanded),
            nsSelectV2.is('hovering', states.comboBoxHovering),
            nsSelectV2.is('filterable', filterable),
            nsSelectV2.is('disabled', selectDisabled),
          ]"
        >
          <div v-if="$slots.prefix">
            <slot name="prefix" />
          </div>
          <div v-if="multiple" :class="nsSelectV2.e('selection')">
            <template v-if="collapseTags && modelValue.length > 0">
              <div
                v-for="item in showTagList"
                :key="getValueKey(getValue(item))"
                :class="nsSelectV2.e('selected-item')"
              >
                <el-tag
                  :closable="!selectDisabled && !getDisabled(item)"
                  :size="collapseTagSize"
                  type="info"
                  disable-transitions
                  @close="deleteTag($event, item)"
                >
                  <span
                    :class="nsSelectV2.e('tags-text')"
                    :style="{
                      maxWidth: `${tagMaxWidth}px`,
                    }"
                  >
                    {{ getLabel(item) }}
                  </span>
                </el-tag>
              </div>
              <div :class="nsSelectV2.e('selected-item')">
                <el-tag
                  v-if="modelValue.length > maxCollapseTags"
                  :closable="false"
                  :size="collapseTagSize"
                  type="info"
                  disable-transitions
                >
                  <el-tooltip
                    v-if="collapseTagsTooltip"
                    :disabled="dropdownMenuVisible"
                    :fallback-placements="['bottom', 'top', 'right', 'left']"
                    :effect="effect"
                    placement="bottom"
                    :teleported="false"
                  >
                    <template #default>
                      <span
                        :class="nsSelectV2.e('tags-text')"
                        :style="{
                          maxWidth: `${tagMaxWidth}px`,
                        }"
                      >
                        + {{ modelValue.length - maxCollapseTags }}
                      </span>
                    </template>
                    <template #content>
                      <div :class="nsSelectV2.e('selection')">
                        <div
                          v-for="selected in collapseTagList"
                          :key="getValueKey(getValue(selected))"
                          :class="nsSelectV2.e('selected-item')"
                        >
                          <el-tag
                            :closable="!selectDisabled && !getDisabled(selected)"
                            :size="collapseTagSize"
                            class="in-tooltip"
                            type="info"
                            disable-transitions
                            @close="deleteTag($event, selected)"
                          >
                            <span
                              :class="nsSelectV2.e('tags-text')"
                              :style="{
                                maxWidth: `${tagMaxWidth}px`,
                              }"
                            >
                              {{ getLabel(selected) }}
                            </span>
                          </el-tag>
                        </div>
                      </div>
                    </template>
                  </el-tooltip>
                  <span
                    v-else
                    :class="nsSelectV2.e('tags-text')"
                    :style="{
                      maxWidth: `${tagMaxWidth}px`,
                    }"
                  >
                    + {{ modelValue.length - maxCollapseTags }}
                  </span>
                </el-tag>
              </div>
            </template>

            <template v-else>
              <div
                v-for="selected in states.cachedOptions"
                :key="getValueKey(getValue(selected))"
                :class="nsSelectV2.e('selected-item')"
              >
                <el-tag
                  :closable="!selectDisabled && !getDisabled(selected)"
                  :size="collapseTagSize"
                  type="info"
                  disable-transitions
                  @close="deleteTag($event, selected)"
                >
                  <span
                    :class="nsSelectV2.e('tags-text')"
                    :style="{
                      maxWidth: `${tagMaxWidth}px`,
                    }"
                  >
                    {{ getLabel(selected) }}
                  </span>
                </el-tag>
              </div>
            </template>
            <div :class="[nsSelectV2.e('selected-item'), nsSelectV2.e('input-wrapper')]" :style="inputWrapperStyle">
              <input
                :id="id"
                ref="inputRef"
                v-model-text="states.displayInputValue"
                :autocomplete="autocomplete"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                autocapitalize="off"
                :aria-expanded="expanded"
                :aria-labelledby="label"
                :class="[nsSelectV2.is(selectSize), nsSelectV2.e('combobox-input')]"
                :disabled="disabled"
                role="combobox"
                :readonly="!filterable"
                spellcheck="false"
                type="text"
                :name="name"
                :unselectable="expanded ? 'on' : undefined"
                @update:modelValue="onUpdateInputValue"
                @focus="handleFocus"
                @blur="handleBlur"
                @input="onInput"
                @compositionstart="handleCompositionStart"
                @compositionupdate="handleCompositionUpdate"
                @compositionend="handleCompositionEnd"
                @keydown.up.stop.prevent="onKeyboardNavigate('backward')"
                @keydown.down.stop.prevent="onKeyboardNavigate('forward')"
                @keydown.enter.stop.prevent="onKeyboardSelect"
                @keydown.esc.stop.prevent="handleEsc"
                @keydown.delete.stop="handleDel"
              />
              <span
                v-if="filterable"
                ref="calculatorRef"
                aria-hidden="true"
                :class="nsSelectV2.e('input-calculator')"
                v-text="states.displayInputValue"
              />
            </div>
          </div>
          <template v-else>
            <!--<div :class="[nsSelectV2.e('selected-item'), nsSelectV2.e('input-wrapper')]">
              <input
                :id="id"
                ref="inputRef"
                v-model-text="states.displayInputValue"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                :aria-labelledby="label"
                :aria-expanded="expanded"
                autocapitalize="off"
                :autocomplete="autocomplete"
                :class="nsSelectV2.e('combobox-input')"
                :disabled="disabled"
                :name="name"
                role="combobox"
                :readonly="!filterable"
                spellcheck="false"
                type="text"
                :unselectable="expanded ? 'on' : undefined"
                @compositionstart="handleCompositionStart"
                @compositionupdate="handleCompositionUpdate"
                @compositionend="handleCompositionEnd"
                @focus="handleFocus"
                @blur="handleBlur"
                @input="onInput"
                @keydown.up.stop.prevent="onKeyboardNavigate('backward')"
                @keydown.down.stop.prevent="onKeyboardNavigate('forward')"
                @keydown.enter.stop.prevent="onKeyboardSelect"
                @keydown.esc.stop.prevent="handleEsc"
                @update:modelValue="onUpdateInputValue"
              />
            </div>-->
            <span
              v-if="filterable"
              ref="calculatorRef"
              aria-hidden="true"
              class="none"
              :class="[nsSelectV2.e('selected-item'), nsSelectV2.e('input-calculator')]"
              v-text="states.displayInputValue"
            />
          </template>
          <span
            :class="[
              nsSelectV2.e('placeholder'),
              nsSelectV2.is('transparent', multiple ? modelValue.length === 0 : !hasModelValue),
            ]"
          >
            {{ currentPlaceholder }}
          </span>
          <span :class="nsSelectV2.e('suffix')">
            <el-icon
              v-if="iconComponent"
              v-show="!showClearBtn"
              :class="[nsSelectV2.e('caret'), nsInput.e('icon'), iconReverse]"
            >
              <component :is="iconComponent" />
            </el-icon>
            <el-icon
              v-if="showClearBtn && clearIcon"
              :class="[nsSelectV2.e('caret'), nsInput.e('icon')]"
              @click.prevent.stop="handleClear"
            >
              <component :is="clearIcon" />
            </el-icon>
            <el-icon v-if="validateState && validateIcon" :class="[nsInput.e('icon'), nsInput.e('validateIcon')]">
              <component :is="validateIcon" />
            </el-icon>
          </span>
        </div>
      </template>
      <template #content>
        <SelectDropdown
          ref="menuRef"
          :data="filteredOptions"
          :width="popperSize"
          :hovering-index="states.hoveringIndex"
          :scrollbar-always-on="scrollbarAlwaysOn"
        >
          <template v-if="filterable" #header>
            <div class="border-bottom flex align-center filter-select__input-wrapper" style="height: 37px">
              <ElInput
                :id="id"
                ref="inputRef"
                v-model="states.displayInputValue"
                clearable
                :placeholder="$t('public_input_placeholder')"
                aria-autocomplete="list"
                aria-haspopup="listbox"
                :aria-labelledby="label"
                :aria-expanded="expanded"
                autocapitalize="off"
                :autocomplete="autocomplete"
                :disabled="disabled"
                :name="name"
                role="combobox"
                :readonly="!filterable"
                spellcheck="false"
                type="text"
                :unselectable="expanded ? 'on' : undefined"
                @compositionstart="handleCompositionStart"
                @compositionupdate="handleCompositionUpdate"
                @compositionend="handleCompositionEnd"
                @focus="handleFocus"
                @blur="handleBlur"
                @input="handleFilterInput"
                @keydown.up.stop.prevent="onKeyboardNavigate('backward')"
                @keydown.down.stop.prevent="onKeyboardNavigate('forward')"
                @keydown.enter.stop.prevent="onKeyboardSelect"
                @keydown.esc.stop.prevent="handleEsc"
                @update:modelValue="onUpdateInputValue"
              >
                <template #prefix>
                  <el-icon class="el-input__icon">
                    <Search />
                  </el-icon>
                </template>
              </ElInput>
            </div>
          </template>
          <template #default="scope">
            <slot v-bind="scope" />
          </template>
          <template #empty>
            <slot name="empty">
              <p :class="nsSelectV2.e('empty')">
                {{ emptyText ? emptyText : '' }}
              </p>
            </slot>
          </template>
        </SelectDropdown>
      </template>
    </el-tooltip>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { ElSelectV2 as Select } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import SelectDropdown from './select-dropdown'
import VIcon from '../base/VIcon.vue'

export default defineComponent({
  name: 'FilterSelect',
  extends: Select,
  props: {
    label: String,
    popperStyle: [String, Array, Object],
  },
  components: {
    Search,
    VIcon,
    SelectDropdown,
  },
  setup(props, ctx) {
    const handleUpdateVisible = (v) => {
      console.log('handleUpdateVisible', v, API.inputRef)
      API.inputRef?.value?.focus?.()
    }

    const handleFilterInput = (value) => {
      API.onInput({
        target: {
          value,
        },
      })
    }

    const API = {
      ...Select.setup(props, ctx),
      handleUpdateVisible,
      handleFilterInput,
    }

    return API
  },
})
</script>

<style lang="scss">
.filter-select__input-wrapper {
  .el-input {
    --el-input-height: 36px;
    min-width: 180px;
  }

  .el-input__wrapper {
    box-shadow: none;
  }
}
</style>

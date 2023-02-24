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
        :style="{
          'flex-grow': '1',
          width: inputLength / (inputWidth - 32) + '%',
          'max-width': inputWidth - 42 + 'px'
        }"
        ref="input"
      />
    </div>
    <el-input
      ref="reference"
      v-model="selectedLabel"
      type="text"
      :placeholder="currentPlaceholder"
      :name="name"
      :id="id"
      :autocomplete="autoComplete || autocomplete"
      :size="selectSize"
      :disabled="selectDisabled"
      :readonly="readonly"
      :validate-event="false"
      :class="{ 'is-focus': visible }"
      :tabindex="multiple && filterable ? '-1' : null"
      @focus="handleFocus"
      @blur="handleBlur"
      @input="debouncedOnInputChange"
      @keydown.down.stop.prevent="navigateOptions('next')"
      @keydown.up.stop.prevent="navigateOptions('prev')"
      @keydown.enter.prevent="selectOption"
      @keydown.esc.stop.prevent="visible = false"
      @keydown.tab="visible = false"
      @mouseenter="inputHovering = true"
      @mouseleave="inputHovering = false"
    >
      <template v-if="$slots.prefix" v-slot:prefix>
        <slot name="prefix"></slot>
      </template>
      <template v-slot:suffix>
        <slot name="prefix">
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
            <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"></i>
            <el-icon class="el-select__caret el-input__icon"><el-icon-circle-close /></el-icon>
          </template>
        </slot>
      </template>
    </el-input>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <el-select-menu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <el-scrollbar
          tag="ul"
          wrap-class="el-select-dropdown__wrap"
          view-class="el-select-dropdown__list"
          ref="scrollbar"
          :class="{
            'is-empty': !allowCreate && query && filteredOptionsCount === 0
          }"
          v-show="options.length > 0 && !loading"
        >
          <el-option :value="query" created v-if="showNewOption"> </el-option>
          <slot></slot>
        </el-scrollbar>
        <template v-if="emptyText && (!allowCreate || loading || (allowCreate && options.length === 0))">
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="el-select-dropdown__empty" v-else>
            {{ emptyText }}
          </p>
        </template>
      </el-select-menu>
    </transition>
  </div>
</template>

<script>
import { CircleClose as ElIconCircleClose } from '@element-plus/icons'import { ElSelect as Select } from 'element-plus'
export default {
  components: {
    ElIconCircleClose,
  },
  name: 'Select',
extends: Select
}
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
</style>

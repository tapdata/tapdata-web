<script setup lang="ts">
import { getMarkAttributes, type Editor } from '@tiptap/vue-3'
import { computed, inject, nextTick, ref, unref, watch } from 'vue'
import { FONT_SIZES } from '../extensions/FontSize'
import CommandButton from './CommandButton.vue'

import type { ElInputNumber } from 'element-plus'

const props = defineProps<{
  editor: Editor
}>()

const enableTooltip = inject('enableTooltip', true)
const isCodeViewMode = inject('isCodeViewMode', false)

const fontSizeInputRef = ref<InstanceType<typeof ElInputNumber>>()
const isEdit = ref(false)
const fontSizeInput = ref(14)
const fontSizeSelected = ref(14)

const currentFontSize = computed(() => {
  return getMarkAttributes(props.editor.state, 'textStyle').fontSize || 14
})

const handleEdit = () => {
  isEdit.value = true
  fontSizeInput.value = fontSizeSelected.value
  nextTick(() => {
    fontSizeInputRef.value?.focus()
    // select all text
    // fontSizeInputRef.value?.select()
    const input = fontSizeInputRef.value?.$el?.querySelector('input')
    input?.select()
  })
}

const handleSelect = (size: number) => {
  toggleFontSize(size)
  fontSizeSelected.value = size
}

const handleBlur = () => {
  isEdit.value = false
  fontSizeSelected.value = fontSizeInput.value
  toggleFontSize(fontSizeSelected.value)
}

const toggleFontSize = (size: number) => {
  props.editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
  // if (size === fontSizeSelected.value) {
  //   props.editor.chain().focus().unsetMark('fontSize').run()
  // } else {
  //   props.editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
  // }
}
</script>

<template>
  <div class="editable-btn-wrapper">
    <button v-show="!isEdit" class="editable-btn align-center">
      <span class="editable-text" @dblclick="handleEdit">{{
        currentFontSize
      }}</span>
      <el-dropdown trigger="click" class="h-100 align-center">
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.42253 2.95242L1.1279 3.24705C0.96518 3.40977 0.96518 3.67359 1.1279 3.83631L4.3688 7.07721C4.69424 7.40265 5.22188 7.40265 5.54731 7.07721L8.78822 3.83631C8.95094 3.67359 8.95094 3.40977 8.78822 3.24705L8.49359 2.95242C8.33087 2.7897 8.06706 2.7897 7.90434 2.95242L4.95806 5.8987L2.01178 2.95242C1.84906 2.7897 1.58524 2.7897 1.42253 2.95242Z"
            fill="#646A73"
          />
        </svg>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="size in FONT_SIZES"
              :key="size"
              style="min-width: 132px; line-height: 1; min-height: 32px"
              @click="handleSelect(Number(size))"
            >
              <span
                :class="{ 'color-primary': fontSizeSelected === Number(size) }"
                :style="{ fontSize: `${size}px` }"
                >{{ size }}</span
              >
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </button>
    <el-input-number
      v-show="isEdit"
      ref="fontSizeInputRef"
      v-model="fontSizeInput"
      size="small"
      :min="10"
      :max="50"
      :controls="false"
      @blur="handleBlur"
    />
  </div>
</template>

<style lang="scss">
.editable-btn-wrapper {
  display: flex;
  align-items: center;
  .editable-btn {
    display: flex;
    align-items: center;
    padding: 0 4px;
    height: 28px;
    border: 0;
    border-radius: 6px;
    background-color: transparent;
    font-size: 14px;
    outline: 0;
    &:hover {
      background-color: #eff0f1;
    }

    svg {
      height: 28px;
      margin-left: 4px;
      cursor: pointer;
    }
  }
  .editable-text {
    cursor: text;
    height: 16px;
    width: 28px;
    line-height: 16px;
    padding-right: 6px;
  }
  .el-input-number {
    width: 50px;
    height: 28px;
    line-height: 28px;
  }
}
</style>

<script setup lang="ts">
import { getMarkAttributes, type Editor } from '@tiptap/vue-3'
import { computed, inject, ref, unref, watch } from 'vue'
import { COLOR_SET } from '../extensions/Color'
import CommandButton from './CommandButton.vue'

const props = defineProps<{
  editor: Editor
}>()

const enableTooltip = inject('enableTooltip', false)
const isCodeViewMode = inject('isCodeViewMode', false)

const popoverRef = ref()
const colorText = ref('')
const lastSelectedColor = ref('rgb(0, 0, 0)')

function confirmColor(color?: string) {
  if (color) {
    lastSelectedColor.value = color
    props.editor.commands.setColor(color)
  } else {
    props.editor.commands.unsetColor()
    lastSelectedColor.value = 'rgb(0, 0, 0)'
  }

  unref(popoverRef).hide()
}

const selectedColor = computed<string>(() => {
  //   return getMarkAttributes(props.editor.state, 'textStyle').color || ''
  return lastSelectedColor.value
})

watch(selectedColor, (color) => {
  colorText.value = color
})

const colorSet = computed<string[]>(() => {
  const colorOptions = props.editor.extensionManager.extensions.find(
    (e) => e.name === 'color',
  )!.options
  return colorOptions.colors
})

const isWhiteColor = (color: string) => {
  return /^\s*(#(fff)\2?|rgba?\s*\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\s*\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(\d*\.\d+|\d+)\s*\))\s*;?$/i.test(
    color,
  )
}

const getBorderColor = (color: string) => {
  return isWhiteColor(color) ? 'rgb(241, 242, 243)' : color
}

console.log('colorSet', colorSet)
</script>

<template>
  <div class="color-picker-btn">
    <command-button
      class="color-picker-btn__left p-0"
      :enable-tooltip="enableTooltip"
      tooltip="字体颜色"
      icon="font-color"
      :command="
        () => {
          confirmColor(lastSelectedColor)
        }
      "
      :is-active="false"
    >
      <template #icon>
        <svg
          width="24"
          height="26"
          viewBox="0 0 24 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.8105 16.2954L15.3924 12.9865C15.3463 12.9954 15.2987 13 15.25 13H10.75C10.7012 13 10.6535 12.9953 10.6073 12.9864L9.18919 16.2954C9.02602 16.6762 8.58511 16.8525 8.20439 16.6894C7.82366 16.5262 7.6473 16.0853 7.81047 15.7046L11.9658 6.00881C12.3554 5.09969 13.6442 5.09968 14.0339 6.00881L18.1892 15.7046C18.3524 16.0853 18.176 16.5262 17.7953 16.6894C17.4145 16.8525 16.9736 16.6762 16.8105 16.2954ZM12.9998 7.40394L11.2444 11.5H14.7553L12.9998 7.40394Z"
            fill="#2B2F36"
          />
          <rect
            x="6"
            y="19"
            width="14"
            height="3"
            rx="1.5"
            :style="{ fill: selectedColor || '#2B2F36' }"
          />
        </svg>
      </template>
    </command-button>

    <el-popover
      ref="popoverRef"
      :disabled="isCodeViewMode"
      placement="bottom"
      trigger="hover"
      popper-class="el-tiptap-popper"
      width=""
      :hide-after="0"
    >
      <div class="color-set">
        <div class="color__wrapper flex gap-3">
          <div
            v-for="(color, index) in COLOR_SET"
            :key="index"
            class="flex flex-column color__col"
          >
            <div
              v-for="colorItem in color"
              :key="colorItem"
              :style="{
                'background-color': colorItem,
                'border-color': getBorderColor(colorItem),
              }"
              :class="{ 'color--selected': selectedColor === colorItem }"
              class="color-item"
              @mousedown.prevent
              @click.stop="confirmColor(colorItem)"
            >
              <svg
                v-if="selectedColor === colorItem"
                viewBox="0 0 12 12"
                xmlns="http://www.w3.org/2000/svg"
                class="swatches-color__icon"
                :style="{
                  fill: isWhiteColor(colorItem)
                    ? 'rgb(0, 0, 0)'
                    : 'rgb(255, 255, 255)',
                }"
              >
                <path
                  d="M2.7 4.95a1 1 0 1 0-1.4 1.42l3.37 3.37 6.04-6.03a1 1 0 1 0-1.42-1.42L4.67 6.92 2.71 4.95z"
                />
              </svg>
            </div>
          </div>
        </div>

        <button
          class="color-picker-bottom-button mt-3"
          @click.stop="confirmColor()"
        >
          清除
        </button>
      </div>

      <template #reference>
        <button class="color-picker-btn__right">
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
        </button>
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss">
.color-picker-btn {
  display: flex;
  align-items: stretch;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background-color: #eff0f1 !important;
  }

  &__left {
    font-size: 28px !important;
    border-radius: 6px 0 0 6px;
  }

  &__right {
    padding: 0 2px;
    background-color: transparent;
    outline: 0;
    border: 0;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    &:hover {
      background-color: rgba(31, 35, 41, 0.1) !important;
    }
  }
}

.color-picker-bottom-button {
  width: 100%;
  padding: 0 2px;
  border: 1px solid #bbbfc4;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.67;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  outline: 0;

  &:hover {
    background-color: rgba(31, 35, 41, 0.12);
  }
}
.color__col {
  gap: 6px;
  .color-item {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid;
    cursor: pointer;
    &:first-child {
      margin-bottom: 10px;
    }
  }
}
</style>

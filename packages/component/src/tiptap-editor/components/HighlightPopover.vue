<script setup lang="ts">
import { getMarkAttributes, type Editor } from '@tiptap/vue-3'
import { computed, inject, ref, unref, watch } from 'vue'
import { COLOR_SET } from '../extensions/Color'
import CommandButton from './CommandButton.vue'

const props = defineProps<{
  editor: Editor
}>()

const enableTooltip = inject('enableTooltip', true)
const isCodeViewMode = inject('isCodeViewMode', false)

const popoverRef = ref()
const lastSelectedColor = ref('rgb(255, 198, 10)')

function confirmColor(color?: string) {
  lastSelectedColor.value = color
  if (currentColor.value === color) {
    props.editor.chain().focus().unsetHighlight().run()
  } else {
    props.editor.chain().focus().setHighlight({ color }).run()
  }
}

const selectedColor = computed<string>(() => {
  return lastSelectedColor.value
})

const currentColor = computed<string>(() => {
  return getMarkAttributes(props.editor.state, 'highlight').color || ''
})

const isWhiteColor = (color: string) => {
  return /^\s*(#(fff)\2?|rgba?\s*\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgba\s*\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(\d*\.\d+|\d+)\s*\))\s*;?$/i.test(
    color,
  )
}

const getBorderColor = (color: string) => {
  return isWhiteColor(color) ? 'rgb(241, 242, 243)' : color
}
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
            d="M11.7438 5.6149C11.4592 5.31396 11.4724 4.83927 11.7733 4.55465C12.0743 4.27003 12.549 4.28326 12.8336 4.5842L14.0014 5.81898C14.0115 5.82914 14.0214 5.83947 14.0313 5.84998L14.0965 5.9195L14.3796 6.21891C14.3925 6.23256 14.4048 6.24657 14.4165 6.2609L17.6044 9.66133C18.1689 10.2635 18.1409 11.2085 17.5418 11.7762L12.5946 16.4629C11.991 17.0348 11.0374 17.0065 10.4687 16.3999L6.89557 12.5885C6.33106 11.9864 6.35908 11.0413 6.95825 10.4737L11.906 5.78638L11.7438 5.6149ZM13.0045 6.94787L12.9367 6.87619L8.05606 11.4999H15.6523L16.5101 10.6872L13.0045 6.94787Z"
            fill="#2B2F36"
          />
          <path
            d="M17.5 17.4999C18.3284 17.4999 19 16.8284 19 15.9999C19 15.26 18.5134 14.6824 18.0736 14.1602C17.8446 13.8884 17.6284 13.6317 17.5 13.3749C17.3716 13.6317 17.1553 13.8884 16.9264 14.1602C16.4866 14.6824 16 15.26 16 15.9999C16 16.8284 16.6715 17.4999 17.5 17.4999Z"
            fill="#2B2F36"
          />
          <rect
            x="6"
            y="19"
            width="14"
            height="3"
            rx="1.5"
            :style="{ fill: selectedColor }"
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

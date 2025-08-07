<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  conditions: {
    type: Array,
    default: () => [],
  },
})

const bracketColors = [
  'bracket-color-1', // 蓝色
  'bracket-color-2', // 紫色
  'bracket-color-3', // 橙色
  'bracket-color-4', // 绿色
  'bracket-color-5', // 红色
]

const tokens = computed(() => {
  if (!props.conditions?.length) return []

  const result = []
  const bracketStack = []
  let currentLevel = 0

  props.conditions.forEach((item, index) => {
    if (index === 0) {
      const openCount = props.conditions.length - 1
      for (let i = 0; i < openCount; i++) {
        const colorClass = bracketColors[i % bracketColors.length]
        result.push({ text: '(', class: colorClass })
        bracketStack.push(colorClass)
      }
    }

    result.push(
      {
        text: '(',
        class: bracketColors[currentLevel % bracketColors.length],
      },
      { text: item.fieldName, class: 'field-name' },
      { text: ' ', class: '' },
      { text: item.operator, class: 'operator' },
      { text: ' ', class: '' },
      { text: `{{${item.parameter}}}`, class: 'parameter' },
      {
        text: ')',
        class: bracketColors[currentLevel % bracketColors.length],
      },
    )

    if (index < props.conditions.length - 1) {
      if (index > 0) {
        result.push({
          text: ')',
          class: bracketStack.pop() || bracketColors[0],
        })
      }
      result.push(
        { text: ' ', class: '' },
        { text: item.condition, class: 'condition' },
        { text: ' ', class: '' },
      )
    } else {
      while (bracketStack.length > 0) {
        result.push({ text: ')', class: bracketStack.pop() })
      }
    }

    currentLevel++
  })

  return result
})
</script>

<template>
  <div class="where-condition-display bg-light rounded-xl">
    <span
      v-for="(token, index) in tokens"
      :key="index"
      :html="token.text.replace('/\s/g', '&nbsp;')"
      :class="token.class"
      class="condition-token"
    >
      {{ token.text }}
    </span>
    <span v-if="!tokens.length" class="condition-token empty-class">-</span>
  </div>
</template>

<style scoped>
.where-condition-display {
  font-family: var(--code-font-family);
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 12px;
  word-wrap: break-word;
}

.condition-token {
  white-space: normal;
  word-break: break-all;
}

/* 括号颜色 */
.bracket-color-1 {
  color: #007bff;
  font-weight: bold;
}

.bracket-color-2 {
  color: #6f42c1;
  font-weight: bold;
}

.bracket-color-3 {
  color: #fd7e14;
  font-weight: bold;
}

.bracket-color-4 {
  color: #28a745;
  font-weight: bold;
}

.bracket-color-5 {
  color: #dc3545;
  font-weight: bold;
}

/* 其他元素样式 */
.field-name {
  color: #495057;
  font-weight: 500;
}

.operator {
  color: #6c757d;
  font-weight: bold;
}

.parameter {
  color: #495057;
  font-weight: 500;
}

.condition {
  color: #17a2b8;
  font-weight: bold;
  text-transform: uppercase;
}
.empty-class {
  color: #6c757d;
  font-weight: bold;
  text-transform: uppercase;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>

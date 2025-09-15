<script setup lang="ts">
import { TextEditable } from '@tap/component/src/base/text-editable'
import { DownBoldOutlined } from '@tap/component/src/DownBoldOutlined'
import { useTemplateRef } from 'vue'

const props = defineProps<{
  node: any
  data: any
  encryptionsMap: Record<string, string>
}>()

const emit = defineEmits<{
  openEncryption: [encryptionRef: HTMLElement, data: any]
  removeEncryption: [data: any, i: number]
}>()

const encryptionRef = useTemplateRef<HTMLElement>('encryptionRef')

const handleOpenEncryption = () => {
  console.log('handleOpenEncryption', encryptionRef.value, props.data)
  emit('openEncryption', encryptionRef.value.$el, props.data)
}

const handleChangeAlias = (value: string) => {
  if (value === props.data.name) {
    props.data.field_alias = ''
  } else {
    props.data.field_alias = value
  }
}

const handleChange = (value: string) => {
  console.log('handleChange', value)
  if (!value) {
    props.data.label = props.data.name
    props.data.field_alias = ''
  }
}

const handleRemoveEncryption = (i: number) => {
  // props.data.textEncryptionRuleIds.splice(i, 1)
  emit('removeEncryption', props.data, i)
}
</script>

<template>
  <div class="flex flex-1 align-center gap-2 field-node min-w-0">
    <span v-if="!node.checked" class="px-1 py-0.5 node-name">{{
      data.name
    }}</span>
    <template v-else>
      <TextEditable
        v-model:value="data.label"
        hidden-icon
        :max-width="300"
        :min-width="4"
        @click.stop
        @update:value="handleChangeAlias"
        @change="handleChange"
      />
      <span v-if="data.name !== data.label" class="text-gray-500"
        >({{ data.name }})</span
      >
    </template>
    <div class="flex-1" />
    <el-button
      v-if="node.checked"
      ref="encryptionRef"
      text
      class="encryption-btn min-w-0"
      @click.stop="handleOpenEncryption"
    >
      <el-icon
        :color="`var(${data.textEncryptionRuleIds?.length ? '--el-color-primary' : '--icon-n3'})`"
        ><i-lucide:shield
      /></el-icon>
      <div
        v-if="data.textEncryptionRuleIds?.length"
        class="flex align-center gap-1 ml-1"
      >
        <el-tag
          v-for="(encryption, i) in data.textEncryptionRuleIds"
          :key="encryption"
          size="small"
          class="border-0"
          closable
          @close="handleRemoveEncryption(i)"
          >{{ encryptionsMap[encryption] }}</el-tag
        >
      </div>
      <span v-else class="ml-1">无加密</span>
      <el-icon class="ml-1" size="12"><DownBoldOutlined /></el-icon>
    </el-button>
    <el-tag class="is-code font-mono" size="small">{{ data.dataType }}</el-tag>
  </div>
</template>

<style scoped>
.field-name-input-wrap {
  --input-border-color: transparent;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--input-border-color);
  padding: 2px 6px;
}
.node-name {
  border: 1px solid transparent;
  line-height: 22px;
}
.el-button.encryption-btn.encryption-btn {
  --el-button-text-color: var(--el-text-color-disabled);
  > span {
    min-width: 0;
  }
  &:hover {
    --el-button-text-color: var(--el-text-color-primary);
  }
}
</style>

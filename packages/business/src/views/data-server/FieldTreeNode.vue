<script setup lang="ts">
import { TextEditable } from '@tap/component/src/base/text-editable'
import { DownBoldOutlined } from '@tap/component/src/DownBoldOutlined'
import { inject, useTemplateRef } from 'vue'
import type { ElButton } from 'element-plus'

const props = defineProps<{
  node: any
  data: any
  readonly?: boolean
}>()

const emit = defineEmits<{
  openEncryption: [encryptionRef: HTMLElement, data: any]
  removeEncryption: [data: any, i: number]
}>()

const encryptionRef =
  useTemplateRef<InstanceType<typeof ElButton>>('encryptionRef')

const encryptionsMap = inject('encryptionsMap') as Record<string, string>

const handleOpenEncryption = () => {
  emit('openEncryption', encryptionRef.value!.$el, props.data)
}

const handleChangeAlias = (value: string) => {
  if (value === props.data.name) {
    props.data.field_alias = ''
  } else {
    props.data.field_alias = value
  }
}

const handleChange = (value: string) => {
  if (!value) {
    props.data.label = props.data.name
    props.data.field_alias = ''
  }
}

const handleRemoveEncryption = (i: number) => {
  emit('removeEncryption', props.data, i)
}
</script>

<template>
  <div class="flex flex-1 align-center gap-2 field-node min-w-0">
    <span
      v-if="(!node.checked && !node.indeterminate) || readonly"
      class="px-1 py-0.5 node-name"
      >{{ data.name }}</span
    >
    <template v-else>
      <TextEditable
        v-model:value="data.label"
        hidden-icon
        :min-width="4"
        :maxlength="48"
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
      v-if="(node.checked || node.indeterminate) && !readonly"
      ref="encryptionRef"
      text
      class="encryption-btn min-w-0"
      @click.stop="handleOpenEncryption"
    >
      <el-icon
        v-if="data.textEncryptionRuleIds?.length"
        color="var(--el-color-primary)"
      >
        <i-lucide:shield-ellipsis />
      </el-icon>
      <el-icon v-else color="var(--icon-n3)"><i-lucide:shield /></el-icon>
      <div
        v-if="data.textEncryptionRuleIds?.length"
        class="flex align-center gap-1 ml-1 overflow-hidden"
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
      <span v-else class="ml-1">{{ $t('public_unencrypted') }}</span>
      <el-icon class="ml-1" size="12"><DownBoldOutlined /></el-icon>
    </el-button>
    <el-tag class="is-code font-mono" size="small" disable-transitions>{{
      data.dataType
    }}</el-tag>
  </div>
</template>

<style scoped lang="scss">
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
  :deep(> span) {
    min-width: 0;
  }
  &:hover {
    --el-button-text-color: var(--el-text-color-primary);
  }
}
</style>

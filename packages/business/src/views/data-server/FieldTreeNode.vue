<script setup lang="ts">
import { TextEditable } from '@tap/component/src/base/text-editable'
import { DownBoldOutlined } from '@tap/component/src/DownBoldOutlined'
import { inject, useTemplateRef } from 'vue'
import type { ElButton } from 'element-plus'

const DATA_TYPE_OPTIONS = [
  'Array',
  'Map',
  'Boolean',
  'Integer',
  'Number',
  'String',
  'Time',
  'Date',
  'DateTime',
  'Any',
]

const props = defineProps<{
  node: any
  data: any
  readonly?: boolean
}>()

const emit = defineEmits<{
  openEncryption: [encryptionRef: HTMLElement, data: any]
  removeEncryption: [data: any, i: number]
  addChild: [data: any]
  deleteField: [data: any]
  updateFieldName: [data: any, newName: string]
  updateFieldType: [data: any, newType: string]
}>()

const encryptionRef =
  useTemplateRef<InstanceType<typeof ElButton>>('encryptionRef')

const encryptionsMap = inject('encryptionsMap') as Record<string, string>

const isContainerType = (type: string) => {
  return ['OBJECT', 'DOCUMENT', 'ARRAY', 'MAP'].includes(type?.toUpperCase())
}

const isUserCreated = (data: any) => {
  return data.tag === 'USER_CREATE'
}

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

const handleUserFieldNameUpdate = (value: string) => {
  props.data.name = value
}

const handleUserFieldNameChange = (value: string) => {
  if (!value) {
    props.data.label = props.data.name
    return
  }
  emit('updateFieldName', props.data, value)
}

const handleTypeChange = (val: string) => {
  props.data.simpleTypeName = val
  emit('updateFieldType', props.data, val)
}

const handleRemoveEncryption = (i: number) => {
  emit('removeEncryption', props.data, i)
}

const handleAddChild = () => {
  emit('addChild', props.data)
}

const handleDeleteField = () => {
  emit('deleteField', props.data)
}
</script>

<template>
  <div
    class="flex flex-1 align-center gap-2 field-node min-w-0 pr-2"
    style="--btn-space: 0"
    :data-field-name="data.field_name"
    :class="{
      'custom-disabled-node': data.customDisabled,
      'user-created-node': isUserCreated(data),
    }"
  >
    <template v-if="isUserCreated(data)">
      <TextEditable
        v-if="node.checked || node.indeterminate"
        v-model:value="data.label"
        class="color-primary"
        hidden-icon
        :min-width="4"
        :maxlength="48"
        @click.stop
        @update:value="handleUserFieldNameUpdate"
        @change="handleUserFieldNameChange"
      />
      <span v-else class="px-1 py-0.5 node-name user-created-name">{{
        data.name
      }}</span>
      <el-tag
        size="small"
        type="primary"
        effect="light"
        class="user-created-badge"
        disable-transitions
        >{{ $t('public_button_add') }}</el-tag
      >
    </template>
    <template v-else>
      <span
        v-if="
          (!node.checked && !node.indeterminate) ||
          readonly ||
          data.customDisabled
        "
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
    </template>
    <el-button
      v-if="isContainerType(data.simpleTypeName || data.dataType) && !readonly"
      text
      size="small"
      type="primary"
      class="add-child-btn"
      @click.stop="handleAddChild"
    >
      <el-icon size="12"><i-lucide-plus /></el-icon>
      <span class="ml-0.5">{{
        $t('packages_business_data_server_add_sub_field')
      }}</span>
    </el-button>
    <el-button
      v-if="isUserCreated(data) && !readonly"
      class="delete-field-btn"
      text
      size="small"
      @click.stop="handleDeleteField"
    >
      <template #icon>
        <i-lucide-trash-2 />
      </template>
    </el-button>
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
        <i-lucide-shield-ellipsis />
      </el-icon>
      <el-icon v-else color="var(--icon-n3)"><i-lucide-shield /></el-icon>
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
    <el-select
      v-if="isUserCreated(data) && !readonly"
      :model-value="data.simpleTypeName || data.dataType"
      size="small"
      class="type-select font-mono"
      @change="handleTypeChange"
      @click.stop
    >
      <el-option
        v-for="t in DATA_TYPE_OPTIONS"
        :key="t"
        :value="t"
        :label="t"
      />
    </el-select>
    <el-tag v-else class="is-code font-mono" size="small" disable-transitions>{{
      data.simpleTypeName || data.dataType
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
.user-created-name {
  color: var(--el-color-primary);
}
.user-created-badge {
  flex-shrink: 0;
}
.add-child-btn {
  display: none;
  flex-shrink: 0;
}
.delete-field-btn {
  display: none;
  flex-shrink: 0;
}
.field-node:hover {
  .add-child-btn {
    display: inline-flex;
  }
  .delete-field-btn {
    display: inline-flex;
  }
}
.type-select {
  width: auto;
  flex-shrink: 0;
  --el-fill-color-blank: rgba(129, 139, 152, 0.12);
  --el-border-color: transparent;
  :deep(.el-select__wrapper) {
    box-shadow: none !important;
    .el-select__placeholder {
      position: relative;
      top: unset;
      transform: none;
    }
  }
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

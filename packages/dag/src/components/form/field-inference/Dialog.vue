<script setup lang="ts">
import { dataType2TapType } from '@tap/api/src/core/metadata-instances'
import noData from '@tap/assets/images/noData.png'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { computed, reactive, ref, watch } from 'vue'
import { useDataflowStore } from '../../../stores/dataflow.store'

defineOptions({ name: 'FieldInferenceDialog' })

const props = withDefaults(
  defineProps<{
    form: any
    visible?: boolean
    fieldChangeRules?: any[]
    readonly?: boolean
  }>(),
  {
    visible: false,
    fieldChangeRules: () => [],
    readonly: false,
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:fieldChangeRules': [value: any[]]
}>()

const { t } = useI18n()
const dataflowStore = useDataflowStore()

const activeNode = computed(() => dataflowStore.selectedNode)

const ruleForm = reactive<{
  visible: boolean
  list: any[]
  options: any[]
}>({
  visible: false,
  list: [],
  options: [],
})

const editBtnLoading = ref(false)
const nodeRules = ref<any[]>([])

watch(
  () => props.visible,
  (v) => {
    ruleForm.visible = v
    v && loadData()
  },
)

function loadData() {
  const filtered = props.fieldChangeRules.filter(
    (item: any) => item.scope === 'Node',
  )
  nodeRules.value = cloneDeep(filtered)
  ruleForm.list = cloneDeep(filtered)
}

function handleCancel() {
  loadData()
  ruleForm.visible = false
  emit('update:visible', ruleForm.visible)
}

function getSubmitDisabled() {
  return (
    props.readonly ||
    ruleForm.list.some((item: any) => !item.accept || !item.result?.dataType) ||
    JSON.stringify(nodeRules.value) === JSON.stringify(ruleForm.list)
  )
}

function handleUpdate() {
  ruleForm.visible = false
  const result = [
    ...props.fieldChangeRules.filter((item: any) => item.scope === 'Field'),
    ...ruleForm.list,
  ]
  props.form.setValuesIn('fieldChangeRules', result)
  emit('update:fieldChangeRules', result)
  emit('update:visible', ruleForm.visible)
}

function submit() {
  const node = activeNode.value ?? ({} as any)
  const { list } = ruleForm
  if (!list.length) {
    handleUpdate()
    return
  }
  const dataTypes = list.map((item: any) => item.result.dataType)
  const params = {
    databaseType: node.databaseType,
    dataTypes,
  }
  editBtnLoading.value = true
  dataType2TapType(params)
    .then((data: any) => {
      const result = list.map((item: any) => {
        const val = data[item.result.dataType]
        item.result.tapType = val && val.type !== 7 ? JSON.stringify(val) : null
        return item
      })
      if (result.some((item: any) => !item.result?.tapType)) {
        ElMessage.error(t('packages_form_field_inference_list_geshicuowu'))
        editBtnLoading.value = false
        return
      }
      handleUpdate()
      ElMessage.success(t('public_message_operation_success'))
    })
    .finally(() => {
      editBtnLoading.value = false
    })
}
</script>

<template>
  <ElDialog
    v-model="ruleForm.visible"
    width="600px"
    append-to-body
    :title="$t('packages_form_field_inference_dialog_mubiaoleixingpi')"
    class="batch-field-type-maping-table-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div v-if="ruleForm.list.length">
      <ElRow>
        <ElCol :span="9">{{
          $t('packages_form_field_inference_dialog_mubiaomorentui')
        }}</ElCol>
        <ElCol :span="3">&nbsp;</ElCol>
        <ElCol :span="9">{{
          $t('packages_form_field_inference_dialog_xiugaihoudelei')
        }}</ElCol>
        <ElCol v-if="!readonly" :span="3" class="text-center">{{
          $t('public_operation')
        }}</ElCol>
      </ElRow>
      <ElRow v-for="(item, index) in ruleForm.list" :key="index" class="mt-4">
        <ElCol :span="9">
          <ElInput
            v-model="item.accept"
            :placeholder="
              $t('packages_form_field_inference_dialog_cankaogeshiv')
            "
            disabled
          />
        </ElCol>
        <ElCol :span="3">
          <div
            class="flex justify-content-center align-items-center"
            style="height: 32px"
          >
            <VIcon size="16" class="color-primary">d-arrow-right</VIcon>
          </div>
        </ElCol>
        <ElCol :span="9" class="flex align-items-center">
          <ElInput
            v-model="item.result.dataType"
            :placeholder="
              $t('packages_form_field_inference_dialog_cankaogeshiv')
            "
            disabled
            class="mr-1"
          />
          <VIcon v-if="item.result.tapType === null" class="color-danger"
            >error</VIcon
          >
          <VIcon
            v-else
            :class="[!item.result.tapType ? 'color-disable' : 'color-success']"
            >success</VIcon
          >
          <!--            <span v-show="item.result.tapType === null" class="color-danger">错误</span>-->
        </ElCol>
        <ElCol v-if="!readonly" :span="3">
          <div
            class="flex justify-content-center align-items-center"
            style="height: 32px"
          >
            <VIcon
              size="16"
              class="cursor-pointer color-primary"
              @click="ruleForm.list.splice(index, 1)"
              >minus-circle</VIcon
            >
          </div>
        </ElCol>
      </ElRow>
      <!--        <div class="mt-4">-->
      <!--          <span class="inline-flex align-items-center cursor-pointer" @click="handleAdd(ruleForm.list.length)">-->
      <!--            <VIcon size="16" class="mr-1 cursor-pointer color-primary">plus-circle</VIcon>-->
      <!--            <span class="color-primary">添加</span>-->
      <!--          </span>-->
      <!--        </div>-->
      <!--        <div class="flex align-items-center mt-4">-->
      <!--          <VIcon class="color-primary">info</VIcon>-->
      <!--          <span class="fs-8">实际可用长度取决于目标数据库类型定义，请按需设置</span>-->
      <!--        </div>-->
    </div>
    <div v-else class="flex flex-column align-items-center">
      <img width="120px" :src="noData" />
      <div class="noData">{{ $t('public_data_no_data') }}</div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          type="primary"
          :disabled="getSubmitDisabled()"
          :loading="editBtnLoading"
          @click="submit"
          >{{ $t('public_button_confirm') }}</ElButton
        >
      </span>
    </template>
  </ElDialog>
</template>

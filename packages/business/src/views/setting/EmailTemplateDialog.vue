<script setup lang="ts">
import {
  Bold,
  Color,
  Document,
  FontSize,
  Highlight,
  IndentKeymap,
  Italic,
  ListItem,
  Paragraph,
  SystemVariable,
  Text,
  TiptapEditor,
  Underline,
} from '@tap/component/src/tiptap-editor'
import { computed, nextTick, reactive, ref } from 'vue'
import type { ElInput } from 'element-plus'

const props = defineProps<{
  keyMapping: Record<string, string>
}>()

const editor = ref<InstanceType<typeof TiptapEditor>>()
const titleInput = ref<InstanceType<typeof ElInput>>()

const activeType = ref('')
const visible = ref(false)
const rulesList = ref([])

const form = ref({
  emailAlarmTitle: '',
  emailAlarmContent: '',
})

const variablesMap = reactive({
  TASK_STATUS_ERROR: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'errorTime',
      label: '错误时间',
      icon: IconLucideClock,
    },
    {
      name: 'errorLog',
      label: '错误日志',
      icon: IconLucideTriangleAlert,
    },
  ],
  TASK_INSPECT_ERROR: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
  TASK_FULL_COMPLETE: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'completeTime',
      label: '完成时间',
      icon: IconLucideClock,
    },
  ],
  TASK_INCREMENT_START: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'cdcTime',
      label: 'CDC 时间',
      icon: IconLucideClock,
    },
  ],
  TASK_STATUS_STOP: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'stopTime',
      label: '停止时间',
      icon: IconLucideClock,
    },
  ],
  TASK_INCREMENT_DELAY: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'delayTime',
      label: '延迟时间',
      icon: IconLucideClock,
    },
  ],
  DATANODE_CANNOT_CONNECT: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
  DATANODE_HTTP_CONNECT_CONSUME: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
  DATANODE_TCP_CONNECT_CONSUME: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
  DATANODE_AVERAGE_HANDLE_CONSUME: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'nodeName',
      label: '节点名称',
      icon: IconLucideFileText,
    },
    {
      name: 'currentTime',
      label: '当前耗时',
      icon: IconLucideClock,
    },
    {
      name: 'threshold',
      label: '阈值',
      icon: IconLucideClock,
    },
    {
      name: 'occurredTime',
      label: '发生时间',
      icon: IconLucideClock,
    },
  ],
  PROCESSNODE_AVERAGE_HANDLE_CONSUME: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'nodeName',
      label: '节点名称',
      icon: IconLucideFileText,
    },
    {
      name: 'currentTime',
      label: '当前耗时',
      icon: IconLucideClock,
    },
    {
      name: 'threshold',
      label: '阈值',
      icon: IconLucideClock,
    },
    {
      name: 'occurredTime',
      label: '发生时间',
      icon: IconLucideClock,
    },
  ],
  INSPECT_TASK_ERROR: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'alarmDate',
      label: '告警时间',
      icon: IconLucideClock,
    },
  ],
  INSPECT_COUNT_ERROR: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'count',
      label: '差异行数',
      icon: IconLucideHash,
    },
  ],
  INSPECT_VALUE_ERROR: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
    {
      name: 'count',
      label: '差异行数',
      icon: IconLucideHash,
    },
  ],
  SYSTEM_FLOW_EGINGE_DOWN: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
  SYSTEM_FLOW_EGINGE_UP: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
  TASK_INSPECT_DIFFERENCE: [
    {
      name: 'taskName',
      label: '任务名称',
      icon: IconLucideFileText,
    },
  ],
})

const availableVariables = computed(() => {
  return variablesMap[activeType.value]
})

const extensions = [
  FontSize,
  Color,
  Highlight,
  Bold,
  Document,
  Paragraph,
  Text,
  Italic,
  Underline,
  IndentKeymap,
  ListItem,
  SystemVariable,
]

const insertVariable = (variableName) => {
  if (titleInput.value?.input === document.activeElement) {
    const input = titleInput.value.input as HTMLInputElement
    const start = input.selectionStart
    const end = input.selectionEnd
    const size = `{${variableName}}`.length
    form.value.emailAlarmTitle = `${form.value.emailAlarmTitle.slice(0, start)}{${variableName}}${form.value.emailAlarmTitle.slice(end)}`
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + size, start + size)
    }, 10)
  } else if (editor.value) {
    editor.value.insertVariable(variableName)
  }
}

const handleSelectType = (item) => {
  activeType.value = item.key
  form.value = item
}

const open = (data) => {
  visible.value = true
  rulesList.value = data.map((item) => ({
    key: item.key,
    emailAlarmTitle: item.emailAlarmTitle,
    emailAlarmContent: item.emailAlarmContent,
  }))

  handleSelectType(rulesList.value[0])
}

const emit = defineEmits(['save'])

const onSave = () => {
  emit('save', rulesList.value)
  visible.value = false
}

const onCancel = () => {
  visible.value = false
}

console.log('rulesList', rulesList.value, form)

defineExpose({
  open,
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="自定义邮件模板"
    width="80vw"
    append-to-body
    class="mail-template-dialog p-0"
  >
    <div class="border-top border-bottom flex flex-1 min-h-0">
      <div class="flex flex-column">
        <el-scrollbar>
          <div class="bg-light p-3 pl-4">
            <div class="font-color-light mb-3 px-2">告警邮件类型</div>

            <div class="flex flex-column gap-1 menu-list">
              <div
                v-for="(item, i) in rulesList"
                :key="i"
                class="p-2 rounded-lg cursor-pointer menu-list-item"
                :class="{ active: activeType === item.key }"
                @click="handleSelectType(item)"
              >
                <span class="menu-list-item-title">{{
                  keyMapping[item.key]
                }}</span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <div class="flex-1 p-4 border-start overflow-y-auto">
        <el-form label-position="top">
          <el-form-item label="邮件主题">
            <el-input ref="titleInput" v-model="form.emailAlarmTitle" />
          </el-form-item>

          <el-form-item label="邮件正文">
            <TiptapEditor
              ref="editor"
              v-model="form.emailAlarmContent"
              class="w-100"
              :extensions="extensions"
            />
          </el-form-item>

          <el-form-item>
            <template #label>
              <div class="flex flex-column">
                <span>可用变量</span>
                <span class="fs-8 font-color-light">
                  点击变量名称插入到模板中
                </span>
              </div>
            </template>
            <div class="variables flex flex-wrap gap-3">
              <span
                v-for="variable in availableVariables"
                :key="variable.name"
                class="variable-chip rounded-lg border px-3 py-2 flex align-center gap-3 hover:bg-light cursor-pointer"
                @mousedown="insertVariable(variable.name)"
              >
                <el-icon :size="18">
                  <component :is="variable.icon" />
                </el-icon>

                <div class="flex flex-column lh-base">
                  <span class="font-color-dark">{{
                    `\{${variable.name}\}`
                  }}</span>
                  <span class="font-color-light fs-8">{{
                    variable.label
                  }}</span>
                </div>
              </span>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.mail-template-dialog {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-dialog__header {
    padding: 20px;
  }
  .el-dialog__footer {
    padding: 20px;
  }
  .el-dialog__body {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .menu-list {
    max-width: 300px;
    .menu-list-item {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px;
      height: 32px;
      cursor: pointer;
      white-space: nowrap;
      user-select: none;
      .menu-list-item-title {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: var(--fill-hover);
      }
    }

    .menu-list-item.active {
      background: var(--primary-hover-light);
      color: var(--el-color-primary);
      &::after {
        background: var(--el-color-primary);
        border-radius: 0.375rem;
        content: '';
        height: 20px;
        left: -0.5rem;
        position: absolute;
        top: calc(50% - 10px);
        width: 0.25rem;
      }
    }
  }
}
</style>

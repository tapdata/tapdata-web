<script setup lang="ts">
import { updateGroupInfo, type GroupInfoDto } from '@tap/api/core/group-info'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'

const { t } = useI18n()

const visible = defineModel<boolean>()

const props = defineProps<{
  group: GroupInfoDto | null
}>()

// 表单数据
const formData = ref({
  repoUrl: '',
  token: '',
})

// 保存状态
const saving = ref(false)

// 监听弹窗打开，初始化表单数据
watch(
  () => props.group,
  (group) => {
    if (group?.gitInfo) {
      formData.value = {
        repoUrl: group.gitInfo.repoUrl || '',
        token: group.gitInfo.token || '',
      }
    } else {
      // 重置表单
      formData.value = {
        repoUrl: '',
        token: '',
      }
    }
  },
  { immediate: true },
)

// 表单验证规则
const rules = {
  repoUrl: [
    {
      required: true,
      message: t('data_import_export_git_repo_url_required'),
      trigger: 'blur',
    },
  ],
}

// 保存配置
const formRef = ref()
const handleSave = async () => {
  if (!props.group?.id) {
    ElMessage.error(t('data_import_export_select_group_tip'))
    return
  }

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    await updateGroupInfo({
      ...props.group,
      gitInfo: {
        repoUrl: formData.value.repoUrl,
        token: formData.value.token,
      },
    })
    ElMessage.success(t('public_message_save_ok'))
    visible.value = false
  } catch {
    ElMessage.error(t('public_message_save_fail'))
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('data_import_export_git_config')"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      autocomplete="off"
    >
      <el-form-item
        :label="t('data_import_export_git_repo_url')"
        prop="repoUrl"
      >
        <el-input
          v-model="formData.repoUrl"
          placeholder="https://github.com/username/repo.git"
          autocomplete="off"
          name="git-repo-url-field"
        />
      </el-form-item>

      <el-form-item :label="t('data_import_export_git_token')" prop="token">
        <el-input
          v-model="formData.token"
          type="password"
          show-password
          :placeholder="t('data_import_export_git_token_placeholder')"
          autocomplete="new-password"
          name="git-token-field"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">
          {{ t('public_button_cancel') }}
        </el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          {{ t('public_button_save') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

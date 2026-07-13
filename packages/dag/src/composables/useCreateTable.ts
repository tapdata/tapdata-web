import { useI18n } from '@tap/i18n'
import { ElMessageBox } from 'element-plus'

/**
 * 弹出创建新表对话框，返回用户输入的表名
 * 如果用户取消则返回 null
 */
export function useCreateTable() {
  const { t } = useI18n()

  const promptCreateTable = async (): Promise<string | null> => {
    try {
      const { value } = await ElMessageBox.prompt(
        '',
        t('packages_dag_dialog_createTable'),
        {
          inputPlaceholder: t('packages_dag_dialog_placeholderTable'),
          inputValidator: (val) => !!val?.trim(),
          confirmButtonText: t('public_button_confirm'),
          cancelButtonText: t('public_button_cancel'),
        },
      )
      return value?.trim() || null
    } catch {
      // 用户取消
      return null
    }
  }

  return { promptCreateTable }
}


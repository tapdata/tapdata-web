import { taskApi } from '@tap/api'
import { useI18n, useMessage } from './'
import { getTaskBtnDisabled } from '@/utils/util'

export function useTaskButtons(emit) {
  const { $message } = useMessage()

  const component = function (task) {
    const i18n = useI18n()
    const disabledData = getTaskBtnDisabled(task)
    const id = task.id

    const start = () => {
      let filter = {
        where: {
          id
        }
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(res => {
        if (res) {
          taskApi.batchStart([id]).then(res => {
            $message.success(res?.message) || i18n.$t('message_operation_succuess')
            emit('start')
          })
        }
      })
    }
    return (
      <el-button type="text" disabled={disabledData.start} onClick={start}>
        {i18n.$t('task_list_run')}
      </el-button>
    )
  }
  return {
    component
  }
}

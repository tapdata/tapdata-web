import { defineComponent, toRefs, computed } from '@vue/composition-api'
import { getTaskBtnDisabled, isStopping } from '@/utils/util'
import { useI18n, useMessage } from '@/hooks'
import { taskApi } from '@tap/api'

// TODO 去掉root.$confirm, 改成使用hooks
export default defineComponent({
  props: {
    task: {
      type: Object,
      required: true
    },
    hideList: {
      type: Array,
      default: []
    }
  },
  setup(props, { emit, root }) {
    const { task, hideList } = toRefs(props)
    const { $t } = useI18n()
    const { success } = useMessage()

    // 获取停止任务的消息提示
    const getConfirmMessage = operateStr => {
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      let strArr = $t('dataFlow_' + message).split('xxx')
      let msg = `
        <p>
          ${strArr[0]}
          <span class="color-primary">${task.value.name}</span>
          ${strArr[1]}
        </p>`
      return {
        msg,
        title: $t('dataFlow_' + title)
      }
    }
    // 启动任务
    const start = () => {
      const id = task.value.id
      let filter = {
        where: {
          id
        }
      }
      taskApi.get({ filter: JSON.stringify(filter) }).then(() => {
        taskApi.batchStart([id]).then(data => {
          success(data?.message || $t('public_message_operation_success'))
          emit('trigger', 'start')
        })
      })
    }
    // 停止任务
    const stop = () => {
      const id = task.value.id
      root
        .$confirm($t('task_list_stop_confirm_message'), $t('task_list_important_reminder'), {
          type: 'warning'
        })
        .then(resFlag => {
          if (!resFlag) {
            return
          }
          taskApi.batchStop([id]).then(data => {
            success(data?.message || $t('public_message_operation_success'))
            emit('trigger', 'stop')
          })
        })
    }
    // 强制停止任务
    const forceStop = () => {
      const id = task.value.id
      let msgObj = getConfirmMessage('force_stop')
      root
        .$confirm(msgObj.msg, '', {
          type: 'warning',
          showClose: false,
          dangerouslyUseHTMLString: true
        })
        .then(resFlag => {
          if (!resFlag) {
            return
          }
          taskApi.forceStop([id]).then(data => {
            success(data?.message || $t('public_message_operation_success'))
            emit('trigger', 'forceStop')
          })
        })
    }
    // 编辑任务
    const edit = () => {
      emit('trigger', 'edit', task.value)
    }
    // 重置任务
    const reset = () => {
      const id = task.value.id
      let msgObj = getConfirmMessage('initialize')
      root
        .$confirm(msgObj.msg, msgObj.title, {
          type: 'warning',
          dangerouslyUseHTMLString: true
        })
        .then(resFlag => {
          if (!resFlag) {
            return
          }
          taskApi.batchRenew([id]).then(data => {
            emit('trigger', 'reset')
            success(data?.message || $t('public_message_operation_success'))
          })
        })
    }
    // 删除任务
    // 下拉菜单按钮触发
    const dropdownHandler = command => {
      if (command === 'reset') {
        reset()
      }
      if (command === 'details') {
        emit('trigger', 'details', task.value)
      }
      if (command === 'del') {
        emit('trigger', 'del', task.value)
      }
    }

    return () => {
      return (
        <div>
          <el-button type="text" disabled={props.task.btnDisabled.start} onClick={start}>
            {$t('public_button_start')}
          </el-button>
          <el-divider direction="vertical"></el-divider>
          {isStopping(task.value) ? (
            <el-button type="text" onClick={forceStop}>
              {$t('public_button__force_stop')}
            </el-button>
          ) : (
            <el-button type="text" disabled={props.task.btnDisabled.stop} onClick={stop}>
              {$t('public_button__stop')}
            </el-button>
          )}
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" disabled={props.task.btnDisabled.edit} onClick={edit}>
            {$t('public_button_edit')}
          </el-button>
          <el-divider direction="vertical"></el-divider>
          <el-dropdown onCommand={dropdownHandler} trigger="click">
            <el-link type="primary" class="rotate-90">
              <i class="el-icon-more"></i>
            </el-link>
            <el-dropdown-menu class="dataflow-table-more-dropdown-menu" slot="dropdown">
              {!hideList.value.includes('details') ? (
                <el-dropdown-item command="details">{$t('public_button_details')}</el-dropdown-item>
              ) : (
                ''
              )}
              <el-dropdown-item command="reset" disabled={props.task.btnDisabled.reset}>
                {$t('public_button_reset')}
              </el-dropdown-item>
              {!hideList.value.includes('del') ? (
                <el-dropdown-item command="del">{$t('public_button_delete')}</el-dropdown-item>
              ) : (
                ''
              )}
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      )
    }
  }
})

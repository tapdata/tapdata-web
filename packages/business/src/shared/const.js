export const ETL_STATUS_MAP = {
  running: { text: '运行中', type: 'success' },
  not_running: { text: '未运行', type: 'disable' },
  error: { text: '错误', type: 'danger' }
}

export const ETL_SUB_STATUS_MAP = {
  ready: { text: '待启动', type: 'ready' },
  edit: { text: '编辑中', type: 'edit' },
  scheduling: { text: '启动中', type: 'scheduling' },
  schedule_failed: { text: '错误', type: 'schedule_failed' },
  wait_run: { text: '启动中', type: 'wait_run' },
  running: { text: '运行中', type: 'running' },
  // pausing: { text: ' 暂停中', type: 'warning' },
  stopping: { text: '停止中', type: 'stopping' },
  // pause: { text: '暂停', type: 'warning' },
  stop: { text: '已停止', type: 'stop' },
  complete: { text: '已完成', type: 'complete' },
  error: { text: '错误', type: 'error' }
}

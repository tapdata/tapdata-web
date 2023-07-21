import i18n from '@/i18n'

export const INSTANCE_STATUS_MAP = {
    Creating: { text: i18n.t('public_agent_status_to_be_deployed'), type: 'waiting' },
    Starting: { text: i18n.t('public_status_starting'), type: 'waiting' },
    Running: { text: i18n.t('public_status_running'), type: 'success' },
    Stopping: { text: i18n.t('public_status_stopping') },
    Stopped: { text: i18n.t('public_agent_status_offline'), type: 'disable' },
    WaitingRestart: { text: i18n.t('public_status_to_be_restart'), type: 'waiting' },
    Restarting: { text: i18n.t('public_status_restarting') },
    Deploying: { text: i18n.t('public_status_deploying') },
    Altering: { text: i18n.t('public_status_altering') },
    Error: { text: i18n.t('public_status_error'), type: 'danger' },
    Deleted: { text: i18n.t('public_status_deleted'), type: 'disable' }
  },
  MDB_STATUS_MAP = {
    Init: { text: i18n.t('public_status_init'), type: 'waiting' },
    Creating: { text: i18n.t('public_status_creating'), type: 'waiting' },
    Activated: { text: i18n.t('public_status_activated') },
    Assigned: { text: i18n.t('public_status_activated') },
    WaitingDelete: { text: i18n.t('public_status_waiting_delete'), type: 'waiting' },
    Deleting: { text: i18n.t('public_status_deleting'), type: 'waiting' },
    Deleted: { text: i18n.t('public_status_deleted'), type: 'disable' }
  },
  ORDER_STATUS_MAP = {
    incomplete: { text: i18n.t('packages_business_shared_const_weizhifu'), type: 'waiting' },
    active: { text: i18n.t('packages_business_shared_const_yizhifu'), type: 'success' },
    payFail: { text: i18n.t('packages_business_shared_const_zhifushibai'), type: 'warning' },
    refund: { text: i18n.t('packages_business_shared_const_yituikuan'), type: 'disable' },
    past_due: { text: i18n.t('packages_business_shared_const_tuikuanshibai'), type: 'warning' },
    refunding: { text: i18n.t('packages_business_shared_const_tuikuanzhong') },
    incomplete_expired: { text: i18n.t('packages_business_shared_const_shixiao'), type: 'disable' },
    canceled: { text: i18n.t('packages_business_shared_const_yiquxiao'), type: 'disable' }
  },
  TICKET_STATUS_MAP = {
    Closed: { text: i18n.t('button_close'), type: 'success' },
    'On Hold': { text: i18n.t('button_hold'), type: 'disable' },
    Open: { text: i18n.t('button_open') }
  },
  TASK_STATUS_MAP = {
    running: { text: i18n.t('public_status_running'), icon: 'yunxingzhong', type: 'success' },
    paused: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong', type: 'warning' },
    error: { text: i18n.t('public_status_error'), icon: 'cuowu', type: 'danger' },
    draft: { text: i18n.t('public_status_wait_run'), icon: 'daiqidong', type: 'warning' },
    scheduled: { text: i18n.t('public_status_starting'), icon: 'qidongzhong' },
    stopping: { text: i18n.t('public_status_stopping'), icon: 'tingzhizhong', type: 'info' },
    'force stopping': { text: i18n.t('public_status_force_stopping'), icon: 'qiangzhitingzhi', type: 'danger' },
    finished: { text: i18n.t('public_status_finished'), icon: 'yiwancheng', type: 'success' }
  },
  CONNECTION_STATUS_MAP = {
    ready: { text: i18n.t('public_status_ready'), type: 'success' },
    invalid: { text: i18n.t('public_status_invalid'), type: 'danger' },
    testing: { text: i18n.t('public_status_testing'), type: 'warning' }
  },
  CONNECTION_STATUS_MAP_EN = {
    ready: { text: 'Ready', type: 'success' },
    invalid: { text: 'Invalid', type: 'danger' },
    testing: { text: 'Testing', type: 'warning' }
  },
  AGENT_STATUS_MAP_EN = {
    0: { text: i18n.t('dfs_instance_details_shangchuanzhong'), type: 'warning' }, //上传中
    1: { text: i18n.t('dfs_instance_instance_status_success'), type: 'success' }, //上传成功
    2: { text: i18n.t('dfs_instance_instance_status_false'), type: 'danger' }, //上传失败
    3: { text: i18n.t('dfs_instance_details_status_invalid'), type: 'danger' } //失效
  },
  MILESTONE_STATUS_MAP = {
    waiting: { text: i18n.t('task_milestone_waiting'), icon: 'daizhixing', type: 'warning' },
    running: { text: i18n.t('task_milestone_running'), icon: 'jinxingzhong', type: 'success' },
    error: { text: i18n.t('public_status_error'), icon: 'cuowu', type: 'danger' },
    finish: { text: i18n.t('public_status_finished'), icon: 'yiwancheng', type: 'success' },
    paused: { text: i18n.t('task_milestone_paused'), icon: 'yizanting', type: 'info' }
  }

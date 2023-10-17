import i18n from '@/i18n'

export const STATUS_MAP = {
  starting: i18n.t('dashboard_starting'),
  running: i18n.t('dashboard_running'),
  stopping: i18n.t('dashboard_stopping'),
  stopped: i18n.t('dashboard_stopped'),
  restarting: i18n.t('dashboard_restarting')
}

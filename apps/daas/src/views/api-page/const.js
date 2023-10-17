import i18n from '@/i18n'

export const STATUS_MAP = {
  deploying: i18n.t('modules_status_deploying'),
  starting: i18n.t('modules_status_starting'),
  running: i18n.t('modules_status_running'),
  restart: i18n.t('modules_status_restart'),
  deploy_fail: i18n.t('modules_status_deploy_fail'),
  exit: i18n.t('modules_status_exit'),
  stop: i18n.t('modules_status_stop'),
  ready: i18n.t('modules_status_ready'),
  invalid: i18n.t('modules_status_invalid')
}

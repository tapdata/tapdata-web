import VConfirm from '@/components/v-confirm'
import i18n from '@/i18n'
import timeFunction from '@/mixins/timeFunction'

export const formatTime = timeFunction.methods.formatTime

// 支持的数据源 'mysql','mariadb','mysql pxc','mongodb','postgres','oracle','sqlserver','redis'
// 不支持 'rest api','db2','sybase','gbase','gaussdb200','kafka','elasticsearch'
export const TYPEMAP = {
  mysql: 'MySQL',
  oracle: 'Oracle',
  mongodb: 'MongoDB',
  elasticsearch: 'Elasticsearch',
  redis: 'Redis',
  postgres: 'PostgreSQL',
  sqlserver: 'SQL Server',
  'gbase-8s': 'GBase 8s',
  'sybase ase': 'Sybase ASE',
  gaussdb200: 'GaussDB200',
  db2: 'IBM Db2',
  mem_cache: 'Memory Cache',
  file: 'File(s)',
  custom_connection: 'Custom connection',
  'rest api': 'REST API',
  'dummy db': 'Dummy DB',
  gridfs: 'GridFS',
  kafka: 'Kafka',
  mariadb: 'MariaDB',
  'mysql pxc': 'MySQL PXC',
  jira: 'jira',
  clickhouse: 'ClickHouse'
}

// 500错误弹窗
export const errorConfirmFnc = error => {
  let msg = `<div>${i18n.t('RequestErrorMessage_error_title')}</div>`
  let title = i18n.t('confirm_error_tip')
  error = typeof error === 'object' ? error : {}
  let code = error.code
  let reqId = error.data?.reqId
  if (code) {
    msg += `<div class="mt-1">${i18n.t(
      'RequestErrorMessage_code_label'
    )}<span class="color-disable">${code}</span></div>`
  }
  if (reqId) {
    msg += `<div class="mt-1">${i18n.t(
      'RequestErrorMessage_req_id_label'
    )}<span class="color-disable">${reqId}</span></div>`
  }
  if (error.message) {
    const mm = `${i18n.t('RequestErrorMessage_error_detail_label')}${i18n.t(
      'field_mapping_field_mapping_dialog_'
    )}<span class="color-disable" style="
    line-height: 18px;
">${error.message}</span>`
    msg += `<div class="error-confirm-fold mt-1">
                <input type="checkbox" id="errorConfirm" style="display: none" />
                <div class="error-confirm-fold-content text-truncate">${mm}</div>
                <label for="errorConfirm" class="color-primary cursor-pointer text-nowrap">${i18n.t(
                  'public_button_expand'
                )}</label>
              </div>`
  }
  VConfirm.confirm(msg, title, {
    type: 'error',
    iconSize: 18,
    dangerouslyUseHTMLString: true,
    confirmButtonText: i18n.t('confirm_reload_label'),
    cancelButtonText: i18n.t('public_button_close')
  }).then(flag => {
    if (flag) {
      location.reload()
    }
  })
}

// 毫秒换算成时分秒
export const formatMs = (msTime = 0, type = 'time') => {
  let time = msTime / 1000
  let arr = []
  arr.push({
    label: i18n.t('public_time_d'),
    value: Math.floor(time / 60 / 60 / 24)
  }) // day
  arr.push({
    label: i18n.t('public_time_h'),
    value: Math.floor(time / 60 / 60) % 24
  }) // hour
  arr.push({
    label: i18n.t('public_time_m'),
    value: Math.floor(time / 60) % 60
  }) // minute
  arr.push({
    label: i18n.t('public_time_s'),
    value: Math.floor(time) % 60
  }) // second
  let result = ''
  if (type === 'time') {
    result = arr
      .slice(1)
      .map(t => (t.value + '').padStart(2, '0'))
      .join(':')
    return result
  }
  arr.forEach(el => {
    if (el.value) {
      result += el.value + el.label
    }
  })
  if (!result) {
    result = msTime + i18n.t('public_time_ms')
  }
  return result
}

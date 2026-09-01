import { useI18n } from '@tap/i18n'

export function getAlarmKeyMap() {
  const { t } = useI18n()
  return {
    TASK_STATUS_ERROR: t(
      'packages_business_setting_alarmnotification_dangrenwuyudao',
    ),
    TASK_FULL_COMPLETE: t(
      'packages_business_setting_alarmnotification_dangrenwuquanliang',
    ),
    TASK_INCREMENT_START: t(
      'packages_business_setting_alarmnotification_dangrenwuzengliang',
    ),
    TASK_STATUS_STOP: t(
      'packages_business_setting_alarmnotification_dangrenwutingzhi',
    ),
    TASK_INCREMENT_DELAY: t(
      'packages_business_setting_alarmnotification_dangrenwudezeng',
    ),
    DATANODE_HTTP_CONNECT_CONSUME: t(
      'packages_business_setting_alarmnotification_dangshujuyuanwang',
    ),
    DATANODE_TCP_CONNECT_CONSUME: t(
      'packages_business_setting_alarmnotification_dangshujuyuanxie',
    ),
    DATANODE_AVERAGE_HANDLE_CONSUME: t(
      'packages_business_setting_alarmnotification_dangshujuyuanjie',
    ),
    PROCESSNODE_AVERAGE_HANDLE_CONSUME: t(
      'packages_business_setting_alarmnotification_dangjiediandeping',
    ),
    INSPECT_TASK_ERROR: t(
      'packages_business_setting_alarmnotification_dangjiaoyanrenwucuowu',
    ),
    INSPECT_COUNT_ERROR: t(
      'packages_business_setting_alarmnotification_dangjiaoyanrenwushuliangcuowu',
    ),
    INSPECT_VALUE_ERROR: t(
      'packages_business_setting_alarmnotification_dangjiaoyanrenwuzhicuowu',
    ),
    ENGINE_OFFLINE: t(
      'packages_business_setting_alarmnotification_dangyinqinglixian',
    ),
    ENGINE_ONLINE: t(
      'packages_business_setting_alarmnotification_dangyinqinghuifu',
    ),
    TASK_INSPECT_DIFFERENCE: t('packages_dag_task_inspect_difference_alarm'),
    TASK_RETRY_WARN: t('packages_dag_task_retry_alert'),
    TASK_DQL_EVENT: t('packages_business_task_dlq_event'),
    TASK_DQL_SAVE_FAILED: t('packages_business_task_dlq_save_failed'),
    TASK_DQL_RECOVERY_FAILED: t('packages_business_task_dlq_recovery_failed'),
    TASK_DQL_STORM_GUARD: t('packages_business_task_dlq_storm_guard'),
    API_SERVER_WORKER_DELAY_P50_WARN: t(
      'packages_business_setting_alarmnotification_api_server_worker_delay_p50_warn',
    ),
    API_SERVER_WORKER_DELAY_P95_WARN: t(
      'packages_business_setting_alarmnotification_api_server_worker_delay_p95_warn',
    ),
    API_SERVER_WORKER_DELAY_P99_WARN: t(
      'packages_business_setting_alarmnotification_api_server_worker_delay_p99_warn',
    ),
    API_SERVER_WORKER_ERROR_RATE_WARN: t(
      'packages_business_setting_alarmnotification_api_server_worker_error_rate_warn',
    ),
    API_SERVER_WORKER_ERROR_RATE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_worker_error_rate_alter',
    ),
    API_SERVER_API_DELAY_AVG_WARN: t(
      'packages_business_setting_alarmnotification_api_server_api_delay_avg_warn',
    ),
    API_SERVER_API_DELAY_P95_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_api_delay_p95_alter',
    ),
    API_SERVER_API_DELAY_P99_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_api_delay_p99_alter',
    ),
    API_SERVER_API_ERROR_RATE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_api_error_rate_alter',
    ),
    API_SERVER_ALL_API_ERROR_RATE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_all_api_error_rate_alter',
    ),
    API_SERVER_API_RESPONSE_SIZE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_api_response_size_alter',
    ),
    API_SERVER_CPU_USAGE_WARN: t(
      'packages_business_setting_alarmnotification_api_server_cpu_usage_warn',
    ),
    API_SERVER_CPU_USAGE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_cpu_usage_alter',
    ),
    API_SERVER_MEMORY_USAGE_WARN: t(
      'packages_business_setting_alarmnotification_api_server_memory_usage_warn',
    ),
    API_SERVER_MEMORY_USAGE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_memory_usage_alter',
    ),
    API_SERVER_WORKER_CPU_USAGE_WARN: t(
      'packages_business_setting_alarmnotification_api_server_worker_cpu_usage_warn',
    ),
    API_SERVER_WORKER_CPU_USAGE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_worker_cpu_usage_alter',
    ),
    API_SERVER_WORKER_MEMORY_USAGE_WARN: t(
      'packages_business_setting_alarmnotification_api_server_worker_memory_usage_warn',
    ),
    API_SERVER_WORKER_MEMORY_USAGE_ALTER: t(
      'packages_business_setting_alarmnotification_api_server_worker_memory_usage_alter',
    ),
    DATASOURCE_MONITOR_ALTER: t('packages_business_datasource_monitor_alter'),
    TASK_DDL_WARNING: t('packages_business_task_ddl_warning'),
    API_SERVER_P95_WARN: t('packages_business_api_server_p95_warn'),
    API_SERVER_P99_WARN: t('packages_business_api_server_p99_warn'),
    API_SERVER_ERROR_RATE_WARN: t(
      'packages_business_api_server_error_rate_warn',
    ),
    TASK_SOURCE_NO_INCREMENTAL_EVENT: t(
      'packages_business_task_source_no_incremental_event',
    ),
    API_SERVER_CONNECTION_POOL_DEFICIENCY_WARN: t(
      'packages_business_api_server_connection_pool_deficiency_warn',
    ),
    API_SERVER_CONNECTION_POOL_IDLE_WARN: t(
      'packages_business_api_server_connection_pool_idle_warn',
    ),
  }
}

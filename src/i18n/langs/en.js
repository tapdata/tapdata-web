export default {
  // 数据校验
  verify_details_title: 'Task verification details',
  verify_history_title: 'Task verification history',
  verify_diff_history_title: 'Diff verification history',
  verify_diff_details_title: 'Diff verification details',
  verify_result_title: 'Verification result',
  verify_button_diff_verify: 'Diff verification',
  verify_button_diff_verify_running: 'Verification in progress',
  verify_button_diff_verify_tips:
    'Re-verify the difference data result of this full verification, the difference in the number of rows does not support the difference verification',
  verify_last_start_time: 'Last verification time',
  verify_button_diff_task_history: 'Verify history',
  verify_message_old_data_not_support: 'Old data does not support secondary verification',
  verify_message_out_of_limit:
    'Your discrepancy data volume has exceeded the maximum number of error data saved by the task support, and the second verification is temporarily impossible.',
  verify_result_count_more: 'Target count more: {0}',
  verify_result_count_less: 'Target count less: {0}',
  verify_result_content_diff: 'Table data difference: {0}',
  verify_result_count_inconsistent: 'inconsistent',
  verify_result_count_consistent: 'consistent',

  taskprogress_plan_sync_table_num: 'Number of plan synchronization tables',
  taskprogress_completed_sync_table_num: 'Number of completed synchronization tables',
  taskprogress_plan_sync_data: 'Planned synchronization data volume (rows)',
  taskprogress_completed_sync_data: 'Completed synchronization data volume (rows)',
  taskprogress_current_sync: 'Current synchronization status of each library',
  taskprogress_full_sync_progress: 'Full sync progress',

  // 任务设置
  task_settings_cdc_sync_point_date: '【Task settings】Incremental acquisition start time, please select the time',

  // 数据源
  connection_form_tidb_server: 'TiDB address',
  connection_tidb_none_server: 'TiBD address cannot be empty',

  connection_list_column_schema_status: 'Schema loading status',
  connection_list_column_schema_status_tips: 'Connections after Schema loading can be created normally',

  //Dag
  dag_data_node_label_dameng: 'Dameng Node',
  dag_data_node_label_database_link_table: 'Table name case',
  dag_data_node_label_database_link_field: 'Field name case',
  dag_data_node_label_database_link_unchang: 'Unchanged',
  dag_data_node_label_database_link_to_uppercase: 'Uppercase',
  dag_data_node_label_database_link_to_lowercase: 'Lowercase',
  dag_data_node_label_memcache_type: 'Cache Type',
  dag_data_node_label_memcache_type_all: 'Global cache',
  dag_data_node_label_memcache_type_local: 'Local cache',
  dag_data_node_label_memcache_type_tip:
    'All tasks in the global cache can be referenced, and the local cache can only be referenced by the current DAG. ',
  dag_data_node_label_clickhouse: 'ClickHouse Node',
  dag_data_node_label_kafka_high_performance_mode: 'High performance mode',
  dag_data_node_label_kafka_all: 'All'
}

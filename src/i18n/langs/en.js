export default {
  // 通用提示
  tips_not_null: 'The value cannot be empty',
  tips_must_number: 'The value must be a number',

  // 通用按钮
  button_edit: 'Edit',
  button_confirm: 'Confirm',
  button_cancel: 'Cancel',
  button_back: 'Back',
  button_save: 'Save',

  // 通用消息
  message_title_prompt: 'Hint',
  message_delete_confirm: 'Delete or not',

  // 表格
  column_operation: 'Operate',

  // 菜单标题
  menu_title_function: 'Function management',

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
  verify_result_field_name: 'Field name',
  verify_result_source_info: 'Source Information',
  verify_result_target_info: 'Target Information',
  verify_create_window_duration: 'Window duration',

  taskprogress_plan_sync_table_num: 'Number of plan synchronization tables',
  taskprogress_completed_sync_table_num: 'Number of completed synchronization tables',
  taskprogress_plan_sync_data: 'Planned synchronization data volume (rows)',
  taskprogress_completed_sync_data: 'Completed synchronization data volume (rows)',
  taskprogress_current_sync: 'Current synchronization status of each library',
  taskprogress_full_sync_progress: 'Full sync progress',

  // 任务设置
  task_settings_cdc_sync_point_date: '【Task settings】Incremental acquisition start time, please select the time',

  // 数据源
  connection_form_tidb_server: 'PDServer address',
  connection_tidb_none_server: 'PDServer address cannot be empty',

  connection_list_column_schema_status: 'Schema loading status',
  connection_list_column_schema_status_tips: 'Connections after Schema loading can be created normally',

  connection_form_custom_connection_connection_time_out: 'Connection timeout (s)',
  connection_form_custom_connection_read_time_out: 'Read timeout (s)',
  connection_form_custom_connection_before_operate: 'Pre-operation',
  connection_form_custom_connection_after_operate: 'Post-operation',
  connection_kafka_kerberos_attest: 'kerberos authentication',
  connection_kafka_kerberos_config_keytab: 'Key representation file',
  connection_kafka_kerberos_config_conf: 'Configuration file',
  connection_kafka_kerberos_body_config: 'Body Configuration',
  connection_kafka_kerberos_service_name: 'Service name',
  connection_kafka_kerberos_tip:
    'The instance name mapping needs to be configured on the host where the Engine is located /etc/hosts',
  connection_kafka_kerberos_none_keytab: 'The key representation file cannot be empty',
  connection_kafka_kerberos_none_conf: 'Configuration file cannot be empty',
  connection_kafka_encryption: 'Encryption',
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
  dag_data_node_label_kafka_all: 'All',
  dag_data_node_label_aggregate_filter: 'Filter',
  dag_link_button_custom_script: 'Custom processing script',
  dag_data_node_hana_hana_check: 'Hana as a source only supports full tasks',

  //Field mapping
  dag_link_button_field_mapping: 'Field mapping',
  dag_link_button_mapping_configuration: 'Mapping configuration',
  dag_link_field_mapping_error_no_table: 'Please select the table to be migrated',
  dag_link_field_mapping_error_all_deleted:
    'All fields have been deleted from the current table, and the save operation is not allowed',
  dag_dialog_field_mapping_table_setting: 'Table Settings',
  dag_dialog_field_mapping_tip:
    'Users can set the fields to be synchronized for each table in the source database on this page, as well as the corresponding field names and field types when the target database is automatically created.',
  dag_dialog_field_mapping_table_rename: 'table rename',
  dag_dialog_field_mapping_field_rename: 'Field rename',
  dag_dialog_field_mapping_rollback_all: 'Restore default',
  dag_dialog_field_mapping_rollback_field: 'Restore default field',
  dag_dialog_field_mapping_search_table: 'Search table',
  dag_dialog_field_mapping_loading_schema: 'Loading, please wait...',
  dag_dialog_field_mapping_selected: 'Selected',
  dag_dialog_field_mapping_search_field: 'Search Field',
  dag_dialog_field_mapping_source_field: 'Source table field name',
  dag_dialog_field_mapping_source_type: 'Source table type',
  dag_dialog_field_mapping_source_precision: 'Source table scale',
  dag_dialog_field_mapping_source_scale: 'Source table precision',
  dag_dialog_field_mapping_target_field: 'Target table field name',
  dag_dialog_field_mapping_target_type: 'Target table type',
  dag_dialog_field_mapping_target_precision: 'Target table scale',
  dag_dialog_field_mapping_target_scale: 'Target table precision',
  dag_dialog_field_mapping_operate: 'Operation',
  dag_dialog_field_mapping_no_data: 'No data yet',
  dag_dialog_field_mapping_range_precision: 'Length range',
  dag_dialog_field_mapping_range_scale: 'Precision range',
  dag_dialog_field_mapping_batch_table_name: 'Batch change table name setting',
  dag_dialog_field_mapping_batch_field_name: 'Batch change field name settings',
  dag_dialog_field_mapping_example_prefix: 'Prefix',
  dag_dialog_field_mapping_example_suffix: 'Suffix',
  dag_dialog_field_mapping_example_tip: 'Explanation: the prefix and suffix set also follow the capitalization rules',
  dag_dialog_field_mapping_example_origin_table_name: 'Original table name',
  dag_dialog_field_mapping_example_change: 'After modification',
  dag_dialog_field_mapping_example: 'Example',
  dag_dialog_field_mapping_tittle_field_name: 'Modify the target table field name',
  dag_dialog_field_mapping_tittle_data_type: 'Modify the target table field type',
  dag_dialog_field_mapping_tittle_precision: 'Modify the length of the target field',
  dag_dialog_field_mapping_tittle_scale: 'Modify the precision of the target table',
  dag_dialog_field_mapping_error_tip: 'tip',
  dag_dialog_field_mapping_error_rollback_all: 'Are you sure you want to restore all to the default',
  dag_dialog_field_mapping_error_rollback: 'Are you sure you want to restore all to the default',
  dag_dialog_field_mapping_error_range: 'The current value does not meet the field range',
  dag_dialog_field_mapping_error_save_prefix: 'Detected that you still have',
  dag_dialog_field_mapping_error_save_suffix:
    'There is a problem with the field type setting of the table, please select the table with the problem in the table area on the left for processing',

  dag_job_check_source: 'as a source, only full tasks are supported',

  //Task edit
  task_job_setting_tip_title: 'Set reminder',
  task_job_setting_disable: 'Do not de-duplicate',
  task_job_tip_text:
    'The setting of the cache node (xxx) already exists in the task (###), please confirm whether to continue to create it? ',
  task_job_source_falg: 'as a source, only full tasks are supported',
  data_flow_automatically: 'automatically',
  data_flow_manually: 'manually',
  data_flow_oracle_logminer: 'Oracle Logminer Mode',
  task_job_link_type_table_tips: 'Table does not currently support foreign key replication',
  task_job_link_type_view_tips:
    'The setting of field mapping is temporarily not supported when copying the view. The field mapping function below this option will be disabled, and the field mapping that has been set will be reset.',
  task_job_link_confirm_message_rollback:
    'The setting of field mapping is not supported when copying the view. The field mapping function below this option will be disabled, and the field mapping that has been set will be reset. Are you sure to check it? ',
  task_setting_oracle_custom_analysis: 'OracleSQL custom analysis',

  // Function management
  function_tips_empty: 'Code lacks JS functions',
  function_button_create_custom_function: 'Create',
  function_button_import_jar: 'Import',
  function_button_edit: 'Edit',
  function_tips_name_repeat: 'Method name repeat',
  function_button_code_format: 'Format code',
  function_last_update_label: 'Update time',
  function_parameters_label: 'Parameters',
  function_type_label: 'Function type',
  function_type_option_custom: 'Custom function',
  function_type_option_jar: 'Third-party jar package',
  function_name_label: 'Function name',
  function_name_placeholder: 'Please enter the function name',
  function_name_repeat: 'Function name repeat',
  function_class_label: 'Class name',
  function_class_placeholder:
    'Please enter the class name, UDF function class name, the format is resource name. Class name',
  function_file_label: 'jar file',
  function_button_file_upload: 'Click to upload',
  function_file_upload_tips: 'Please upload the jar package file',
  function_file_upload_success: 'Upload successful',
  function_file_upload_fail: 'Upload failed',
  function_body_label: 'Function body',
  function_body_placeholder: 'Please enter the command format, which is an example of the specific usage of this UDF',
  function_parameters_describe_label: 'Parameter description',
  function_parameters_describe_placeholder:
    'Support input parameter types and specific description of return parameter types',
  function_return_value_label: 'Return value',
  function_return_value_placeholder: 'Please enter the return value',
  function_describe_label: 'Description',
  function_describe_placeholder: 'Please enter a description',
  function_format: 'Format',
  function_format_placeholder: 'Please enter a format',

  // 用户
  login_fail_too_many: 'The maximum number of password errors has been reached, please log in after 10 minutes'
}

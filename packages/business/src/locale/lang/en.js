export default {
  packages_business_status_wait_start: 'Ready To Start',
  packages_business_status_starting: 'Starting',
  packages_business_status_renewing: 'Resetting',
  packages_business_status_renew_failed: 'Reset Failed',
  packages_business_milestone_list_status_waiting: 'Waiting',
  packages_business_milestone_list_status_running: 'Running',
  packages_business_milestone_list_status_paused: 'Paused',
  packages_business_milestone_list_status_progressing: 'In progress',
  packages_business_milestone_list_status_cdc_progressing: 'Starting...',
  packages_business_milestone_list_status_cdc_finish: 'Data change syncing',
  packages_business_task_status_running: 'Running',
  packages_business_task_status_not_running: 'Not Running',
  packages_business_task_info_w: 'Week',
  packages_business_connection_form_data_source: 'Data source',
  packages_business_connection_selector_desc1:
    'The trial version is not currently supported',
  packages_business_connection_selector_desc2:
    'For more data sources, please use the official version',
  packages_business_task_info_log_placeholder: 'Please enter the log content',
  packages_business_task_info_no_more: 'No more',
  packages_business_customer_logs_to_solutions: 'View Solutions',
  packages_business_customer_logs_to_link: 'View database error help page',
  packages_business_customer_logs_no_more_data: 'No more data',
  packages_business_customer_logs_no_search_data: 'No search results',
  packages_business_customer_logs_copy_result: 'copied to clipboard',
  packages_business_loading: 'Loading',
  packages_business_schema_progress_status_error: 'Loading Error',
  packages_business_schema_progress_dialog_error_title: 'Schema loading error',
  packages_business_schema_progress_load_time: 'Loaded time: {0}',
  packages_business_dataFlow_batchSortOperation: 'Add or Remove Tags',
  packages_business_dataFlow_dataLoading: 'Data Loading ...',
  packages_business_message_upload_success: 'Upload Successful',
  packages_business_message_upload_fail: 'Upload Failed',
  packages_business_message_upload_msg:
    'Kindly upload the task file that needs to be imported',
  packages_business_modules_dialog_import_title: 'Task Import',
  packages_business_modules_dialog_condition: 'Condition',
  packages_business_modules_dialog_overwrite_data: 'Overwrite existing data',
  packages_business_modules_dialog_skip_data: 'Skip existing data',
  packages_business_modules_dialog_group: 'Group',
  packages_business_modules_dialog_file: 'File',
  packages_business_modules_dialog_upload_files: 'Upload Files',
  packages_business_connection_form_edit_connection: 'Edit Connection',
  packages_business_connection_form_data_source_type: 'Data source type',
  packages_business_connection_form_change: 'Change',
  packages_business_connection_form_rename: 'Rename',
  packages_business_connection_form_database_owner_tip:
    'Comma-separated list of expressions, use * to represent any character of any length',
  packages_business_connection_form_source_and_target_tip: `This data connection can be used as source and target at the same time in ${
    import.meta.env.VUE_APP_PAGE_TITLE
  }`,
  packages_business_connection_form_source_tip: `Please note that this data connection is only suitable for use as a source in ${
    import.meta.env.VUE_APP_PAGE_TITLE
  }, and cannot be used as a target.`,
  packages_business_connection_form_target_tip: `Please note that this data connection is only suitable for use as a target in ${
    import.meta.env.VUE_APP_PAGE_TITLE
  }, and cannot be used as a source.`,
  packages_business_connection_form_shared_mining: 'Using CDC Log Caching',
  packages_business_connection_form_shared_mining_tip:
    'Through CDC log caching, incremental logs can be efficiently mined without the need to repeatedly initiate the log collection process for multiple incremental tasks. This approach significantly reduces the consumption and waste of source library resources.',
  packages_business_connection_form_access_node: 'Agent Settings',
  packages_business_connection_form_automatic: 'Platform automatic allocation',
  packages_business_connection_form_manual: 'User specified manually',
  packages_business_connection_form_group: 'Assign by tag',
  packages_business_choose_agent: 'Select Agent',
  packages_business_choose_agent_group: 'Select Agent Tag',
  packages_business_priorityProcessId: 'Tag-Based Scheduling',
  packages_business_connection_form_access_node_tip:
    'When using the automatic mode, the platform will assign nodes for connection access, while in manual mode, the user is responsible for manually specifying the nodes for access',
  packages_business_connection_form_give_up: 'Give Up',
  packages_business_share_form_setting_table_name: 'Store MongoDB table name',
  packages_business_share_form_setting_log_time: 'Log save time',
  packages_business_message_saveFail: 'Save Failed',
  packages_business_connection_rename: 'Rename',
  packages_business_dataForm_saveFail: 'Save Failed.',
  packages_business_dataForm_error_connectionNameExist:
    'Connection name already existed.',
  packages_business_connection_list_form_database_type: 'Database Type',
  packages_business_connection_list_name: 'Connection Name',
  packages_business_connection_list_status: 'Status',
  packages_business_connection_list_desc:
    'Various types of data sources, including databases, structured files, application RESTful APIs, and custom interfaces, must be created before a migration or synchronization task can be initiated. For more detailed configuration instructions, please click',
  packages_business_connection_list_help_doc: 'Help Documentation',
  packages_business_connection_dataBaseStatus: 'Status',
  packages_business_connection_deteleDatabaseMsg:
    'After deleting connection xxx, this connection cannot be restored. ',
  packages_business_connection_checkMsg:
    'Please note that this data source is utilized by a transmission job or API and therefore cannot be deleted.',
  packages_business_connection_copyFailedMsg:
    'Copy failed, reason:  The setting item "Connections - create  duplicate source" need to be set to "false"',
  packages_business_text_open: 'Open',
  packages_business_connection_form_oracle_redoLog_parser: 'Bare Log',
  packages_business_connection_preview_no_sure: 'Do not confirm',
  packages_business_connection_preview_master_partition:
    'Write to master partition only',
  packages_business_connection_preview_isr_partition:
    'Write all ISR partitions',
  packages_business_message_cancel: 'Cancel',
  packages_business_message_confirm: 'Confirm',
  packages_business_connection_reloadTittle: 'Reload Schema',
  packages_business_connection_reloadMsg:
    'Reloading the schema of the database may take a significant amount of time. Are you sure you want to proceed with the schema reload?',
  packages_business_dataForm_primaryTest:
    'Starting the connection detection service, please wait…',
  packages_business_dataForm_testing: 'Testing, please wait for a while ...',
  packages_business_dataForm_test_testResultFail: 'Connection test failed',
  packages_business_dataForm_test_testResultSuccess:
    'Connection test successful',
  packages_business_dataForm_test_success: 'Pass',
  packages_business_dataForm_test_fail: 'Failed',
  packages_business_dataForm_test_testing: 'Not Tested',
  packages_business_dataForm_test_items: 'Test Items',
  packages_business_dataForm_test_result: 'Result',
  packages_business_dataForm_test_unTest: 'Waiting ... ',
  packages_business_dataForm_test_information: 'Information',
  packages_business_dataForm_test_error:
    'The test service request timed out, please close and try again.',
  packages_business_dataForm_test_retryBtn: 'Retry',
  packages_business_dataForm_test_retryTest:
    "Failed to start the connection test service. Please click on the 'Retry' button to try again.",
  packages_business_message_update_success: 'Modification succeeded',
  packages_business_task_preview_subtasks: 'Subtasks',
  packages_business_task_monitor_sync_type: 'Sync Type',
  packages_business_task_monitor_run_connection: 'Connection',
  packages_business_task_monitor_history_run_record: 'History run record',
  packages_business_task_details_sub_task: 'Subtask',
  packages_business_dataFlow_importantReminder: 'Important notice',
  packages_business_dataFlow_modifyEditText:
    'If the task is modified after editing',
  packages_business_dataFlow_nodeLayoutProcess: 'Node arrangement',
  packages_business_dataFlow_nodeAttributes: 'Node Attribute',
  packages_business_dataFlow_matchingRelationship: 'or matching attribute',
  packages_business_dataFlow_afterSubmission: 'Must be submitted',
  packages_business_dataFlow_runNomally:
    'To ensure that the job is running correctly',
  packages_business_dataFlow_editLayerTip:
    'otherwise the job will be abnormal, continue？',
  packages_business_dataFlow_continueEditing: 'Continue Editing',
  packages_business_task_monitor_progress: 'Task Progress',
  packages_business_task_monitor_run_log: 'Run Log',
  packages_business_task_monitor_mining_task: 'Mining Task',
  packages_business_dataFlow_inputOutput: 'Throughput',
  packages_business_dataFlow_dataScreening: 'Event Statistics',
  packages_business_dataFlow_throughputpop:
    'Throughput:The read speed from source node and the write speed to the target node, larger number is better',
  packages_business_task_monitor_full_completion_time:
    'It is estimated that full completion will take time',
  packages_business_task_monitor_total_insert: 'Total Insert',
  packages_business_task_monitor_total_update: 'Total Update',
  packages_business_task_monitor_total_delete: 'Total Delete',
  packages_business_task_info_start_time: 'Start Time',
  packages_business_task_info_node: 'Node',
  packages_business_task_info_frequency: 'Frequency',
  packages_business_task_info_select_node: 'Please select a node',
  packages_business_task_info_select_period: 'Please select a period',
  packages_business_task_info_select_frequency: 'Please select the frequency',
  packages_business_task_info_fifteen_min: 'The last fifteen minutes',
  packages_business_task_info_five_seconds: '5 seconds',
  packages_business_task_info_one_min: '1 minute',
  packages_business_task_info_full_progress: 'Inintal Sync progress',
  packages_business_task_info_calculating: 'Calculating',
  packages_business_task_info_increment_time_point:
    'The time point of the increment',
  packages_business_migrate_no_progress_statistics_yet:
    'No progress statistics yet',
  packages_business_migrate_no_latency_statistics_yet:
    'No latency statistics yet',
  packages_business_task_monitor_full_sync: 'Full synchronization overview',
  packages_business_task_info_table_number:
    'Plan full synchronization data volume',
  packages_business_task_info_completed:
    'Complete the full amount of synchronization data',
  packages_business_task_info_fully_completed: 'Fully Completed',
  packages_business_task_info_overView_status: 'Calculating',
  packages_business_button_clear: 'Clear',
  packages_business_button_rollback: 'RollBack',
  packages_business_task_monitor_status: 'Status',
  packages_business_task_info_synced: 'Synced',
  packages_business_task_info_task_init: 'Task Initialization',
  packages_business_task_info_task_structure: 'Structure Migration',
  packages_business_task_info_task_cdc: 'Incremental Synchronization',
  packages_business_task_info_srcName: 'Source data source name',
  packages_business_task_info_srcTableName: 'Source table name',
  packages_business_task_info_tgtName: 'Target data source name',
  packages_business_task_info_tgtTableName: 'Target table name',
  packages_business_task_info_cdc_delay: 'Delay (ms)',
  packages_business_task_info_cdc_time: 'The time point of the increment',
  packages_business_task_info_source_table: 'Source data table',
  packages_business_task_info_source_database: 'Source Database',
  packages_business_task_info_data_row: 'Data volume (row)',
  packages_business_task_info_target_table: 'Target data table',
  packages_business_task_info_amount_sync_data:
    'Completed synchronization data amount (rows)',
  packages_business_task_info_schedule: 'Progress',
  packages_business_task_info_table_name: 'Table Name',
  packages_business_task_info_overView_error_msg: 'Calculation Error',
  packages_business_share_task_table_name: 'Mining task name',
  packages_business_share_task_table_time: 'Mining Time',
  packages_business_share_task_table_status: 'Mining Status',
  packages_business_connection_list_schema_load_progress:
    'Schema loading progress',
  packages_business_connection_list_test_failed: 'Test connection failed',
  packages_business_task_info_connection_test: 'Test',
  packages_business_task_start_task: 'Start Task',
  packages_business_task_stop_task: 'Stop Task',
  packages_business_task_info_forced_stop_task: 'Force stop task',
  packages_business_task_info_running_time: 'running time',
  packages_business_task_info_operator: 'Operator',
  packages_business_task_info_operator_content: 'Operation Content',
  packages_business_task_info_data_screening: 'Event Statistics',
  packages_business_task_info_input_output: 'Input and output statistics',
  packages_business_task_info_throughputpop:
    'Input and output statistics: average source data collection speed and target write speed per second, the larger the value, the better',
  packages_business_task_monitor_time: 'Time',
  packages_business_task_monitor_mission_milestone: 'Task Milestone',
  packages_business_task_monitor_no_milestone_data:
    'Either this task has not yet been initiated or it has been reset, and as a result, there is no milestone data currently in progress.',
  packages_business_task_info_milestone: 'Milestone',
  packages_business_milestone_btn_check_error: 'Check Error Info',
  packages_business_task_monitor_mining_task_name: 'Mining task name',
  packages_business_task_monitor_mining_task_point_time: 'Mining time point',
  packages_business_task_monitor_mining_task_status: 'Mining Status',
  packages_business_button_bulk_import: 'Import',
  packages_business_message_save_fail: 'Save Failed',
  packages_business_task_list_transform_running: 'Field mapping running',
  packages_business_task_list_transform_done: 'Field mapping completed',
  packages_business_task_list_transform_error: 'Field mapping failed',
  packages_business_task_list_edit: 'Edit',
  packages_business_task_list_export: 'Export',
  packages_business_task_list_sync_type: 'Sync Type',
  packages_business_task_list_status_all: 'All Status',
  packages_business_task_list_button_monitor: 'Monitor',
  packages_business_task_preview_title: 'Database Migration Details',
  packages_business_task_preview_createUser: 'Creator',
  packages_business_task_preview_sync_type: 'Task Synchronization',
  packages_business_task_preview_type: 'Task Synchronization',
  packages_business_task_preview_id: 'Task ID',
  packages_business_task_preview_createAt: 'Create Time',
  packages_business_task_preview_createTime: 'Create Time',
  packages_business_task_preview_startTime: 'Start Time',
  packages_business_task_preview_initStartTime: 'Full start time',
  packages_business_task_preview_cdcStartTime: 'Incremental start time',
  packages_business_task_preview_taskFinishTime: 'Task completion time',
  packages_business_task_preview_taskLastHour: 'Total task duration',
  packages_business_task_preview_eventTime: 'The time point of the increment',
  packages_business_task_preview_cdcDelayTime: 'Incremental max delay time',
  packages_business_task_preview_failCount: 'Total number of failures',
  packages_business_message_resetOk: 'Reset Success',
  packages_business_dataFlow_multiError_notFound: 'This job does not existed.',
  packages_business_dataFlow_multiError_statusError:
    'Job status does not allow to do this operation.',
  packages_business_dataFlow_multiError_otherError:
    'Operation failed, please try it again.',
  packages_business_dataFlow_batchDelete: 'Batch Delete',
  packages_business_dataFlow_batchRest: 'Batch Reset',
  packages_business_dataFlow_bulkExport: 'Batch Export',
  packages_business_dataFlow_bulkScheuled: 'Batch Start',
  packages_business_dataFlow_bulkStopping: 'Batch Stop',
  packages_business_dataFlow_taskBulkOperation: 'Batch Operation',
  packages_business_dataFlow_addTag: 'Add Tag',
  packages_business_dataVerify_dataVerify: 'Data Verify',
  packages_business_dataFlow_selectAll: 'Select All',
  packages_business_dataFlow_skipError_title: 'Skip Error Settings',
  packages_business_dataFlow_skipError_tip:
    'There were data processing errors detected in the job, please make sure these errors have been addressed. If you would like to skip these errors, please check them and click the "Skip errors, continue to start" button.  ',
  packages_business_dataFlow_skipError_attention:
    'WARNING: If you chose to skip the errors, the relevant data may be discarded. ',
  packages_business_dataFlow_skipError_startJob:
    'Skip errors, continue to start',
  packages_business_dataFlow_skipError_taskName: 'Task Name',
  packages_business_dataFlow_skipError_errorTotal: 'Total XX, selected',
  packages_business_dataFlow_skipError_strip: 'row',
  packages_business_page_title_task_stat: 'Task Statistics',
  packages_business_task_info_subtasks_name: 'Subtask Name',
  packages_business_task_info_subtasks_status: 'Status',
  packages_business_dataFlow_view: 'View',
  packages_business_dataFlow_copy: 'Copy',
  packages_business_dataFlow_button_reset: 'Reset',
  packages_business_connection_type_source: 'Source',
  packages_business_connection_type_target: 'Target',
  packages_business_connection_type_source_and_target: 'Source&Target',
  packages_business_task_info_status_waiting: 'Waiting',
  packages_business_task_info_status_running: 'Running',
  packages_business_task_info_status_done: 'Done',
  packages_business_task_info_status_paused: 'Paused',
  packages_business_logs_detailed_sousuowushuju: 'Search no data',
  packages_business_logs_index_xiangxi: 'Detailed',
  packages_business_logs_index_putong: 'normal',
  packages_business_shared_task_yijingzhiweie: 'Already set to [error]',
  packages_business_shared_task_weishibiederen:
    'Unidentified task status: {val1}',
  packages_business_connections_databaseform_cicaozuohuidiu:
    'The current connection being established will be lost as a result of this operation.',
  packages_business_connections_databaseform_mingchengguizezhong:
    'Name rules: start with letters, 1 to 100 characters, can include letters, numbers, dashes, underscores, spaces',
  packages_business_connections_databaseform_zhongyingkaitouge:
    'Start with letters, 1 to 100 characters, can include letters, numbers, underscores, underscores, spaces',
  packages_business_connections_list_renwuzongshu: 'Total number of tasks: ',
  packages_business_connections_list_gailianjieyibei:
    'The connection has been invoked by the task listed below. Please either remove the task or adjust the settings and attempt to connect again.',
  packages_business_connections_preview_schem: 'Schema loading completed',
  packages_business_etl_details_caozuoshibaiqing:
    'The operation failed, please try again',
  packages_business_etl_details_shifouzhongzhigai: 'Reset this task? ',
  packages_business_etl_details_zhongzhirenwux:
    'Resetting task xxx will result in the clearing of all task synchronization progress, and the task will be re-executed from the beginning.',
  packages_business_dataFlow_agent_force_stop_confirm_message:
    'Forcibly stop task xxx. Since the agent is offline, we will only reset the status of the task, but we cannot stop the task. Please ensure that you have manually stopped or deleted the agent locally, or stop the task after the agent is connected.',
  packages_business_etl_details_qiangzhitingzhiren:
    'Forcefully stopping task xxx will immediately interrupt the data transmission, bring the task to an abrupt halt, and initiate a reset of the task.',
  packages_business_etl_details_shifouqiangzhiting:
    'Are you sure you want to forcibly stop this task?',
  packages_business_etl_details_zantingrenwux:
    'If task xxx is suspended, any table within the task that has not yet completed full synchronization will re-execute full synchronization when the task is resumed.',
  packages_business_etl_details_shifouzantinggai:
    'Do you want to suspend this task? ',
  packages_business_etl_details_shanchurenwux:
    'After deleting task xxx, this task cannot be restored',
  packages_business_etl_details_shifoushanchugai:
    'Are you sure you want to delete this task?',
  packages_business_etl_details_renwuXxx:
    'Task XXX includes aggregation processing nodes. If you stop and restart the task, it will first reset before resuming. Are you sure you want to proceed with stopping the task?',
  packages_business_etl_details_chushihualeixing:
    'Are you sure you want to suspend the task? Restarting an initialization task after suspension will result in synchronization from the beginning.',
  packages_business_etl_details_miaoshuneirong: 'Description',
  packages_business_statistics_index_tongburenwu: 'Sync Tasks',
  packages_business_statistics_index_qianyirenwu: 'Migration Tasks',
  packages_business_statistics_schedule_cike: 'At the moment',
  packages_business_statistics_schedule_shujukushiqu: 'Database time zone',
  packages_business_statistics_schedule_yonghuliulanqi:
    'User browser time zone',
  packages_business_statistics_schedule_shijian: 'Time:',
  packages_business_statistics_schedule_leixing: 'Type:',
  packages_business_dataFlow_delete_confirm_title: 'Delete the task? ',
  packages_business_dataFlow_delete_confirm_message:
    'After deleting task XXX, this task cannot be restored',
  packages_business_dataFlow_bulk_delete_confirm_title:
    'Delete tasks in batch? ',
  packages_business_dataFlow_bulk_delete_confirm_message:
    'After deleting tasks in batch, tasks cannot be restored',
  packages_business_dataFlow_stop_confirm_title:
    'Would you like to suspend this task?',
  packages_business_dataFlow_stop_confirm_message:
    'After the task xxx is suspended, when the table in the task that has not been fully synchronized is started again, the full synchronization will be performed again',
  packages_business_dataFlow_bulk_stop_confirm_title:
    'Do you want to pause tasks in bulk? ',
  packages_business_dataFlow_bulk_stop_confirm_message:
    'After the task is paused in batch, when the table in the task that has not been fully synchronized is started again, the full synchronization will be performed again',
  packages_business_dataFlow_force_stop_confirm_title:
    'Do you want to force stop this task? ',
  packages_business_dataFlow_force_stop_confirm_message:
    'Stopping task xxx forcefully will immediately halt data transmission, forcibly terminate the task, and reset it to its initial state.',
  packages_business_dataFlow_bulk_force_stop_confirm_title:
    'Do you want to force stop tasks in batches? ',
  packages_business_dataFlow_bulk_force_stop_confirm_message:
    'The batch forced stop task will immediately interrupt the data transmission to force the task to stop quickly and reset the task',
  packages_business_dataFlow_initialize_confirm_title:
    'Do you want to reset this task? ',
  packages_business_dataFlow_initialize_confirm_message:
    "Resetting task xxx will clear the task's synchronization progress and trigger a fresh execution of the task.",
  packages_business_dataFlow_bulk_initialize_confirm_title:
    'Do you want to reset tasks in bulk? ',
  packages_business_dataFlow_bulk_initialize_confirm_message:
    "Resetting the task in batches will clear the task's synchronization progress and trigger a fresh execution of the task.",
  packages_business_connections_databaseform_zidingyi: 'Custom',
  packages_business_connections_databaseform_duixiangshouji:
    'Object Collection',
  packages_business_verification_details_yichangshuju: 'Abnormal Data',
  packages_business_verification_details_mubiaobiaoming: 'Target table name',
  packages_business_verification_details_yuanbiaoming: 'Source table name',
  packages_business_verification_details_gongxijiaoyanjie:
    'Congratulations~ The content of the source table of the validation result is exactly the same as that of the target table, and there is no error record',
  packages_business_verification_details_mubiaobiaoziduan:
    'Target table field: value',
  packages_business_verification_details_yuanbiaoziduanzhi:
    'Source table field: value',
  packages_business_verification_details_xianshiwanzhengzi: 'Show full fields',
  packages_business_verification_details_jinxianshichayi:
    'Display only fields with differences.',
  packages_business_verification_details_yichangshujuhang:
    'Exception data (row):',
  packages_business_verification_details_mubiaobiao: 'Target table:',
  packages_business_verification_details_yuanbiao: 'Source table:',
  packages_business_verification_details_jiaoyanjieguo: 'Result',
  packages_business_verification_details_jiaoyanzhong: 'Verifying',
  packages_business_verification_details_jiaoyan: 'Verify',
  packages_business_verification_details_qingshurubiaoming:
    'Please enter the table name...',
  packages_business_shared_const_gaojingzhong: 'Alerting',
  packages_business_shared_const_yihuifu: 'Recovered',
  packages_business_components_alert_yiguanbi: 'Closed',
  packages_business_components_alert_huifu: 'Recovery',
  packages_business_shared_const_yiban: 'Normal',
  packages_business_shared_const_jinggao: 'Warning',
  packages_business_shared_const_yanzhong: 'Critical',
  packages_business_shared_const_jinji: 'Emergency',
  packages_business_external_storage: 'External Storage',
  packages_business_relation_details_chakanrenwu: 'View Tasks',
  packages_business_relation_details_shiyonggaiguanlian:
    'Use the task list for this {val}',
  packages_business_relation_list_jiaoyanrenwu: 'Validation Tasks',
  packages_business_relation_list_huancunrenwu: 'Cached tasks',
  packages_business_relation_list_qingshururenwu:
    'Please enter the task name...',
  packages_business_relation_details_huancun: 'Cache',
  packages_business_relation_details_wajue: 'Mining',
  packages_business_relation_details_renwu: 'Tasks',
  packages_business_agent_select_placeholder: 'Please select an agent',
  packages_business_agent_select_not_found:
    'This agent does not exist. Select another agent',
  packages_business_agent_select_not_found_for_rocksdb:
    'When using RocksDB as the shared mining storage, you need to manually specify an agent.',
  packages_business_components_connectiontypeselectorsort_wodeshujuyuan:
    'My Data Source',
  packages_business_components_connectiontypeselectorsort_jiaoyouTap: `Let ${import.meta.env.VUE_APP_PAGE_TITLE} conduct a comprehensive quality test to ensure the stability and quality of the plugin`,
  packages_business_components_connectiontypeselectorsort_zhuyizhelishi:
    'Note: here is the data source plugin uploaded by yourself, if you want to use it for production tasks, please submit the source code on GitHub',
  packages_business_components_connectiontypeselectorsort_zhuyiBet: `Note: Beta data sources have not passed ${import.meta.env.VUE_APP_PAGE_TITLE}'s certification testing process, and ${import.meta.env.VUE_APP_PAGE_TITLE} does not guarantee the stable operation of these data sources for the time being`,
  packages_business_components_connectiontypeselectorsort_shiyongbanzanbu:
    'Stay tuned for the following data sources to open',
  packages_business_components_connectiontypeselectorsort_betashu:
    'Beta data source',
  packages_business_components_connectiontypeselectorsort_renzhengshujuyuan:
    'GA data source',
  packages_business_connections_list_lianjiefenlei: 'Connection Category',
  packages_business_task_migratelist_renwufenlei: 'Task Classification',
  packages_business_components_connectiontypeselectorsort_jijiangshangxian:
    'Alpha data source',
  packages_business_task_list_renwubuzhichi:
    'The task does not support this operation',
  packages_business_connections_databaseform_keyicongbaohan:
    'You can exclude the specified table from the tables matched by the inclusion table rule.',
  packages_business_connections_databaseform_paichubiao: 'Exclude Table',
  packages_business_connections_databaseform_baohanbiao: 'Contain Table',
  packages_business_connections_list_wenjianleixingde:
    'At this time, the file type connection does not support schema loading.',
  // 数据校验
  packages_business_verification_task_name: 'Validation Name',
  packages_business_verification_type: 'Type',
  packages_business_verification_check_frequency: 'Frequency',
  packages_business_verification_single_repeating_verify:
    'Single/Repeat Validation',
  packages_business_verification_is_enabled: 'Enabled',
  packages_business_verification_single: 'Single',
  packages_business_verification_repeating: 'Repeat',
  packages_business_verification_row_verify: 'Count Validation',
  packages_business_verification_content_verify: 'All Fields Validation',
  packages_business_verification_joint_verify: 'Related Fields Validation',
  packages_business_verification_hash_verify: 'Hash Validation',
  packages_business_verification_job_enable: 'Enabled',
  packages_business_verification_job_disable: 'Disabled',
  packages_business_verification_check_same: 'Consistency',
  packages_business_verification_count_difference: 'Inconsistency',
  packages_business_verification_content_difference: 'Differences',
  packages_business_verification_executeVerifyTip: 'Execute',
  packages_business_verification_addVerifyTip: 'Create new validation job',
  packages_business_verification_historyTip: 'History',
  packages_business_verification_configurationTip: 'Edit',
  packages_business_verification_details_title: 'Task validation details',
  packages_business_verification_history_title: 'Task validation history',
  packages_business_verification_diff_history_title:
    'Validation difference history',
  packages_business_verification_diff_details_title:
    'Validation difference details',
  packages_business_verification_result_title: 'Result',
  packages_business_verification_button_diff_verify: 'Validation Difference',
  packages_business_verification_button_diff_verify_running:
    'Validation in progress',
  packages_business_verification_button_diff_verify_tips:
    'Cannot validation the difference in the number of rows in the re-validation of the differential data result from the full validation',
  packages_business_verification_last_start_time: 'Last validation time',
  packages_business_verification_button_diff_task_history: 'Verify History',
  packages_business_verification_message_old_data_not_support:
    'Old data does not support secondary validation',
  packages_business_verification_message_out_of_limit:
    'Your discrepancy data volume has exceeded the maximum number of error data saved by the task support, making it temporarily impossible to perform a second validation.',
  packages_business_verification_result_count_more: 'Target count more: {0}',
  packages_business_verification_result_count_less: 'Target count less: {0}',
  packages_business_verification_result_content_diff:
    'Table data difference: {0}',
  packages_business_verification_result_count_inconsistent: 'Inconsistent',
  packages_business_verification_result_count_consistent: 'Consistent',
  packages_business_verification_result_field_name: 'Field Name',
  packages_business_verification_result_source_info: 'Source Information',
  packages_business_verification_result_target_info: 'Target Information',
  packages_business_verification_create_window_duration: 'Window Duration',
  packages_business_verification_form_source_filter:
    'Source table data filtering',
  packages_business_verification_form_target_filter:
    'Target table data filtering',
  packages_business_verification_checking: 'Checking...',
  packages_business_verification_message_error_joint_table_not_set:
    'Please add validation conditions',
  packages_business_verification_message_error_joint_table_target_or_source_not_set:
    'The source table or the target table is not selected in the validation condition {val}',
  packages_business_verification_message_error_joint_table_target_or_source_filter_not_set:
    'The source table or target table data filter is not selected in the validation condition {val}',
  packages_business_verification_message_error_joint_table_field_not_match:
    'The number of index fields in the source table and the target table for validation condition {val} is not equal.',
  packages_business_verification_message_error_script_no_enter:
    'After enabling advanced validation, the JS validation logic cannot be empty',
  packages_business_verification_message_confirm_delete_script:
    'Are you sure you want to delete the custom JS validation logic',
  packages_business_verification_message_confirm_back:
    'This operation will lose the validation task currently being created (edited)',
  packages_business_verification_message_title_confirm_back:
    'Do you want to abandon creating (editing) the validation task?',
  packages_business_taskprogress_plan_sync_table_num:
    'Number of plan synchronization tables',
  packages_business_taskprogress_completed_sync_table_num:
    'Number of completed synchronization tables',
  packages_business_taskprogress_plan_sync_data:
    'Planned synchronization data volume (rows)',
  packages_business_taskprogress_completed_sync_data:
    'Completed synchronization data volume (rows)',
  packages_business_taskprogress_current_sync:
    'Current synchronization status of each library',
  packages_business_taskprogress_full_sync_progress: 'Full sync progress',
  packages_business_verification_verifyDetail: 'Verify Detail',
  packages_business_verification_sourceTable: 'Source Table',
  packages_business_verification_targetTable: 'Target Table',
  packages_business_verification_sourceRows: 'Source Table Verify Rows',
  packages_business_verification_rowConsistent: 'Count diff',
  packages_business_verification_contConsistent: 'Value diff',
  packages_business_verification_jointVerify: 'Related Fields Validation',
  packages_business_verification_verifyHistory: 'Verify History',
  packages_business_verification_tableDetail: 'Table Detail',
  packages_business_verification_configuration: 'Configuration',
  packages_business_verification_verifyName: 'Verify name',
  packages_business_verification_sourceTotalRows: 'Verify Rows',
  packages_business_verification_targetTotalRows: 'Target Rows',
  packages_business_verification_verifyStatus: 'Status',
  packages_business_verification_completeTime: 'Completion Time',
  packages_business_verification_verifyTime: 'Last Run Time',
  packages_business_verification_rowVerify: 'Count Validation',
  packages_business_verification_advanceVerify: 'Advanced Validation',
  packages_business_verification_JSVerifyLogic: 'JS validation logic',
  packages_business_verification_addJS: 'Add JS',
  packages_business_verification_returnMsg: 'Returned Message',
  packages_business_verification_returnedData: 'Returned Data',
  packages_business_verification_sourceTableData: 'Source table data',
  packages_business_verification_contentVerify: 'All Fields Validation',
  packages_business_verification_singleVerify: 'Single Verify',
  packages_business_verification_repeatingVerify: 'Repeating Verify',
  packages_business_verification_inconsistent: 'Inconsistent',
  packages_business_verification_consistent: 'Consistent',
  packages_business_verification_toBeVerified: 'To be validation',
  packages_business_verification_verifying: 'Verifying',
  packages_business_verification_verifyFinished: 'Validation Finished',
  packages_business_verification_verifyJobExpired: 'Verify job expired',
  packages_business_verification_executeVerifyInstantly: 'Execute Validation',
  packages_business_verification_deleteVerifyJob: 'Delete validation job',
  packages_business_verification_verifySetting: 'Verify Setting',
  packages_business_verification_batchVerify: 'Batch Verify',
  packages_business_verification_verifyType: 'Verify Type',
  packages_business_verification_verifytype: 'Verify Type',
  packages_business_verification_singleRepeatingVerify:
    'Single/Repeat Validation',
  packages_business_verification_rowAndContConsistent:
    'Row-and-Cont-consistent',
  packages_business_verification_sourceFieldName: 'Source Field Name',
  packages_business_verification_targetFieldName: 'Target Field Name',
  packages_business_verification_Value: 'Value',
  packages_business_verification_inconsistentType: 'Inconsistent Type',
  packages_business_verification_success:
    'The validation results show that the source table and the target table contents are completely consistent.',
  packages_business_verification_chooseJob: 'Choose Task',
  packages_business_verification_frequency: 'Frequency',
  packages_business_verification_startTime: 'Start Time',
  packages_business_verification_LastTime: 'Stop Time',
  packages_business_verification_startAndStopTime: 'Start and stop time',
  packages_business_verification_verifyInterval: 'Verify Interval',
  packages_business_verification_inconsistentCount:
    'Inconsistent data to be saved',
  packages_business_verification_table: 'Table',
  packages_business_verification_addTable: 'Add Table',
  packages_business_verification_automaticallyAdd: 'Automatically Add',
  packages_business_verification_enable: 'Enable',
  packages_business_verification_disable: 'Disable',
  packages_business_verification_isEnabled: 'Is Enabled',
  packages_business_verification_newVerify: 'New Validation',
  packages_business_verification_edit: 'Edit',
  packages_business_verification_clickVerified:
    'Click the bottons below to add tables to be verified',
  packages_business_verification_ChoosePKField: 'Choose index /PK field',
  packages_business_verification_indexField: 'Associated Fields',
  packages_business_verification_BasicSettings: 'Basic Settings',
  packages_business_verification_verifyCondition: 'Validation Conditions',
  packages_business_verification_clear: 'Clear',
  packages_business_verification_fastCountTip:
    'The fast count mode, which only verifies the number of rows in the source and target tables, is extremely fast, but it does not display the differential field values',
  packages_business_verification_contentVerifyTip:
    'Table full-field validation checks all fields of the source and target tables row by row, identifying differences in all fields but with a slower speed. This operation simultaneously queries both the source and target databases, potentially causing read pressure on the databases.',
  packages_business_verification_jointFieldTip:
    'Associative field value validation compares only the values of associated fields in the source and target tables, providing faster results compared to full-field validation. This operation simultaneously queries both the source and target databases, potentially causing read pressure on the databases.',
  packages_business_verification_waiting: 'To be verified',
  packages_business_verification_scheduling: 'Scheduling',
  packages_business_verification_error: 'Error',
  packages_business_verification_done: 'Validation Finished',
  packages_business_verification_running: 'Running',
  packages_business_verification_verifyProgress: 'Verify Progress',
  packages_business_verification_tasksTime: 'Please set start and stop time',
  packages_business_verification_tasksDataFlow: 'Please choose data flow job',
  packages_business_verification_tasksJobName:
    'Please enter validation task name',
  packages_business_verification_tasksVerifyCondition:
    'Please set validation condition',
  packages_business_verification_tasksVerifyInterval:
    'Please enter the calibration interval',
  packages_business_verification_lackSource:
    'The validation condition does not specify the selection of either the source table or the target table.',
  packages_business_verification_lackIndex:
    'The index field of the source table or target table in the validation condition {val} is not selected',
  packages_business_verification_tasksAmount:
    'The number of index fields in the source table and the target table in the validation condition is not equal',
  packages_business_verification_uniqueField: 'Unique field inconsistent ',
  packages_business_verification_otherField: 'Other field inconsistent',
  packages_business_verification_back: 'Back',
  packages_business_verification_startVerify: 'Executing Validation',
  packages_business_verification_deleteMessage:
    'Please be advised that deleting the validation task is an irreversible action and cannot be restored. Kindly confirm the deletion before proceeding.',
  packages_business_verification_checkStatusPre: 'The job status is ',
  packages_business_verification_checkStatusSuffix:
    'Status, Unable to configure validation settings',
  packages_business_verification_backConfirmMessage:
    'The current validation task being created will be lost as a result of this operation (edited).',
  packages_business_verification_backConfirmTitle:
    'Are you sure you want to abandon the process of creating (editing) validation tasks?',
  packages_business_verification_history_source_total_rows: 'Source Rows',
  packages_business_verification_form_label_error_save_count:
    'Number of saved errors',
  packages_business_verification_button_auto_add_table:
    'Automatically add table',
  packages_business_components_conditionbox_suoxuanrenwuque:
    'The selected task is missing node connection information',
  packages_business_components_conditionbox_cunzaichulijiedian_wufazidong:
    'Due to the presence of a processing node, the table cannot be added automatically',
  packages_business_components_conditionbox_shifouqingkongsuo:
    'Are you sure you want to clear all conditions?',
  packages_business_components_conditionbox_mubiaobiao: 'Target Table',
  packages_business_components_conditionbox_laiyuanbiao: 'Source Table',
  packages_business_components_conditionbox_daijiaoyanlianjie:
    'Connection to be validation',
  packages_business_components_conditionbox_jianyantiaojian:
    'Check Table Config',
  packages_business_components_conditionbox_zhankaibianji: 'Expand Edit',
  packages_business_components_fieldbox_tianjiahang: 'Add Row',
  packages_business_components_fieldbox_ziduan: 'Field',
  packages_business_components_fieldbox_qingshuruziduan:
    'Please enter the field name',
  packages_business_components_fieldbox_quanziduan: 'Full Field',
  packages_business_components_fieldbox_daijiaoyanmoxing:
    'Model to be verified',
  packages_business_verification_details_dongtaijiaoyan: 'Dynamic Validation',
  packages_business_verification_details_zhankai: 'Expand',
  packages_business_verification_details_shouqi: 'Close',
  packages_business_verification_form_diinde:
    'The validation condition{val1}, the model to be verified cannot be empty',
  packages_business_verification_form_zhaobudaojiedian:
    'We were unable to locate the table information corresponding to the node.',
  packages_business_verification_form_qingshurukaishi:
    'Please input a start time.',
  packages_business_verification_form_jiaoyanjieshushi: 'Verify end time',
  packages_business_verification_form_jiaoyankaishishi: 'Verify start time',
  packages_business_verification_form_zhishuchulaiyuan:
    'Retrieve only the inconsistent data from the source table as output.',
  packages_business_verification_form_shuchusuoyoubu:
    'Output all inconsistent data',
  packages_business_verification_form_jieguoshuchu: 'Result Output',
  packages_business_verification_form_zhidingrenyibiao:
    'Specify the validation task of any table',
  packages_business_verification_form_weitedingdeP:
    'Validation task created for a specific task',
  packages_business_verification_form_jiaoyanrenwumo: 'Validation task mode',
  packages_business_task_status_agent_tooltip_time:
    'It has been {time} since the previous status report was issued.',
  packages_business_task_status_agent_tooltip_agent:
    'The Agent where the task is located is',
  packages_business_task_status_retrying_tooltip:
    'The current task is being retried. Retry start at: {val}',
  packages_business_select_placeholder: 'Please add or select',
  packages_business_verification_form_youjiantongzhi: 'Mail Notification',
  packages_business_verification_form_xitongtongzhi: 'System Notification',
  packages_business_verification_form_jiaoyanjieguobu:
    'Warning for inconsistent validation results',
  packages_business_verification_form_jianyanrenwuyun:
    'Warning: there was an error encountered during the validation task run.',
  packages_business_verification_form_jiaoyangaojing: 'Validation Warning',
  packages_business_verification_form_zanbuzhichi_doris:
    'Doris is not supported yet.',
  packages_business_verification_form_task_alarm: 'Validation task alert',
  packages_business_verification_form_task_alarm_when_error:
    'Alert when the validation task fails',
  packages_business_verification_form_task_alarm_when_diff_result_over_count1:
    'When the number of difference rows of the count validation result is greater than',
  packages_business_verification_form_task_alarm_when_diff_result_over_count2:
    'start alert',
  packages_business_verification_form_task_alarm_when_result_table_over_count1:
    'When the difference between the table data of the value validation result is greater than',
  packages_business_task_status_error_tip:
    "ask_list_error_tip: 'The task has been successfully deleted, but the information of the following PostgreSQL connections failed to be cleared, and you need to manually clear them in the following ways",
  packages_business_task_status_next_run_time: 'Next run time: {val}',
  packages_business_relation_details_rizhiwajueshi: 'Log mining time',
  packages_business_relation_details_wajuemingcheng: 'Mining Name',
  packages_business_relation_details_wajuexinxi: 'Mining information',
  packages_business_connections_databaseform_shujuyuanzhongmo:
    'When the number of models in the data source is less than 10,000, the model will be refreshed once an hour; when the number of models in the data source is greater than 10,000, the model will be refreshed at the specified time every day.',
  packages_business_connections_databaseform_moxingjiazaipin: 'Model load time',
  packages_business_task_list_lianjieming: 'Connection name: ',
  packages_business_task_list_dierbushanchu:
    '// The second step delete slot_name',
  packages_business_task_list_diyibuchaxun:
    '//The first step is to query slot_name',
  packages_business_notify_sms_notification: 'SMS Notification',
  packages_business_notify_email_notification: 'Email Notification',
  packages_business_notify_webchat_notification: 'WeChat Notification',
  packages_business_notify_system_notice: 'System Notification',
  packages_business_notify_alarm_title: 'Agent Alert Setting',
  packages_business_setting_alarm_notification_notify_noticeInterval:
    'Sending Interval',
  packages_business_notify_notice_level: 'Notice Level',
  packages_business_setting_notification_alarm_notification_gaojingtongzhi:
    'Alert Notification',
  packages_business_setting_alarmnotification_gaojingzhibiao: 'Alert Indicator',
  packages_business_setting_alarmnotification_dangjiediandeping:
    'When the average processing time of the node exceeds the threshold',
  packages_business_setting_alarmnotification_dangshujuyuanjie:
    'When the average processing time of the data source node exceeds the threshold',
  packages_business_setting_alarmnotification_dangshujuyuanxie:
    'When the data source protocol connection time exceeds the threshold',
  packages_business_setting_alarmnotification_dangshujuyuanwang:
    'When the data source network connection takes time',
  packages_business_setting_alarmnotification_dangshujuwufa:
    'It takes time when the data cannot be connected to the network',
  packages_business_setting_alarmnotification_dangrenwudezeng:
    'When the replication delay of the task exceeds the threshold',
  packages_business_setting_alarmnotification_dangrenwutingzhi:
    'When the task stops',
  packages_business_setting_alarmnotification_dangrenwuzengliang:
    'When the task increment start',
  packages_business_setting_alarmnotification_dangrenwuquanliang:
    'When the task is fully completed',
  packages_business_setting_alarmnotification_dangrenwujiaoyan:
    'When task validation fails',
  packages_business_setting_alarmnotification_dangrenwuyudao:
    'When the task encounters an error',
  packages_business_setting_alarmnotification_dangrenwustop:
    'When the Agent service stops',
  packages_business_setting_alarmnotification_dangrenwuuP:
    'When the Agent service start',
  packages_business_setting_alarmnotification_msshigaojing: 's',
  packages_business_setting_alarmnotification_lianxu: 'Continuous',
  packages_business_setting_alarmnotification_dangjiaoyanrenwucuowu:
    'When the validation task encounters an error',
  packages_business_setting_alarmnotification_dangjiaoyanrenwushuliangcuowu:
    'When the number of different lines in the count validation result is greater than the threshold',
  packages_business_setting_alarmnotification_dangjiaoyanrenwuzhicuowu:
    'When the table data difference of the value validation result is greater than the threshold',
  packages_business_notify_user_all_notice: 'Notify All',
  packages_business_notify_unread_notice: 'Unread Message',
  packages_business_notify_mask_read: 'Mark this page as read',
  packages_business_notify_mask_read_all: 'Mark All Read',
  packages_business_notify_no_notice: 'No notice yet',
  packages_business_setting_alarmnotification_cichugaojinggui:
    'The alert rule setting here is the system global alert rule setting, and the priority of the alert rule setting on the task running monitoring page is higher than the system global setting',
  packages_business_setting_alarmnotification_renwumorengao:
    'Task default alert rule setting',
  packages_business_setting_alarmnotification_morengaojinggui:
    'Default Alert Rule',
  packages_business_setting_alarmnotification_renwugaojingshe:
    'Task Alert Setting',
  packages_business_setting_alarmnotification_recipient_setting:
    'Task Default Alarm Recipient Setting',
  packages_business_setting_alarmnotification_recipient_desc: `Set here as the system's global alarm recipient configuration. All configured recipients will receive alerts for the currently active system alarms.`,
  packages_business_setting_alarmnotification_recipient_default:
    'Default Alarm Recipient',
  packages_business_setting_alarmnotification_recipient: 'Alarm Recipient',
  packages_business_setting_alarmnotification_recipient_tip:
    'Supports configuring multiple alarm recipient emails, with multiple emails separated by commas.',
  packages_business_setting_alarmnotification_channel:
    'Alarm Notification Channel',
  packages_business_notify_no_webchat_notification:
    'Your account is not currently linked to WeChat. To receive notification information through WeChat, please log out and log back in, then scan the code to complete the binding process via WeChat',
  packages_business_connections_databaseform_bujiazai: 'Not Loaded',
  packages_business_connections_databaseform_system: 'Follow System Settings',
  packages_business_custom_node_placeholder:
    'Please enter the node name to search',
  packages_business_custom_node_edit_confirm:
    'The node is detected that the following running task has been invoked, and restart the task if the configuration needs to take effect',
  packages_business_task_list_sqLyuju: 'SQL statement:',
  packages_business_relation_details_waicunxinxi:
    'External storage information used',
  packages_business_milestone_list_cuowuxinxi: 'Error message',
  packages_business_milestone_list_progr: '({val1}%, remaining {val2})',
  packages_business_milestone_list_chucuo: 'Error',
  packages_business_milestone_list_shujuchuli: 'Data Processing',
  packages_business_milestone_list_mubiaoshujuxie: 'Write target data',
  packages_business_milestone_list_chuangjianmubiaobiao: 'Create target table',
  packages_business_milestone_list_lianjiebingyanzheng:
    'Connect and verify account permissions',
  packages_business_milestone_list_duquzengliangshu: 'Read incremental data',
  packages_business_milestone_list_kaiqizengliang: 'Open incremental',
  packages_business_milestone_list_duququanliangshu: 'Read full data',
  packages_business_milestone_list_finish:
    '{val1}/{val2} completed, {val3} ...',
  packages_business_milestone_list_zhengtijindu: 'Overall Progress',
  packages_business_milestone_list_jinhangzhongpr:
    'In progress, {val1}% completed, estimated remaining time {val2}',
  packages_business_milestone_list_zengliangshujuqian:
    'Incremental data migration',
  packages_business_milestone_list_quanliangshujuqian: 'Full data replication',
  packages_business_milestone_list_biaojiegouqianyi: 'Table structure copy',
  packages_business_milestone_list_load_table_structure: 'Load table structure',
  packages_business_milestone_list_shujujiedianchu: 'Connect data sources',
  packages_business_milestone_list_renwudiaodu: 'Task Scheduling',
  packages_business_milestone_list_haoshi: 'Time-Consuming',
  packages_business_milestone_list_guanjianbuzhou: 'Key Steps',
  packages_business_nodes_list_laiyuan: 'Source',
  //数据发现-数据对象
  object_list_name: 'Object Name',
  object_list_classification: 'Object Classification',
  object_list_type: 'Object Type',
  object_list_source_type: 'Source Type',
  object_list_source_information: 'Source Information',
  datadiscovery_catalogue_ziyuanbangding: 'Resource binding',
  datadiscovery_catalogue_lianjieduixiangming: 'Connection object name',
  datadiscovery_catalogue_ziyuanleixing: 'Resource Type',
  datadiscovery_objectlist_duixiangminglaiyuan: 'Object name/Data source',
  datadiscovery_objectlist_laiyuanfenlei: 'Source Classification',
  datadiscovery_previewdrawer_shujuxiang: 'Data Item',
  datadiscovery_previewdrawer_yewumingcheng: 'Business Name',
  datadiscovery_previewdrawer_lianjiemiaoshu: 'Connection Description',
  datadiscovery_previewdrawer_shujuliang: 'Data Volume',
  datadiscovery_previewdrawer_biangengshijian: 'Change Time',
  datadiscovery_previewdrawer_guanliyuan: 'Administrator',
  datadiscovery_previewdrawer_duixiangxiangqing: 'Object Details',
  datadiscovery_previewdrawer_yewumiaoshu: 'Business Description',
  datadiscovery_previewdrawer_yewuleixing: 'Business Type',
  datadiscovery_previewdrawer_suoyin: 'Index',
  datadiscovery_previewdrawer_waijian: 'Foreign Key',
  datadiscovery_previewdrawer_zhujian: 'Primary key',
  daas_data_discovery_previewdrawer_jiedian: 'Node',
  daas_data_discovery_previewdrawer_renwumiaoshu: 'Task Description',
  daas_data_discovery_previewdrawer_yinqingmiaoshu: 'Engine Description',
  daas_data_discovery_previewdrawer_yinqingmingcheng: 'Engine Name',
  daas_data_discovery_previewdrawer_jiedianshu: 'Number of nodes',
  daas_data_discovery_previewdrawer_shuchucanshu: 'Output Parameters',
  daas_data_discovery_previewdrawer_fuwumiaoshu: 'Service Description',
  daas_data_discovery_previewdrawer_jiedianmiaoshu: 'Node Description',
  daas_data_discovery_previewdrawer_shurujiedian: 'Input Node',
  daas_data_discovery_previewdrawer_shuchujiedian: 'Output Node',
  daas_data_discovery_previewdrawer_qingshurumingcheng: 'Please Enter name',
  connection_list_name: 'Connection Name',
  meta_table_default: 'Default',
  meta_table_not_null: 'Not Null',
  page_title_overview: 'Overview',
  metadata_meta_type_table: 'Data Table',
  packages_business_create_connection_dialog_xuanzeshujuyuan:
    'Choose Data Source Type',
  packages_business_create_connection_dialog_neirongSho:
    'Show Connectors in ALPHA State',
  packages_business_create_connection_dialog_neirongSho2:
    'Show Connectors in BETA State',
  packages_business_create_connection_dialog_neirongCho:
    'Choose a data source connector from below and configure the connection & credentials.',
  // 共享挖掘
  packages_business_shared_cdc_placeholder_task_name:
    'Please enter the mining task name to search',
  packages_business_shared_cdc_placeholder_connection_name:
    'Please enter the connection name to search',
  packages_business_shared_cdc_name: 'Please enter the task name ',
  packages_business_shared_cdc_setting_select_mode: 'Storage mode',
  packages_business_shared_cdc_setting_select_mongodb_tip:
    'Please enter mongodb connection',
  packages_business_shared_cdc_setting_select_table_tip:
    'Please enter the table name',
  packages_business_shared_cdc_setting_select_time_tip:
    'Please select the log saving time',
  packages_business_shared_cdc_setting_message_edit_save:
    'Save successfully, it will take effect after restarting the task',
  packages_business_shared_list_name: 'Mining name',
  packages_business_shared_list_time_excavation: 'Excavation Time',
  packages_business_shared_list_setting: 'Mining settings',
  packages_business_shared_list_status: 'Status',
  packages_business_shared_list_time: 'Mining Delay',
  packages_business_shared_list_edit_title: 'Mining Edit',
  packages_business_shared_list_edit_title_start_time: 'Mining Start Time',
  packages_business_shared_form_setting_table_name: 'Store MongoDB table name',
  packages_business_shared_form_setting_log_time: 'Log save time',
  packages_business_shared_form_edit_name: 'Mining name',
  packages_business_shared_form_edit_title:
    'Whether to give up editing this mining task',
  packages_business_shared_form_edit_text:
    'This operation will not save the modified content',
  packages_business_shared_detail_mining_info: 'Mining information',
  packages_business_shared_detail_name: 'Mining name',
  packages_business_shared_detail_log_mining_time: 'Log mining time',
  packages_business_shared_detail_log_time: 'log storage time',
  packages_business_shared_detail_call_task: 'Call task',
  packages_business_shared_detail_source_time: 'Source library time point',
  packages_business_shared_detail_sycn_time_point: 'Sync time point',
  packages_business_shared_detail_mining_status: 'Mining status',
  packages_business_shared_detail_button_table_info: 'Table details',
  packages_business_shared_detail_statistics_time: 'Statistics time',
  packages_business_shared_detail_incremental_time: 'The time point',
  packages_business_shared_mining_detail_wajuexiangqingx:
    'Mining details x-axis:',
  packages_business_stop_confirm_message:
    'Pausing job while it is in the full sync stage may cause it to run from the beginning, are you sure you want to pause?',
  packages_business_important_reminder: 'Important reminder',
  packages_business_tablename: 'Table name',
  packages_business_shared_cdc_persistence_rocksdb_path:
    'The local path to the RocksDB store',
  packages_business_shared_mining_table_jinriwajue: 'Mining Today',
  packages_business_shared_mining_table_leijiwajue: 'Cumulative Mining',
  packages_business_shared_mining_table_zuixinrizhishi: 'Latest log time',
  packages_business_shared_mining_table_shoutiaorizhishi:
    'Time of the first log',
  packages_business_shared_mining_table_jiaruwajueshi: 'Add mining time',
  packages_business_shared_mining_table_biaoming: 'Table Name',
  packages_business_shared_mining_table_wajuebiaoxinxi:
    'Mining table information',
  packages_business_relation_sharedlist_shiyongdewajue: 'The mining table used',
  packages_business_milestone_list_zengliangshujuxie: 'Incremental data write',
  packages_business_milestone_list_quanliangshujuxie: 'Full data write',
  packages_business_milestone_list_jinruzengliangshu:
    'Incremental data replication',
  packages_business_logs_nodelog_cuowuduizhan: 'Error Stack',
  packages_business_logs_nodelog_yuanyinfenxi: 'Cause Analysis',
  packages_business_logs_nodelog_xianshishijianchuo: 'Display Time',
  packages_business_connections_databaseform_chakanxintiaoren:
    'View heartbeat tasks',
  packages_business_connections_databaseform_dakaixintiaobiao:
    'After enabling this function, the platform will create a new table in the source database, and update this table in the source database at a frequency of once per second. With the help of this table, the platform can realize accurate data delay detection, And it can effectively monitor the health status of tasks. This function needs to have write permission on the source library to take effect.',
  packages_business_connections_databaseform_kaiqixintiaobiao:
    'Enable heartbeat table',
  packages_business_connections_databaseform_jiaobentiaoshi: 'Script Debugging',
  // api服务管理
  packages_business_data_server_drawer_qingshurucanshu:
    'Please enter parameter name',
  packages_business_data_server_drawer_paixu: 'Sort',
  packages_business_data_server_drawer_meigefenyefan:
    'Number of records returned per page',
  packages_business_data_server_drawer_fenyebianhao: 'Pagination number',
  packages_business_data_server_drawer_zidingyichaxun: 'Custom query',
  packages_business_data_server_drawer_morenchaxun: 'Default query',
  packages_business_data_server_drawer_qingxuanzeduixiang:
    'Please select the object name',
  packages_business_data_server_drawer_qingxuanzelianjie:
    'Please Select connection type',
  packages_business_data_server_drawer_qingshurufuwu:
    'Please enter service name',
  packages_business_data_server_drawer_quanxianfanwei: 'Authority Range',
  packages_business_data_server_drawer_selectPermissions:
    'Please select the scope of authority',
  packages_business_data_server_drawer_shilidaima: 'Sample Code',
  packages_business_data_server_drawer_shilidaima2: 'Sample Code',
  packages_business_data_server_drawer_fanhuijieguo: 'Return Result',
  packages_business_data_server_drawer_diaoyongfangshi: 'Call method',
  packages_business_data_server_drawer_fuwufangwen: 'Service Access',
  packages_business_data_server_drawer_shuchujieguo: 'Output Result',
  packages_business_data_server_drawer_pailietiaojian: 'Order condition',
  packages_business_data_server_drawer_shaixuantiaojian: 'Filter condition ',
  packages_business_data_server_drawer_canshuzhi: 'parameter value',
  packages_business_data_server_drawer_canshumingcheng: 'Parameter Name',
  packages_business_data_server_drawer_shurucanshu: 'Input Parameter',
  packages_business_data_server_drawer_jiekouleixing: 'Interface Type',
  packages_business_data_server_drawer_fabujiedian: 'Publishing Node',
  packages_business_data_server_drawer_caozuoleixing: 'Operation Type',
  packages_business_data_server_drawer_zanwumiaoshu: 'no description yet',
  packages_business_data_server_drawer_tiaoshi: 'Debug',
  packages_business_data_server_drawer_peizhi: 'Configuration',
  packages_business_data_server_drawer_chuangjianfuwu: 'Create API',
  packages_business_data_server_drawer_fuwuxiangqing: 'Service Details',
  packages_business_data_server_list_quedingchexiaogai:
    'Are you sure you want to revoke this service?',
  packages_business_data_server_list_quedingfabugai:
    'Are you sure you want to publish the service?',
  packages_business_data_server_list_querenshanchufu:
    'Are you sure you want to delete the service?',
  packages_business_data_server_list_huoqufuwuyu:
    'Get the service domain name Failed.',
  packages_business_data_server_list_fuwuzhuangtai: 'Status',
  packages_business_data_server_list_guanlianduixiang: 'Related Object',
  packages_business_data_server_list_fuwumingcheng: 'Service Name',
  packages_business_data_server_drawer_geshicuowu: 'Format error',
  packages_business_data_server_drawer_validate:
    'Only alphanumeric letters and underscores are allowed and must start with a letter.',
  packages_business_data_server_drawer_aPI_path_Settings: 'API Path Settings',
  packages_business_data_server_drawer_default_path: 'Default Path',
  packages_business_data_server_drawer_custom_path: 'Custom Path',
  packages_business_data_server_drawer_prefix: 'Prefix',
  packages_business_data_server_drawer_base_path: 'Base Path',
  packages_business_data_server_drawer_path: 'Path',
  packages_business_data_server_drawer_confirm_tip:
    'This will re-generate the API path, do you wish to continue?',
  packages_business_connection_debug_input_arg: 'Simulation Parameter',
  packages_business_connection_debug_input_arg_error:
    'Simulation parameter error',
  packages_business_more_than: 'More than',
  packages_business_more_than_after:
    'seconds, automatically terminate the trial run when no result is returned.',
  packages_business_connection_debug_form_error:
    'Please check the required fields on the form.',
  packages_business_connection_debug_as: 'As the',

  // LDP
  packages_business_data_console_sources: 'Sources',
  packages_business_data_console_fdm: 'Foundation Data Model',
  packages_business_data_console_mdm: 'Master Data Model',
  packages_business_data_console_targets: 'Targets & Services',
  packages_business_data_console_goto_ai_chat: 'Ask AI',
  packages_business_create_clone_task: 'Create Cloning Pipeline',
  packages_business_create_sync_task: 'Create Sync Pipeline',
  packages_business_table_prefix: 'Table Prefix',
  packages_business_last_data_change_time: 'Last Event Time',
  packages_business_cdc_delay_time: 'Replication Delay',
  packages_business_rows: 'Rows',
  packages_business_columns: 'Columns',
  packages_business_storage_size: 'Storage Size',
  packages_business_columns_preview: 'Columns Preview',
  packages_business_sample_data: 'Sample Data',
  packages_business_table_preview_task: 'This task of source/target model',
  packages_business_table_preview_connection_task:
    'Task with this connection as source/target',
  packages_business_table_count: 'Table Count',
  packages_business_overview: 'Overview',
  packages_business_tasks: 'Tasks',
  packages_business_model_update_time: 'Model Update Time',
  packages_business_save_and_more: 'Save & Add More',
  packages_business_table_status_error: 'Error',
  packages_business_table_status_draft: 'Draft',
  packages_business_table_status_normal: 'Normal',
  packages_business_data_console_target_no_task:
    'No tasks configured for this target.',
  packages_business_data_console_target_no_api:
    'No API configured for this application.',
  packages_business_data_console_target_connection_desc: 'Sync data to {val}',
  packages_business_view_more: 'View More',
  packages_business_view_collapse: 'Collapse',

  packages_business_shared_const_shier: 'Twelve',
  packages_business_shared_const_shiyi: 'Eleven',
  packages_business_shared_const_shi: 'Ten',
  packages_business_shared_const_jiu: 'Nine',
  packages_business_shared_const_ba: 'Eight',
  packages_business_shared_const_qi: 'Seven',
  packages_business_shared_const_liu: 'Six',
  packages_business_shared_const_wu: 'Five',
  packages_business_shared_const_si: 'Four',
  packages_business_shared_const_san: 'Three',
  packages_business_shared_const_er: 'Two',
  packages_business_shared_const_yi: 'One',
  packages_business_shared_const_ling: 'Zero',
  packages_business_shared_const_yiquxiao: 'Cancelled',
  packages_business_shared_const_shixiao: 'Invalid',
  packages_business_shared_const_tuikuanzhong: 'Refunding',
  packages_business_shared_const_tuikuanshibai: 'Refund Failed',
  packages_business_shared_const_yituikuan: 'Refunded',
  packages_business_shared_const_zhifushibai: 'Payment Failed',
  packages_business_payment_timeout: 'Payment Timeout',
  packages_business_shared_const_yizhifu: 'Paid',
  packages_business_shared_const_weizhifu: 'Unpaid',
  packages_business_shared_ws_client_webso:
    'Websocket message parsing failed: ',
  packages_business_shared_ws_client_webso2:
    'Websocket received message format error: ',
  packages_business_shared_ws_client_acces: 'Access_token Expired',
  packages_business_shared_ws_client_webso3: 'Websocket is closed',
  packages_business_shared_ws_client_webso4: 'Websocket Disconnected',
  packages_business_shared_ws_client_webso5: 'Websocket Connected',
  packages_business_shared_ws_client_webso6:
    'Websocket exceeds the maximum number of reconnections',
  packages_business_shared_ws_client_cizhonglian: 'Reconnection',
  packages_business_shared_ws_client_webso7: 'Websocket attempt first',
  packages_business_shared_ws_client_webso8:
    'The websocket connection failed, trying to reconnect',
  packages_business_switch_directory_view: 'Switch to the catalog view',
  packages_business_switch_data_console_view: 'Switch to the data console view',
  packages_business_task_created_success:
    'Task created successfully, click to view',
  packages_business_task_created_fail_no_primary_key:
    'The task has been created, but since your table does not have a primary key, you need to enter the task editor to manually set the update condition field. Click to view the task.',
  packages_business_fdm_create_task_dialog_desc_prefix: `${import.meta.env.VUE_APP_PAGE_TITLE}  will automatically create a cloning pipeline task, which will automatically copy the structure and data of the selected`,
  packages_business_fdm_create_task_dialog_desc_suffix:
    'to the Cache layer of the data platform and keep the source database and Cache layer data in real-time synchronization and automatic validation. In most cases, the structure changes (DDL) of the source database will also be copied to the Cache layer. You can monitor the running status of the pipeline task by clicking the ICON on the right side of the database name in the Cache layer. You can also choose to modify the physical table name prefix in the Cache layer now.',
  packages_business_mdm_create_task_dialog_desc_prefix:
    "This will create a processing model on the Data Platform's Curated layer. Common scenarios for creating a processing model include the following:",
  packages_business_fdm_create_task_dialog_desc_li1:
    'Need to do some transformation, enhancement, calculation field processing, etc. on the data of the Cache layer.',
  packages_business_fdm_create_task_dialog_desc_li2:
    'Need to merge the structures of several Cache layers into one wide table.',
  packages_business_fdm_create_task_dialog_desc_li3:
    'Need to merge the data of tables from multiple Cache layers to construct a merged table.',
  packages_business_mdm_create_task_dialog_desc_suffix:
    'Note: You can directly publish API or do data replication tasks to the target end at the Cache layer. If it is for these two reasons, you do not need to create a processing layer model.',
  packages_business_mdm_create_task_dialog_desc_table_name:
    'Please enter the table name to be newly constructed in the Curated layer. If the table name already exists, the existing data will be overwritten by default.',
  packages_business_save_and_run_now: 'Save and Run',
  packages_business_save_only: 'Only Save',
  packages_business_target_create_task_dialog_desc_prefix_clone: `${import.meta.env.VUE_APP_PAGE_TITLE}  will create a cloning pipeline task to sync`,
  packages_business_target_create_task_dialog_desc_prefix_sync: `${import.meta.env.VUE_APP_PAGE_TITLE}  will create a sync pipeline task to sync`,
  packages_business_target_create_task_dialog_desc_to: 'to',
  packages_business_target_create_task_dialog_desc_suffix:
    'Please click button below to continue. You can also change the task name',
  packages_business_fdm_empty_text:
    'Please drag the table from <strong>Sources</strong> here to start cloning the data.',
  packages_business_mdm_empty_text:
    'Please drag the table from <strong>Sources/Foundation Data Model</strong> here to start synchronizing data',
  packages_business_catalog_delete_confirm_message:
    'This operation will only delete the category. If you want to delete the physical tables under this category, please do it yourself.',
  packages_business_mdm_table_duplication_confirm:
    'The target table already exists. Please confirm if you want to continue?',
  packages_business_data_console_mode: 'Select Product Capability Mode',
  packages_business_data_console_mode_integration: 'Data Integration',
  packages_business_data_console_mode_service: 'Data Service Platform',
  packages_business_data_console_mode_integration_tooltip_1:
    'RealTime Data Sync Between Databases',
  packages_business_data_console_mode_integration_tooltip_2:
    'ETL Data Processing',
  packages_business_data_console_mode_integration_tooltip_3:
    '100+ Connectors, Including DB, MQ, File, API',
  packages_business_data_console_mode_service_tooltip_1:
    'All Features Of Data Integration',
  packages_business_data_console_mode_service_tooltip_2:
    'Data Cache Layer In Platform',
  packages_business_data_console_mode_service_tooltip_3:
    'Support Multiple Service Publish',
  packages_business_data_console_fdm_mdm_storage: 'Data Center Storage',
  packages_business_data_console_fdm_storage: 'Foundation Data Model Storage',
  packages_business_data_console_mdm_storage: 'Master Data Model Storage',
  packages_business_data_console_fdm_mdm_storage_tooltip:
    'Specify the database connection that will be used for additional data layer storage',
  packages_business_mongodb_atlas_cluster: 'MongoDB Atlas Cluster',
  packages_business_mongodb_self_hosted_cluster: 'Self Hosted MongoDB Cluster',
  packages_business_mongodb_full_management_cluster:
    'Fully Managed MongoDB Cluster',
  packages_business_data_console_setting_saved_tooltip:
    'The Settings cannot be modified after being saved.',
  // 共享緩存
  packages_business_shared_cache_create: 'Create Cache',
  packages_business_shared_cache_edit: 'Edit Cache',
  packages_business_shared_cache_placeholder_task_name:
    'Please enter the cache task name to search',
  packages_business_shared_cache_placeholder_connection_name:
    'Please enter the connection name to search',
  packages_business_shared_cache_button_create: 'New Cache',
  packages_business_shared_cache_name: 'Name',
  packages_business_shared_cache_status: 'Cache Status',
  packages_business_shared_cache_time: 'Cache Time',
  packages_business_shared_cache_keys: 'Cache Keys',
  packages_business_shared_cache_fields: 'Cache Fields',
  packages_business_shared_cache_code: 'Application Code',
  packages_business_shared_cache_placeholder_name:
    'Please enter the cache name',
  packages_business_shared_cache_placeholder_connection:
    'Please select a connection',
  packages_business_shared_cache_placeholder_table: 'Please select a table',
  packages_business_shared_cache_placeholder_keys: 'Please select a cache key',
  packages_business_shared_cache_placeholder_fields:
    'Please select a cache field',
  packages_business_shared_cache_max_memory: 'Maximum Memory',
  packages_business_shared_cache_keys_tooltip:
    'Use this field as the primary key to identify data for caching',
  packages_business_shared_cache_fields_tooltip:
    'Common fields that need to be cached',
  packages_business_shared_cache_max_memory_tooltip:
    'The maximum amount of memory the system will save, if it exceeds, the least commonly used data will be deleted according to the calling time',
  packages_business_shared_cache_code_tooltip:
    'You can enter this code in the JS node to use the cache',
  packages_business_shared_cache_column_connection: 'From Connection',
  packages_business_shared_cache_column_table: 'From Table',
  packages_business_shared_cache_cache_key_message:
    'The selected cache key is not indexed.',
  packages_business_shared_cache_cache_key_auto_create:
    'Automatic Index Creation',
  packages_business_shared_cache_cache_key_auto_create_tip:
    'Enabling this feature will automatically create indexes for cache keys in the source table, potentially impacting the source database. Please enable with caution.',
  packages_business_relation_list_gongxianghuancun: 'Shared Cache',
  packages_business_application_delete_shanchuyingyong: 'Delete Application',
  packages_business_application_delete_ninzhengzaishanchu:
    'You are deleting the application <span class="fw-bolder font-color-dark">{val1}</span>, are you sure to delete',
  packages_business_application_delete_ninzhengzaishanchu2:
    'You are deleting the application <span class="fw-bolder font-color-dark">{val1}</span>, the API under this application will be moved to',
  packages_business_application_delete_yingyongmiaoshubu:
    'Application description cannot be empty',
  packages_business_application_delete_yingyongmingchengbu:
    'The application name cannot be empty',
  packages_business_application_delete_shifouquerenshan:
    'Are you sure to delete',
  packages_business_application_editor_yingyongmiaoshu:
    'Application Description',
  packages_business_application_list_qingshuruyingyong:
    'Please enter the application name',
  packages_business_application_list_yifabuAp: 'Number of published APIs',
  packages_business_application_list_zongApIshu: 'Total number of APIs',
  packages_business_application_list_yingyongmingcheng: 'Application Name',
  packages_business_application_list_chuangjianyingyong: 'Create Application',
  packages_business_data_server_drawer_qingxuanzesuoshu:
    'Please select the application',
  packages_business_data_server_drawer_suoshuyingyong: 'Owner Application',
  packages_business_create_connection_scenedialog_gongzuoliu: 'Workflow',
  packages_business_create_connection_scenedialog_duiliegongshu: 'Queue Supply',
  packages_business_create_connection_scenedialog_guochantidai:
    'Domestic Alternative',
  packages_business_create_connection_scenedialog_shujukutongbu:
    'Database Synchronization',
  packages_business_create_connection_scenedialog_chaxunjiasu:
    'Query Acceleration',
  packages_business_create_connection_scenedialog_rushucang:
    'Into the warehouse',
  packages_business_create_connection_scenedialog_tuijianchangjing:
    'Recommended Target',
  packages_business_create_connection_scenedialog_qingxuanzeninde:
    'Please select your usage scenario',
  packages_business_create_connection_serveform_fenleimingcheng:
    'Category Name',
  packages_business_components_tableview_yizhegemoxing:
    'Tasks with this model source/target',
  packages_business_components_tableview_xinzenglebiaoqian: 'New label 603',
  packages_business_components_tableview_zengliangshujuyan:
    'Incremental data delay:',
  packages_business_components_tableview_shujuzuihougeng:
    'Data last update time:',
  packages_business_swimlane_fdm_biaobianji: 'Table Edit',
  packages_business_swimlane_tablepreview_zuihoufangwenshi: 'Last visit time',
  packages_business_swimlane_tablepreview_apIchuanshu:
    'The total amount of API transfer',
  packages_business_swimlane_tablepreview_apIfangwen:
    'The number of API access rows',
  packages_business_swimlane_tablepreview_fangwencishu: 'Number of visits',
  packages_business_swimlane_tablepreview_apifuwu: 'Api service name',
  packages_business_swimlane_target_yejibao: 'Yejibao',
  packages_business_task_list_meiyoufaxiannin:
    "I didn't find that you have recently reported task errors, if you have other questions, please consult our manual customer service",
  packages_business_api_application_list_xitongmorenchuang:
    'Applications created by the system by default, cannot be edited or deleted.',
  packages_business_create_connection_title_select_type:
    'Choose Data Source Type',
  // 外存管理
  packages_business_external_storage_list_querenshanchuwai:
    'Are you sure to delete the external storage?',
  packages_business_external_storage_list_qingshurucunchu:
    'Please enter the storage path',
  packages_business_external_storage_list_qingshuruwaicun:
    'Please enter the external storage name',
  packages_business_external_storage_list_qingshuruwaicun2:
    'Please enter the external storage table name',
  packages_business_external_storage_list_sheweimoren: 'Set as default',
  packages_business_external_storage_list_cunchulujing: 'Storage path',
  packages_business_external_storage_list_chuangjianwaicun:
    'Create External Storage',
  packages_business_external_storage_list_bianjiwaicun: 'Edit External Storage',
  packages_business_external_storage_list_tishi:
    'This external storage has been called by {val1} tasks, please delete or modify the configuration and try again.',
  // API
  packages_business_api_publish: 'API Publish',
  packages_business_api_application: 'API Application',
  packages_business_api_application_md: `## API Application
- You can easily create new applications to categorize APIs and achieve differentiated management, thereby improving business security and efficiency.
- You can drag and drop database tables onto the application to quickly publish APIs.
      `,
  packages_business_qingshurucanshu: 'Please enter parameter name',
  packages_business_paixu: 'Sort',
  packages_business_meigefenyefan: 'Number of records returned per page',
  packages_business_fenyebianhao: 'Pagination number',
  packages_business_zidingyichaxun: 'Custom query',
  packages_business_morenchaxun: 'Default query',
  packages_business_qingxuanzeduixiang: 'Please select the object name',
  packages_business_qingxuanzelianjie: 'Please Select connection type',
  packages_business_qingshurufuwu: 'Please enter service name',
  packages_business_quanxianfanwei: 'Authority Range',
  packages_business_selectPermissions: 'Please select the scope of authority',
  packages_business_shilidaima: 'Sample Code',
  packages_business_shilidaima2: 'Sample Code',
  packages_business_fanhuijieguo: 'Return Result',
  packages_business_diaoyongfangshi: 'Call method',
  packages_business_fuwufangwen: 'Service Access',
  packages_business_shuchujieguo: 'Output Result',
  packages_business_pailietiaojian: 'Order condition',
  packages_business_shaixuantiaojian: 'Filter condition ',
  packages_business_canshuzhi: 'parameter value',
  packages_business_canshumingcheng: 'Parameter Name',
  packages_business_shurucanshu: 'Input Parameter',
  packages_business_jiekouleixing: 'Interface Type',
  packages_business_fabujiedian: 'Publishing Node',
  packages_business_caozuoleixing: 'Operation Type',
  packages_business_zanwumiaoshu: 'no description yet',
  packages_business_tiaoshi: 'Debug',
  packages_business_peizhi: 'Configuration',
  packages_business_chuangjianfuwu: 'Create API',
  packages_business_fuwuxiangqing: 'Service Details',
  packages_business_geshicuowu: 'Format error',
  packages_business_validate:
    'Only alphanumeric letters and underscores are allowed and must start with a letter.',
  packages_business_aPI_path_Settings: 'API Path Settings',
  packages_business_default_path: 'Default Path',
  packages_business_custom_path: 'Custom Path',
  packages_business_prefix: 'Prefix',
  packages_business_base_path: 'Base Path',
  packages_business_path: 'Path',
  packages_business_confirm_tip:
    'This will re-generate the API path, do you wish to continue?',
  packages_business_create_connection_scenedialog_table:
    'Tablestore is a distributed NoSQL data storage service with high reliability, high performance, flexibility and scalability, suitable for application scenarios such as real-time data query and analysis. ',
  packages_business_create_connection_scenedialog_select:
    'SelectDB Cloud is a fully managed real-time data warehouse service based on the Apache Doris kernel. It has the advantages of high reliability, high performance, ease of use and low cost, and is suitable for query and analysis requirements for processing massive data. ',
  packages_business_create_connection_scenedialog_redis:
    'Redis is a high-performance memory database that supports multiple data structures and persistence methods. It is scalable and reliable, and is suitable for application scenarios such as caching, session management, leaderboards, and message queues. ',
  packages_business_create_connection_scenedialog_mongo:
    'MongoDB is a flexible and high-performance non-relational database, ideal for processing large amounts of unstructured data with fast querying and scalability in application scenarios.',
  packages_business_create_connection_scenedialog_bigQu:
    'BigQuery is a Google Cloud-managed data warehouse known for its speed, scalability, and security. It handles PB-scale data, integrates with multiple tools, and suits various data analysis and mining needs.',
  packages_business_create_connection_mysql_desc:
    'MySQL is a lightweight database management system used for small and medium-sized websites and applications. It supports data storage, querying, and simple analysis, making it popular for web development and light workloads.',
  packages_business_create_connection_oracle_desc:
    'Oracle is a powerful enterprise-level database solution known for its support of large-scale data processing, high-performance transactions, and complex queries. It is widely used in core business systems and data management in enterprises.',
  packages_business_create_connection_sqlserver_desc:
    'SQL Server is primarily used for managing and processing large databases. It is suitable for enterprise-level applications and websites, offering features for data storage, querying, analysis, and reporting.',
  packages_business_create_connection_postgresql_desc:
    'PostgreSQL is a highly stable database system suitable for complex data storage and queries. It is widely employed in web applications, geographic information systems, data analysis, and enterprise-level applications.',
  packages_business_create_connection_clickhouse_desc:
    'ClickHouse is designed for fast querying and analysis of large-scale data. It excels in real-time and log analysis, data warehousing, and handling time-series data.',
  packages_business_create_connection_elasticsearch_desc:
    'Elasticsearch is used for full-text search, log analysis, real-time data analysis, and large-scale data indexing. It finds significant applications in search engines, monitoring, and enterprise-level systems.',
  packages_business_create_connection_dummy_desc:
    'Dummy is commonly used to represent virtual or placeholder entities with no actual data. In software development and testing, Dummy objects serve to fill gaps or simulate placeholder behavior.',
  packages_business_create_connection_kafka_desc:
    'Kafka is ideal for high-throughput real-time data streaming, handling log collection, data transmission, message publishing/subscribing, and stream processing, particularly for large-scale data streams.',
  packages_business_create_connection_doris_desc:
    'Doris is well-suited for real-time data analysis and reporting, with support for high-concurrency queries and complex analysis. It is widely used in data warehouses, BI reports, and data visualization.',
  packages_business_create_connection_mongodbatlas_desc:
    'MongoDB Atlas is a fully managed service for MongoDB databases, automating deployment, scaling, and monitoring. It enables developers to prioritize application development while providing features like elastic scaling, global deployment, and security for various applications.',
  packages_business_swimlane_tablepreview_chuangjianrenwu: 'Create Task',
  packages_business_as_source: 'As Source',
  packages_business_as_target: 'As Target',
  page_title_verification_create: 'New validation',
  page_title_task_edit: 'Edit task',
  page_title_task_details: 'Task details',
  page_title_verification_history: 'Verification History',
  page_title_data_difference_details: 'Difference Details',
  page_title_data_verification_result: 'Verification Result',
  page_title_diff_verification_history: 'Diff validation history',
  page_title_diff_verification_details: 'Diff validation details',
  packages_business_connections_databaseform_dangqianlianjiezheng:
    'The current connection is using the original external storage, switching will result in data loss, please operate with caution. ',
  packages_business_swimlane_target_shouye: 'Homepage',
  packages_business_connections_databaseform_chakanwajueren:
    'View mining tasks',
  packages_business_connections_databaseform_dangqianlianjiede:
    'The currently connected mining task is using this external storage, and modification is not allowed for now. If you need to modify it, please reset or delete the corresponding mining task first.',
  packages_business_shared_mining_table_yitingzhiwajue: 'Mining has stopped',
  packages_business_shared_mining_table_zhengzaiwajue: 'Digging',
  packages_business_shared_mining_table_ninyaotingzhiwa:
    'The table you want to stop mining is being used by the following tasks. Stopping mining will affect the normal synchronization of the following tasks. Please confirm whether to continue to stop. ',
  packages_business_shared_mining_table_tingzhiwajueti: 'Stop mining reminder',
  packages_business_shared_mining_table_yihebingdelian: 'Merged Connections',
  packages_business_shared_mining_table_shengyuyigelian:
    'In the mining task, at least one table must be mining, and all tables cannot be stopped.',
  packages_business_logs_nodelog_yijianfuzhi: 'Copy',
  packages_business_connections_jsdebug_shiyongHtt:
    'Use the latest data received by HttpReceiver for debugging',
  packages_business_connections_jsdebug_huoqutiaoshishu: 'Get debug data',
  packages_business_shared_mining_list_shanchurenwus:
    'After deleting the task <span class="color-primary">{val1}</span>, this task will not be restored',
  packages_business_shared_mining_list_gaiwajuerenwu:
    'The mining task has been called by {val} tasks, please delete the task and try again',
  packages_business_shared_cache_list_qingxianxiugaiwai:
    'The external storage does not exist, please modify the external storage configuration before starting.',
  packages_business_components_conditionbox_shifouquerenqing:
    'Are you sure to clear the check condition that the index field is empty? ',
  packages_business_components_conditionbox_suoyinziduanwei:
    'The index field is empty',
  packages_business_components_conditionbox_yijianqingchusuo:
    'One key to clear the condition that the index field is empty',
  packages_business_external_storage_list_yanzhengfuwuduan:
    'Verify server certificate',
  packages_business_external_storage_list_siyaomima: 'Private key password',
  packages_business_external_storage_list_kehuduansiyao: 'Client private key',
  packages_business_external_storage_list_zhengshubanfaji:
    'Certificate Authority',
  packages_business_external_storage_list_shiyongTls: 'Connect using TLS/SSL',
  packages_business_connections_list_dangqianlianjiex:
    'The current connection xxx is being used as FDM and MDM storage, deletion will result in the loss of existing storage data, whether to confirm to continue deletion. ',
  packages_business_connections_list_zhengzaizuoweiF:
    'It is being used as FDM and MDM storage, the modification will cause the loss of existing stored data, are you sure you want to continue the modification',
  packages_business_connections_list_dangqianlianjie: 'Current Connections',
  packages_business_components_conditionbox_chakanzidingyi:
    'View custom fields',
  packages_business_components_fielddialog_ziduanbuyunxu:
    'The field is not allowed to be empty',
  packages_business_components_fielddialog_zidingyiziduan: 'Custom Field',
  packages_business_verification_list_biaobufenziduan:
    'Verification of some fields in the table',
  packages_business_components_conditionbox_laiyuanbiaoshuju: 'Source Filter',
  packages_business_components_conditionbox_mubiaobiaoshuju: 'Target Filter',
  packages_business_components_conditionbox_enableCustomCommand_tip:
    'Ensure that the query conditions have indexes; without indexes, it may result in a full table scan, causing increased database pressure.',
  packages_business_data_server_list_apIwendang: 'API Document Export',
  packages_business_verification_form_gaojipeizhi: 'Advanced Configuration',
  packages_business_verification_form_validate_table_is_empty:
    'The source table and target table cannot be empty, please modify the validation table configuration',
  packages_business_verification_form_validate_table_is_empty1:
    'Because the source or target table could not be found, the following source connections will automatically skip validation:',
  packages_business_verification_form_condition_is_empty:
    'The associated validation condition cannot be empty, please modify the validation table configuration',
  packages_business_verification_form_index_field_is_empty:
    'Because the index field cannot be found, the following source tables will automatically skip validation:',
  packages_business_verification_form_index_field_count_is_not_equal:
    'Because the number of index fields in the source table and the target table is not equal, the following source tables will automatically skip validation:',
  packages_business_verification_list_renyibiaoshuju:
    'Any Table Data Validation',
  packages_business_verification_list_renwuyizhixing:
    'Task Consistency Validation',
  packages_business_connections_preview_quanxianguanli: 'Permission Management',
  packages_business_permissionse_settings_create_quanxianshezhi:
    'Permission Settings',
  packages_business_permissionse_settings_create_shezhiquanxian:
    'Set Permissions',
  packages_business_permissionse_settings_create_xuanzeshouquanjiao:
    'Select authorization role',
  packages_business_permissionse_settings_create_wufaduiyixiashujujinxingshouquan:
    'Unable to authorize the following data, saving will be skipped',
  packages_business_connections_permissionsdialog_tianjiashouquan:
    'Add Permissions',
  packages_business_connections_permissionsdialog_gongnengquanxian:
    'Function Permissions',
  packages_business_connections_permissionsdialog_shouquanjuese:
    'Authorization Role',
  packages_business_connections_permissionsdialog_lianjiequanxianshe:
    'Connection permission settings',
  packages_business_connections_preview_quanxiangguanli: 'Privilege Management',
  packages_business_connections_preview_shujulianjiequan:
    'Data connection permissions',
  packages_business_notice_list_gonggaobiaoti: 'Notice Title',
  packages_business_connections_list_wuquanxiandecao:
    'Operations without permission are disabled',
  packages_business_components_upgradecharges_dingyuexinyinqing:
    'Subscribe to new engines',
  packages_business_components_upgradecharges_shengjiguige:
    'Upgrade Specifications',
  packages_business_components_upgradecharges_dingyuefangshi:
    'Subscription Method',
  packages_business_components_upgradecharges_keyongrenwushu:
    'Remaining available tasks',
  packages_business_components_upgradecharges_dangqianguige:
    'Current Specifications',
  packages_business_components_upgradecharges_dingyueshengji:
    'Subscription Upgrade',
  packages_business_create_connection_sceneform_lianjieceshiwu:
    'The connection test is invalid, please check your connection configuration',
  packages_business_create_connection_sceneform_qingxianjinxinglian:
    'Please perform a connection test first',
  packages_business_logs_nodelog_qingshengjidingyue:
    'Please upgrade your subscription to get more tasks, click the pop-up window to display the upgrade guide',
  packages_business_logs_nodelog_yinqingkeyibei:
    'The number of tasks that the engine can be invoked exceeds the limit,',
  packages_business_task_list_nindekeyunxing:
    'The number of tasks you can run has reached the upper limit, please subscribe to upgrade specifications so that you can run more tasks!',
  packages_business_setting_alarmsetting_qubangding: 'to bind',
  packages_business_setting_alarmsetting_jiancedaoninhai:
    'It has been detected that you have not bound your email address, so email notification cannot be enabled.',
  packages_business_verification_form_zhengzaijiyuren:
    'Generating validation conditions based on tasks in progress',
  packages_business_agent_ip_tips_prefix:
    'Please allow these TapData IPs in your firewall for database port access and ensure correct permissions',
  packages_business_agent_ip_tips_suffix:
    'Click to view the IP address information for the fully managed agent.',
  packages_business_demo_database_desc:
    'Demo data source, allows for quick creation of data source information, with no need to prepare database details for an immediate experience.',
  packages_business_use_ssl: 'Use SSL',
  packages_business_certificate_authority: 'CA File',
  packages_business_client_certificate: 'Client Certificate File',
  packages_business_client_key: 'Client Key File',
  packages_business_client_key_password: 'Client Key Password',
  packages_business_use_ssh: 'Use SSH Tunnel',
  packages_business_ssh_host: 'Host',
  packages_business_ssh_port: 'Port',
  packages_business_ssh_username: 'Username',
  packages_business_ssh_password: 'Password',
  packages_business_connections_test_xiazaijindu: 'Download Progress',
  packages_business_connections_test_xiazaishibai: 'Download Failed',
  packages_business_relmig_import: 'MongoDB Relmig Import',
  packages_business_relmig_import_desc: `This feature is designed to seamlessly import MongoDB Relational Migrator-exportd relmig project files into ${import.meta.env.VUE_APP_PAGE_TITLE}. After the relmig file is imported, ${import.meta.env.VUE_APP_PAGE_TITLE} will automatically create a task to  perform real time data synchronization from source database and transform into JSON data format in MongoDB database.`,
  packages_business_relmig_upload: 'Upload relmig file',
  packages_business__relmig_import_connection_tip:
    "Click here to create one if you haven't done so already.",
  packages_business__relmig_import_source_connection_placeholder:
    'Please select the source connection that includes the source tables you used in your relmig project',
  packages_business__relmig_import_target_connection_placeholder:
    'Please select the destination connection you want the data to be synchronized to',
  packages_business_task_tag_placeholder:
    'Assign a tag to this task so you can easily find it',
  packages_business_paid_connector: 'Premium Connectors',
  packages_business_more_free_connector: 'More Free Connectors',
  packages_business_request_connector_title: 'Trial Alpha/Beta Data Source',
  packages_business_request_connector_pending: 'Pending Approval',
  packages_business_request_connector_pending_desc:
    'You have submitted your application. Please wait for approval.',
  packages_business_request_connector_alert:
    "👋 Welcome to try the {qcType} version of {type} data source. Simply fill out the form to get started with the trial.\n💁 For the best experience, please provide accurate contact information. We'll reach out to you proactively to offer support and assistance.",
  packages_business_request_connector_use_plan:
    'How do you plan to use this data source?',
  packages_business_request_connector_use_plan_placeholder:
    'Please fill in your use case',
  packages_business_request_connector_use_time: 'Estimated Time of Use',
  packages_business_request_connector_use_time_option1: '5 days',
  packages_business_request_connector_use_time_option2: 'half a year',
  packages_business_request_connector_use_time_option3: '1 year',
  packages_business_request_connector_success:
    'We have received your request and someone will contact you shortly.',
  packages_business_view_more_apis: 'View More APIs',
  packages_business_verification_hashTip:
    'Currently does not support heterogeneous databases.',
  packages_business_heterogeneous_database: 'heterogeneous databases',
  packages_business_selected_rows: '{val} row(s) selected',
  packages_business_download_analysis_report: 'Analysis Report',
  packages_business_download_analysis_report_title:
    'Task analysis report is being generated...',
  packages_business_download_analysis_report_desc:
    'The report generation takes about 60 seconds. After downloading, please send it to the support team for analysis.',
  packages_business_exporting_task: 'Exporting tasks',
  packages_business_exporting_run_history: 'Exporting task run history',
  packages_business_exporting_task_log: 'Exporting task logs',
  packages_business_exporting_metrics: 'Exporting monitoring metrics',
  packages_business_gen_engine_cpu_chart:
    'Generating engine CPU analysis chart',
  packages_business_gen_tm_cpu_chart:
    'Generating management end CPU analysis chart',
  packages_business_gen_engine_mem_chart:
    'Generating engine memory allocation analysis chart',
  packages_business_gen_tm_mem_chart:
    'Generating management end memory allocation analysis chart',
  packages_business_exporting_engine_thread: 'Exporting engine thread data',
  packages_business_exporting_tm_thread: 'Exporting management end thread data',
  packages_business_downloading_file: 'Downloading file',
  packages_business_long_wait: 'Please wait a moment',
  packages_business_correction: 'Correction',
  packages_business_data_correction: 'Data Correction',
  packages_business_confirmExecuteDataRepair:
    'Confirm to Execute Data Correction?',
  packages_business_checkTaskInfo: 'Task Information',
  packages_business_taskName: 'Task Name',
  packages_business_taskStatus: 'Task Status',
  packages_business_taskIncrementDelay: 'Task Increment Delay',
  packages_business_checkDetails: 'Validation Details',
  packages_business_diffThreshold: 'Difference Threshold',
  packages_business_diffTotal: 'Total Differences',
  packages_business_diffExceededAlert:
    'Total differences exceed the threshold, the excess will not be corrected',
  packages_business_correctionDetails: 'Correction Details',
  packages_business_correctionDataVolume: 'Correction Data Row Count',
  packages_business_correctionTableCount: 'Correction Table Count',
  packages_business_correctionTaskStarted: 'Correction Task has Started',
  packages_business_sourceOnly: 'Target with Less data',
  packages_business_targetOnly: 'Target with More Data',
  packages_business_no_data_correction: 'No data available for correction',
  packages_business_recovering: 'Under Correction',
  packages_business_business_information: 'Business Information',
  packages_business_publish_api: 'Publish API',
  packages_business_field_description: 'Field Description',
  packages_business_shared_cache_enforceShareCdc:
    'When shared mining is not available (Cache Start)',
  packages_business_shared_cache_enforceShareCdc_true:
    'The cache reports an error and stops',
  packages_business_not_support_validation:
    '{connection} does not support {method}',
  packages_business_download_details: 'Download',
  packages_business_solution: 'Solution',
  packages_business_error_details: 'Error Details',
  packages_business_instance_info: 'Unique Identifier',
  packages_business_warning_details: 'Warning Details',
  packages_business_custom_collate: 'Custom Collate',
  packages_business_please_select_field: 'Please select a field',
  packages_business_please_input_charset: 'Please input charset',
  packages_business_auto_fill_join_fields: 'Smart Fill Associated Fields',
  packages_business_auto_fill_join_tooltip_title:
    'After enabling, the system will automatically fill in the join conditions according to the following priority:',
  packages_business_auto_fill_join_tooltip_primary:
    '1. Use primary key fields first',
  packages_business_auto_fill_join_tooltip_notnull:
    '2. If there is no primary key, use non-null fields',
  packages_business_auto_fill_join_tooltip_all:
    '3. If there are no non-null fields, use all fields',
  packages_business_nulls_first: 'NULL Priority Sort',
  packages_business_nulls_first_tip:
    'When the associated fields contain NULL values, the database defaults to sorting NULL values last, which may cause validation failure. Enabling this option will set NULL values first, but may not use the database index, increasing database load.',
  packages_business_ignoreTimePrecision: 'Ignore time precision',
  packages_business_ignoreTimePrecision_tip:
    'When enabled, time will be compared up to seconds only, ignoring milliseconds. Useful for syncing high-precision and low-precision time fields.',
  packages_business_checkTableThreadNum: 'Thread Validation',
  packages_business_checkTableThreadNum_tip:
    'Number of threads to use. Default is 10. Can be increased if system resources permit.',
  packages_business_verification_empty_add_table:
    'No validation table configuration, please add tables',
  packages_business_verification_empty_auto_add_table:
    'No validation table configuration, please automatically add tables',
  packages_business_verification_empty_chooseJob:
    'No validation table configuration, please select a task',
}

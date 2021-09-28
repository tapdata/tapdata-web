export default {
  // 通用按钮
  button_edit: '編輯',

  // 通用消息
  message_title_prompt: '提示',

  // 数据校验
  verify_details_title: '任務校驗詳情',
  verify_history_title: '任務校驗歷史',
  verify_diff_history_title: '差異校驗歷史',
  verify_diff_details_title: '差異校驗詳情',
  verify_result_title: '校驗結果',
  verify_button_diff_verify: '差異校驗',
  verify_button_diff_verify_running: '校驗中',
  verify_button_diff_verify_tips: '對本次全量校驗的差異數據結果進行再次校驗，行數差異暫不支持差異校驗',
  verify_last_start_time: '最後校驗時間',
  verify_button_diff_task_history: '校驗歷史',
  verify_message_old_data_not_support: '舊數據暫不支持二次校驗',
  verify_message_out_of_limit: '您的差異數據量已超出任務支持的最大錯誤數據保存條數，暫時無法進行二次校驗',
  verify_result_count_more: '目標count多: {0}',
  verify_result_count_less: '目標count少: {0}',
  verify_result_content_diff: '表數據差: {0}',
  verify_result_count_inconsistent: '不一致',
  verify_result_count_consistent: '一致',
  verify_result_field_name: '字段名',
  verify_result_source_info: '源信息',
  verify_result_target_info: '目標信息',
  verify_create_window_duration: '窗口時長',

  taskprogress_plan_sync_table_num: '計劃同步表數量',
  taskprogress_completed_sync_table_num: '已完成同步表數量',
  taskprogress_plan_sync_data: '計劃同步數據量（行）',
  taskprogress_completed_sync_data: '已完成同步數據量（行）',
  taskprogress_current_sync: '各庫當前同步情況',
  taskprogress_full_sync_progress: '全量同步進度',

  // 任务设置
  task_settings_cdc_sync_point_date: '【任務設置】增量採集開始時刻，請選擇時間',

  // 数据源
  connection_form_tidb_server: 'PDServer 地址',
  connection_tidb_none_server: 'PDServer 地址不能為空',

  connection_list_column_schema_status: 'Schema加載狀態',
  connection_list_column_schema_status_tips: 'Schema加載完成的連接才可以正常創建任務',

  connection_form_custom_connection_before_operate: '前置操作',
  connection_form_custom_connection_after_operate: '後置操作',

  // Dag
  dag_data_node_label_dameng: 'Dameng節點',
  dag_data_node_label_database_link_table: '表名大小寫',
  dag_data_node_label_database_link_field: '字段名大小寫',
  dag_data_node_label_database_link_unchang: '不變',
  dag_data_node_label_database_link_to_uppercase: '轉為大寫',
  dag_data_node_label_database_link_to_lowercase: '轉為小寫',
  dag_data_node_label_memcache_type: '緩存類型',
  dag_data_node_label_memcache_type_all: '全局緩存',
  dag_data_node_label_memcache_type_local: '局部緩存',
  dag_data_node_label_memcache_type_tip: '全局緩存所有任務可引用，局部緩存僅限當前DAG引用。 ',
  dag_data_node_label_clickhouse: 'ClickHouse節點',
  dag_data_node_label_kafka_high_performance_mode: '高性能模式',
  dag_data_node_label_kafka_all: '所有',
  dag_data_node_label_aggregate_filter: '過濾器',

  // 緩存節點提示
  task_job_setting_tip_title: '設置提醒',
  task_job_setting_disable: '不去重',
  task_job_tip_text: '該緩存節點(xxx)的設置已存在於任務(###)中，請確認是否還繼續創建？ ',
  data_flow_automatically: '自動挖掘',
  data_flow_manually: '手動挖掘',
  data_flow_oracle_logminer: 'Oracle日誌挖掘模式',
  task_job_link_type_table_tips: 'Table暫不支持外鍵複製',
  task_job_link_type_view_tips:
    '複製view時暫不支持設置欄位映射，勾選此項下方欄位映射功能會被禁用，已設置的欄位映射將會被重置',
  task_job_link_confirm_message_rollback:
    '複製view時暫不支持設置欄位映射，勾選此項下方欄位映射功能會被禁用，已設置的欄位映射將會被重置，是否確認勾選？',

  // 函数管理
  function_tips_empty: '代碼缺少JS函數',
  function_checkbox_Line_number: '顯示行號',
  function_button_create: '創建',
  function_button_edit: '編輯',
  function_tips_name_repeat: '方法名稱重複',
  function_button_code_format: '格式化代碼',
  function_last_update_label: '更新時間',
  function_parameters_label: '參數',
  function_type_label: '函數類型',
  function_type_option_custom: '自定義函數',
  function_type_option_jar: '第三方jar包',
  function_name_label: '函數名稱',
  function_name_placeholder: '請輸入函數名稱',
  function_name_repeat: '函數名稱重復',
  function_class_label: '類名',
  function_class_placeholder: '請輸入類名，UDF函數的類名，格式為資源名.類名',
  function_file_label: 'jar文件',
  function_button_file_upload: '點擊上傳',
  function_file_upload_tips: '請上傳jar包文件',
  function_file_upload_success: '上傳成功',
  function_file_upload_fail: '上傳失敗',
  function_body_label: '函數體',
  function_body_placeholder: '請輸入命令格式，為該UDF的具體使用方法示例',
  function_parameters_describe_label: '參數說明',
  function_parameters_describe_placeholder: '支持輸入的參數類型以及返回參數類型的具體說明',
  function_return_value_label: '返回值',
  function_return_value_placeholder: '請輸入返回值',
  function_describe_label: '描述',
  function_describe_placeholder: '請輸入描述',
  data_flow_automatically: '自動挖掘',
  data_flow_manually: '手動挖掘',
  data_flow_oracle_logminer: 'Oracle日誌挖掘模式',

  // 用户
  login_fail_too_many: '密碼錯誤達到最大次數，請於10分鐘再登錄'
}

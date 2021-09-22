export default {
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

  taskprogress_plan_sync_table_num: '計劃同步表數量',
  taskprogress_completed_sync_table_num: '已完成同步表數量',
  taskprogress_plan_sync_data: '計劃同步數據量（行）',
  taskprogress_completed_sync_data: '已完成同步數據量（行）',
  taskprogress_current_sync: '各庫當前同步情況',
  taskprogress_full_sync_progress: '全量同步進度',

  // 任务设置
  task_settings_cdc_sync_point_date: '【任務設置】增量採集開始時刻，請選擇時間',

  // 数据源
  connection_form_tidb_server: 'TiDB地址',
  connection_tidb_none_server: 'TiBD地址不能為空',

  connection_list_column_schema_status: 'Schema加載狀態',
  connection_list_column_schema_status_tips: 'Schema加載完成的連接才可以正常創建任務',

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
  dag_data_node_label_kafka_high_performance: '高性能模式'
}

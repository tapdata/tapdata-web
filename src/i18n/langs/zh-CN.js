export default {
  // 数据校验
  verify_details_title: '任务校验详情',
  verify_history_title: '任务校验历史',
  verify_diff_history_title: '差异校验历史',
  verify_diff_details_title: '差异校验详情',
  verify_result_title: '校验结果',
  verify_button_diff_verify: '差异校验',
  verify_button_diff_verify_running: '校验中',
  verify_button_diff_verify_tips: '对本次全量校验的差异数据结果进行再次校验，行数差异暂不支持差异校验',
  verify_last_start_time: '最后校验时间',
  verify_button_diff_task_history: '校验历史',
  verify_message_old_data_not_support: '旧数据暂不支持二次校验',
  verify_message_out_of_limit: '您的差异数据量已超出任务支持的最大错误数据保存条数，暂时无法进行二次校验',
  verify_result_count_more: '目标count多: {0}',
  verify_result_count_less: '目标count少: {0}',
  verify_result_content_diff: '表数据差: {0}',
  verify_result_count_inconsistent: '不一致',
  verify_result_count_consistent: '一致',

  taskprogress_plan_sync_table_num: '计划同步表数量',
  taskprogress_completed_sync_table_num: '已完成同步表数量',
  taskprogress_plan_sync_data: '计划同步数据量（行）',
  taskprogress_completed_sync_data: '已完成同步数据量（行）',
  taskprogress_current_sync: '各库当前同步情况',
  taskprogress_full_sync_progress: '全量同步进度',

  // 任务设置
  task_settings_cdc_sync_point_date: '【任务设置】增量采集开始时刻，请选择时间',

  // 数据源
  connection_form_tidb_server: 'PDServer 地址',
  connection_tidb_none_server: 'PDServer 地址不能为空',

  connection_list_column_schema_status: 'Schema加载状态',
  connection_list_column_schema_status_tips: 'Schema加载完成的连接才可以正常创建任务',

  connection_form_custom_connection_before_operate: '前置操作',
  connection_form_custom_connection_after_operate: '后置操作',

  // 路由名
  app_menu_jsFuncs: '函数',

  // 函数
  js_func_name: '函数名',
  js_func_parameters: '参数',
  js_func_function_body: '函数体',
  js_func_last_update: '更新时间',
  js_func_create: '创建',
  js_func_function_name_repeat: '方法名称重复',
  js_func_dialog_format: '格式化代码',
  js_func_dialog_code: 'Javascript函数代码',
  js_func_dialog_Linenumbers: '显示行号',
  js_func_dialog_nofunctions: '代码缺少JS函数',
  js_func_dialog_create_title: '新增记录',
  js_func_dialog_edit_title: '更新记录',
  js_func_delete_remind: '确定要删除函数',

  // Dag
  dag_data_node_label_dameng: 'Dameng节点',
  dag_data_node_label_database_link_table: '表名大小写',
  dag_data_node_label_database_link_field: '字段名大小写',
  dag_data_node_label_database_link_unchang: '不变',
  dag_data_node_label_database_link_to_uppercase: '转为大写',
  dag_data_node_label_database_link_to_lowercase: '转为小写',
  dag_data_node_label_memcache_type: '缓存类型',
  dag_data_node_label_memcache_type_all: '全局缓存',
  dag_data_node_label_memcache_type_local: '局部缓存',
  dag_data_node_label_memcache_type_tip: '全局缓存所有任务可引用，局部缓存仅限当前DAG引用。',
  dag_data_node_label_kafka_high_performance_mode: '高性能模式',
  dag_data_node_label_kafka_all: '所有',

  //任务编辑
  dag_data_node_label_clickhouse: 'ClickHouse节点',
  dag_data_node_label_aggregate_filter: '过滤器',
  // 缓存节点提示
  task_job_setting_tip_title: '设置提醒',
  task_job_tip_text: '该缓存节点(xxx)的设置已存在于任务(###)中，请确认是否还继续创建？'
}

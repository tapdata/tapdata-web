export default {
  // 通用按钮
  button_edit: '编辑',

  // 通用消息
  message_title_prompt: '提示',

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
  verify_result_field_name: '字段名',
  verify_result_source_info: '源信息',
  verify_result_target_info: '目标信息',
  verify_create_window_duration: '窗口时长',

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
  task_job_setting_disable: '不去重',
  task_job_tip_text: '该缓存节点(xxx)的设置已存在于任务(###)中，请确认是否还继续创建？',
  data_flow_automatically: '自动挖掘',
  data_flow_manually: '手动挖掘',
  data_flow_oracle_logminer: 'Oracle日志挖掘模式',
  task_job_link_type_table_tips: 'Table暂不支持外键复制',
  task_job_link_type_view_tips:
    '复制view时暂不支持设置字段映射，勾选此项下方字段映射功能会被禁用，已设置的字段映射将会被重置',
  task_job_link_confirm_message_rollback:
    '复制view时暂不支持设置字段映射，勾选此项下方字段映射功能会被禁用，已设置的字段映射将会被重置，是否确认勾选？',

  // 函数管理
  function_tips_empty: '代码缺少JS函数',
  function_checkbox_Line_number: '显示行号',
  function_button_create: '创建',
  function_button_edit: '编辑',
  function_tips_name_repeat: '方法名称重复',
  function_button_code_format: '格式化代码',
  function_last_update_label: '更新时间',
  function_parameters_label: '参数',
  function_type_label: '函数类型',
  function_type_option_custom: '自定义函数',
  function_type_option_jar: '第三方jar包',
  function_name_label: '函数名称',
  function_name_placeholder: '请输入函数名称',
  function_name_repeat: '函数名称重复',
  function_class_label: '类名',
  function_class_placeholder: '请输入类名，UDF函数的类名，格式为资源名.类名',
  function_file_label: 'jar文件',
  function_button_file_upload: '点击上传',
  function_file_upload_tips: '请上传jar包文件',
  function_file_upload_success: '上传成功',
  function_file_upload_fail: '上传失败',
  function_body_label: '函数体',
  function_body_placeholder: '请输入命令格式，为该UDF的具体使用方法示例',
  function_parameters_describe_label: '参数说明',
  function_parameters_describe_placeholder: '支持输入的参数类型以及返回参数类型的具体说明',
  function_return_value_label: '返回值',
  function_return_value_placeholder: '请输入返回值',
  function_describe_label: '描述',
  function_describe_placeholder: '请输入描述',

  // 用户
  login_fail_too_many: '密码错误达到最大次数，请于10分钟后再登录'
}

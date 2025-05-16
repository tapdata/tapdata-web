export default {
  packages_dag_dialog_tableValidateTip:
    'The new table name is restricted to English alphabets, underscores, dots, and hyphens, and must begin with an English letter, and does not allow system to start',
  packages_dag_dialog_collectionValidateTip:
    'The name of the new dataset  is restricted to English alphabets, underscores, dots, and hyphens, and must begin with an English letter, and does not allow system to start',
  packages_dag_task_stetting_basic_setting: 'Settings',
  packages_dag_task_stetting_most_setting: 'Advanced Settings',
  packages_dag_loading: 'Loading',
  packages_dag_dag_connection: 'Connection',
  packages_dag_dag_table: 'Table',
  packages_dag_dag_create_table_as_node: 'Create a new table to use as a node',
  packages_dag_dialog_createTable: 'Create a new table',
  packages_dag_dialog_placeholderTable:
    'This feature only permits the use of English letters, numbers, underscores, dots, and hyphens in naming, with the added condition that the name must start with an English letter and does not allow system to start.',
  packages_dag_dataFlow_flowEngineVersion: 'Engine Version',
  packages_dag_dataFlow_flowEngineV1: 'Flow Engine V1',
  packages_dag_dataFlow_jetFlowEngineV2: 'Jet Flow Engine V2',
  packages_dag_dataFlow_setting_intellect: 'Smart deduplication and rewriting',
  packages_dag_dataFlow_setting_compel: 'Force to rewrite',
  packages_dag_dataFlow_SyncInfo_connTZType: 'DB Timezone CDC Time',
  packages_dag_dag_property_setting: 'Property Setting',
  packages_dag_dag_meta_data: 'Meta Data',
  packages_dag_meta_table_index: 'Index',
  packages_dag_meta_table_field_name: 'Name',
  packages_dag_meta_table_field_type: 'Type',
  packages_dag_meta_table_scale: 'Scale',
  packages_dag_meta_table_precision: 'Precision',
  packages_dag_meta_table_default: 'Default',
  packages_dag_meta_table_not_null: 'Not null',
  packages_dag_meta_table_true: 'True',
  packages_dag_meta_table_false: 'False',
  packages_dag_meta_table_comment: 'Comment',
  packages_dag_connection_name_search_placeholder:
    'Please enter the connection name to search',
  packages_dag_task_form_error_name_duplicate:
    'Task name already exists, please re-enter it',
  packages_dag_task_form_error_can_not_open_crontab_expression_flag:
    'The maximum number of running tasks has been reached. Unable to add new scheduled tasks. Please deactivate scheduling for some tasks or stop running tasks.',
  packages_dag_task_setting_sync_type: 'Sync Type',
  packages_dag_task_setting_initial_sync_cdc: 'Full and Incremental Sync',
  packages_dag_task_stetting_desc: 'Task Description',
  packages_dag_task_setting_plan_start_date: 'Scheduled Run',
  packages_dag_task_setting_crontabExpressionFlag: 'Scheduled Tasks',
  packages_dag_task_setting_cron_expression:
    'Please enter a scheduling expression',
  packages_dag_task_setting_cron_tip:
    'Enter a Cron expression to configure the running schedule.\n' +
    'Syntax: second * minute * hour * day * month * week ? year *\n' +
    'Example:\n' +
    '0 */1 * * * ?  // Run every minute \n' +
    '0 0 2 * * ?  // Run at 2:00 AM every day',
  packages_dag_task_setting_sync_point: 'Incremental collection start time',
  packages_dag_task_setting_syncPoint_tip:
    'The task will collect incremental logs from this point in time',
  packages_dag_task_setting_automatic_index: 'Automatically create an index',
  packages_dag_task_setting_stop_on_error: 'Stop on error',
  packages_dag_connection_form_shared_mining: 'Using CDC Log Caching',
  packages_dag_task_list_verify: 'Data Validation',
  packages_dag_task_setting_is_schedule: 'Scheduled tasks regularly',
  packages_dag_dag_data_setting_expression: 'Expression:',
  packages_dag_dag_data_setting_explanation:
    'You can set a fixed time, date, and interval to run periodic tasks through cron expressions',
  packages_dag_dag_data_setting_grammar: 'Grammar:',
  packages_dag_dag_data_setting_runMinute: 'Run every minute',
  packages_dag_dag_data_setting_runDay: "Run at 2 o'clock every day",
  packages_dag_connection_form_access_node: 'Agent Settings',
  packages_dag_agent_setting_from: 'Agent settings derive from the following',
  packages_dag_connection_form_automatic: 'Platform automatic allocation',
  packages_dag_connection_form_manual: 'User specified manually',
  packages_dag_task_setting_automatic_ddl: 'Automatic DDL',
  packages_dag_task_setting_distinct_write_type: 're-rewriting mechanism',
  packages_dag_task_setting_transformer_concurrency:
    'Number of target write threads',
  packages_dag_task_setting_cdc_concurrency:
    'Incremental synchronous concurrent writes',
  packages_dag_task_setting_lag_time: 'Incremental lag judgment time setting',
  packages_dag_task_setting_cdc_engine_filter: 'Enable engine filtering',
  packages_dag_task_setting_share_cdc_mode: 'Shared incremental read mode',
  packages_dag_task_setting_processorThreadNum: 'Number of processor threads',
  packages_dag_task_setting_increOperationMode: 'Incremental operation mode',
  packages_dag_button_redo: 'Redo',
  packages_dag_button_center_content: 'Center Content',
  packages_dag_button_auto_layout: 'Auto Layout',
  packages_dag_button_move_paper: 'Move canvas[Press space]',
  packages_dag_button_zoom_out: 'Zoom Out',
  packages_dag_button_zoom_in: 'Zoom In',
  packages_dag_task_list_button_monitor: 'Monitor',
  packages_dag_editor_cell_validate_empty_name: 'Name is required.',
  packages_dag_editor_cell_validate_none_data_node:
    'At least 2 data node in graph',
  packages_dag_dag_save_fail: 'Failed to save, please check the node.',
  packages_dag_message_operation_error: 'Operation Failed',
  packages_dag_message_resetOk: 'Reset Success',
  packages_dag_message_resetFailed: 'Reset Failed',
  packages_dag_message_task_rename_success: 'Modified successfully',
  packages_dag_dataFlow_multiError_notFound: 'This job does not existed.',
  packages_dag_dataFlow_multiError_statusError:
    'Job status does not allow to do this operation.',
  packages_dag_dataFlow_multiError_otherError:
    'Operation failed, please try it again.',
  packages_dag_editor_cell_link_writeMode_append: 'Append into Target',
  packages_dag_editor_cell_link_writeMode_upsert:
    'Match and Merge or Insert New',
  packages_dag_editor_cell_link_writeMode_update: 'Match and Merge',
  packages_dag_editor_cell_link_writeMode_merge_embed:
    'Match then Embed as Array in target',
  packages_dag_connection_status_all: 'All',
  packages_dag_connection_status_testing: 'Testing',
  packages_dag_connection_status_invalid: 'Invalid',
  packages_dag_connection_status_ready: 'Ready',
  packages_dag_dataFlow_delete_confirm_Message:
    'After deleting task XXX, this task cannot be restored',
  packages_dag_dataFlow_bulk_delete_confirm_Message:
    'After deleting tasks in batch, tasks cannot be restored',
  packages_dag_dataFlow_stop_confirm_message:
    'After suspending task xxx, when restarting the task, only the tables that were not fully synchronized will undergo full synchronization again. This ensures that already synchronized tables are not reprocessed unnecessarily.',
  packages_dag_dataFlow_bulk_stop_confirm_message:
    'After the task is paused in batch, when the table in the task that has not been fully synchronized is started again, the full synchronization will be performed again',
  packages_dag_dataFlow_force_stop_confirm_message:
    'Stopping the task xxx forcibly will immediately interrupt the data transmission, force the task to stop abruptly, and reset it.',
  packages_dag_dataFlow_bulk_force_stop_confirm_message:
    'Force-stopping the batch task will immediately interrupt data transmission, halt the task promptly, and initiate a reset of the task.',
  packages_dag_dataFlow_initialize_confirm_message:
    'Resetting task xxx will clear the task synchronization progress and the task will be executed again',
  packages_dag_dataFlow_bulk_initialize_confirm_message:
    'Resetting the task in batches will clear the task synchronization progress, and the task will be executed again',
  packages_dag_task_preview_status_error: 'Error',
  packages_dag_task_preview_status_edit: 'Edit',
  packages_dag_task_preview_status_wait_run: 'Scheduling',
  packages_dag_task_preview_status_running: 'Running',
  packages_dag_task_preview_status_stopping: 'Stopping',
  packages_dag_task_preview_status_preparing: 'Preparing',
  packages_dag_task_preview_status_scheduling: 'Scheduling',
  packages_dag_task_preview_status_schedule_failed: 'Scheduling Failed',
  packages_dag_task_preview_status_ready: 'Ready',
  packages_dag_dag_data_setting_minute: 'Minute',
  packages_dag_dag_data_setting_hour: 'Hour',
  packages_dag_dag_data_setting_day: 'Day',
  packages_dag_dag_data_setting_month: 'Month',
  packages_dag_dag_data_setting_week: 'Week',
  packages_dag_dag_data_setting_year: 'Year',
  packages_dag_mouse_selection: 'Box selection (press shift)',
  packages_dag_table_name_search_placeholder:
    'Please enter the table name to search',
  packages_dag_customer_logs_no_more_data: 'No more data',
  packages_dag_customer_logs_no_search_data: 'No search results',
  packages_dag_src_command_qingshixianun: 'Please implement the undo method. ',
  packages_dag_src_command_qingshixianex: 'Please implement the exec method. ',
  packages_dag_components_datapane_shanghaishiputuo:
    'Lane 1518, Jinshajiang Road, Putuo District, Shanghai',
  packages_dag_components_datapane_wangxiaohu: 'Wang Xiaohu',
  packages_dag_components_datapane_dizhi: 'Address',
  packages_dag_components_datapane_xingming: 'Name',
  packages_dag_components_datapane_riqi: 'Date',
  packages_dag_components_dfnode_gaijiedianth:
    'The node "{val1}" has reached the maximum connection limit',
  packages_dag_components_dfnode_tuodongshijianduan:
    'Drag the time period, or the distance change is small, trigger node activation',
  packages_dag_components_dfnode_qingjianchajiedian:
    'Please check node configuration',
  packages_dag_components_dfnode_shanchujiedian: 'Delete Node',
  packages_dag_components_dfnode_tianjiajiedian: 'Add Node',
  packages_dag_components_formpanel_zengliangzhihoupan:
    'Incremental lag judgment time setting (seconds)',
  packages_dag_components_formpanel_shiwuzuidashi:
    'Maximum transaction duration (hours)',
  packages_dag_components_formpanel_gongxiangwajueri:
    'CDC log caching filtering',
  packages_dag_components_formpanel_meiciduqushu: 'Number of each read',
  packages_dag_components_formpanel_zengliangtongbujian:
    'Incremental sync interval',
  packages_dag_components_formpanel_lunxunduqu: 'Polling Read',
  packages_dag_components_formpanel_liushiduqu: 'Streaming Read',
  packages_dag_components_formpanel_dangrenwukaiqi: 'When the task starts',
  packages_dag_components_formpanel_dangrenwubeibian: 'When tasks are edited',
  packages_dag_components_formpanel_dangrenwuchucuo: 'When the task fails',
  packages_dag_components_formpanel_dangrenwutingzhi: 'When the task stops',
  packages_dag_components_formpanel_fasongyoujian: 'Send Mail',
  packages_dag_components_formpanel_zengliangpicidu:
    'Number of incremental batches read',
  packages_dag_components_formpanel_zhutiao: 'One by one',
  packages_dag_components_formpanel_piliang: 'Batch',
  packages_dag_components_formpanel_zengliangshujuchu:
    'Incremental data processing mechanism',
  packages_dag_components_formpanel_zhichiwuzhujian:
    'Support no primary key synchronization',
  packages_dag_components_formpanel_zidongchuliD: 'Automatically handle DDL',
  packages_dag_components_formpanel_gengxinout: '👷 update $outputs',
  packages_dag_components_formpanel_gengxininp: '👷 Update $inputs',
  packages_dag_components_formpanel_shangyigejihuo:
    'Validation result of the last activated node',
  packages_dag_components_formpanel_jiantingsta: 'Listen: stateIsReadonly',
  packages_dag_components_leftsidebar_xuanzeshujuyuan:
    'Select data source type',
  packages_dag_components_metapane_geziduan: 'Fields',
  packages_dag_components_metapane_gongyou: 'Total',
  packages_dag_migration_configpanel_moxing: 'Model',
  packages_dag_migration_configpanel_peizhi: 'Configuration',
  packages_dag_migration_consolepanel_quanburizhi: 'All logs',
  packages_dag_migration_consolepanel_dangqianjiancefaxian:
    'Total findings from current detection.',
  packages_dag_migration_consolepanel_qingguanzhu: 'Please pay attention',
  packages_dag_migration_consolepanel_ge: 'Individual',
  packages_dag_migration_settingpanel_dangrenwufuhe:
    'When data verification is enabled, the task will automatically perform full verification and incremental verification for the data replication consistency. The verification results can be viewed on the Task Monitoring page. Note the verification currently does not support following scenarios, when one of the following happens, this feature will have no effect:\n 1. There is a processing node in the pipeline\n 2. The source connection does not support verification\n 3. The target connection does not support verification',
  packages_dag_monitor_bottompanel_yunxingjilu: 'Running Record',
  packages_dag_monitor_bottompanel_rizhi: 'Task Progress',
  packages_dag_components_eventchart_qita: 'Other',
  packages_dag_components_eventchart_suoxuanzhouqilei:
    'Selected cycle accumulation',
  packages_dag_components_eventchart_renwuyunxinglei: 'Task running cumulative',
  packages_dag_components_initiallist_quanliangtongbuzhuang:
    'Full synchronization status',
  packages_dag_components_initiallist_shujutongbu: 'Data synchronization',
  packages_dag_components_initiallist_mubiaobiaoming: 'Target table name',
  packages_dag_components_initiallist_yuanbiaoming: 'Source table name',
  packages_dag_components_initiallist_tongbuzhong: 'Synchronizing',
  packages_dag_components_initiallist_weikaishi: 'Not Started',
  packages_dag_components_initiallist_dianjishuaxin: 'Click to refresh',
  packages_dag_components_initiallist_quanliangxinxixiang:
    'Full information details',
  packages_dag_components_log_xiazaishibai: 'Download Failed',
  packages_dag_components_log_zidingyishijian: 'Custom Time',
  packages_dag_components_log_quanburizhi: 'All Logs',
  packages_dag_components_log_zuijintian: 'Last 3 days',
  packages_dag_components_log_zuixintian: 'Last 1 day',
  packages_dag_components_log_zuijingexiaoshi: 'Last 6 hours',
  packages_dag_components_log_kaiqishichangmiao: 'Open duration (seconds)',
  packages_dag_components_log_debug: 'Debug log parameter',
  packages_dag_components_log_rizhijibie: 'Log level:',
  packages_dag_components_log_rizhidengjishe: 'Log output level setting',
  packages_dag_components_log_xiazai: 'Download',
  packages_dag_components_log_qingshururizhi: 'Please enter the log content...',
  packages_dag_components_nodedetaildialog_chulihaoshi: 'Processing Time',
  packages_dag_components_nodedetaildialog_xingnengzhibiao:
    'Performance Metrics',
  packages_dag_components_nodedetaildialog_zengliangshijiandian:
    'Incremental Time',
  packages_dag_components_nodedetaildialog_xieyilianjiehao:
    'The protocol connection takes time',
  packages_dag_components_nodedetaildialog_tcPlianjie:
    'TCP connection time consuming',
  packages_dag_components_nodedetaildialog_lianjiezhuangtai:
    'Connection Status',
  packages_dag_components_nodedetaildialog_tongbuzhuangtai: 'Sync Status',
  packages_dag_components_nodedetaildialog_shijiantongji: 'Event Statistics',
  packages_dag_components_nodedetaildialog_jiedian: 'Node',
  packages_dag_components_nodedetaildialog_jiedianxiangqing: 'Node Details',
  packages_dag_components_record_shuchushijianzong: 'Total output events',
  packages_dag_components_record_shurushijianzong: 'Total input events',
  packages_dag_components_record_yunxingjieguo: 'Operation Result',
  packages_dag_components_record_caozuoren: 'Operator',
  packages_dag_components_record_yunxingjieshushi: 'Operation end time',
  packages_dag_components_record_yunxingkaishishi: 'Operation start time',
  packages_dag_components_timeselect_renwuquanzhouqi: 'Task full cycle',
  packages_dag_components_timeselect_incremental_phase: 'Incremental Phase',
  packages_dag_components_timeselect_zuijintian: 'Last 1 day',
  packages_dag_components_timeselect_zuixinxiaoshi: 'Latest 1 hour',
  packages_dag_components_timeselect_zuijinfenzhong: 'last 5 minutes',
  packages_dag_components_timeselect_zhouqi: 'Cycle',
  packages_dag_components_timeselect_jieshuriqi: 'End Date',
  packages_dag_components_timeselect_kaishiriqi: 'Start Date',
  packages_dag_components_timeselect_zhi: 'To',
  packages_dag_monitor_leftsider_chulihaoshim: 'Processing Time',
  packages_dag_monitor_leftsider_buzhichijiaoyan:
    'Tables that do not support verification:',
  packages_dag_monitor_leftsider_jiaoyanbuyizhi: 'Check inconsistent tables:',
  packages_dag_monitor_leftsider_chayizongxingshu: 'Difference total lines:',
  packages_dag_monitor_leftsider_liebiao: 'List',
  packages_dag_monitor_leftsider_renwujiaoyan: 'Task Validation',
  packages_dag_monitor_leftsider_biaotongbuzongjin:
    'Total progress of table synchronization',
  packages_dag_monitor_leftsider_yujiquanliangwan: 'Full sync needs more time',
  packages_dag_monitor_leftsider_quanliangwanchengshi: 'Full Completion',
  packages_dag_monitor_leftsider_quanliangxinxi: 'Full Information',
  packages_dag_monitor_node_zengliangzhuangtai: 'Incremental Status',
  packages_dag_monitor_node_quanliangzhuangtai: 'Full Status',
  packages_dag_monitor_node_snaps:
    '{val1}/{val2} | It is estimated that it will take {val3}',
  packages_dag_monitor_node_jinhangzhong: 'In Progress',
  packages_dag_monitor_node_daijinhang: 'Pending',
  packages_dag_monitor_node_leijishuchushi: 'Total Output',
  packages_dag_monitor_node_leijishurushi: 'Total Input',
  packages_dag_monitor_node_haoshi: 'Time-Consuming',
  packages_dag_monitor_topheader_dakaijiaoyan: 'Open Validation',
  packages_dag_monitor_topheader_mubiaolianjiebu:
    '3. The target connection does not support verification',
  packages_dag_monitor_topheader_yuanlianjiebuzhi:
    '2. The source connection does not support verification',
  packages_dag_monitor_topheader_tianjialezhongjian:
    '1. Added intermediate processing node',
  packages_dag_monitor_topheader_dangqianrenwuzan:
    'The current task does not support verification, possible reasons:',
  packages_dag_monitor_topheader_qidongshijian: 'Startup time:',
  packages_dag_monitor_topheader_qingshururenwu: 'Please enter the task name',
  packages_dag_monitor_verifypanel_zongji: 'Total',
  packages_dag_monitor_verifypanel_buzhichijiaoyan: 'Do not support validation',
  packages_dag_monitor_verifypanel_jiaoyanbuyizhi:
    'The validation is inconsistent',
  packages_dag_monitor_verifypanel_jiaoyanyizhi: 'Verify is consistent',
  packages_dag_monitor_verifypanel_yichangshujuhang: 'Exception data (line):',
  packages_dag_monitor_verifypanel_biaoming: 'Table name:',
  packages_dag_monitor_verifypanel_lianjieming: 'Connection name:',
  packages_dag_monitor_verifypanel_qingshurusousuo:
    'Kindly input/search for the desired content',
  packages_dag_monitor_verifypanel_jiancedaoxinshu:
    'New data detected, please click to refresh',
  packages_dag_monitor_verifypanel_wentibiaoqingdan: 'Problem table list',
  packages_dag_components_paperempty_shiyinghuabu: 'Adapt to the canvas',
  packages_dag_components_paperempty_huabushijichi:
    'The actual size of the canvas',
  packages_dag_components_paperempty_zhantie: 'Paste',
  packages_dag_components_settingpanel_renwudetongbu:
    'The task will be completed when the synchronization type is either incremental or full + incremental.',
  packages_dag_components_settingpanel_gongxiangwajueshe:
    'CDC log caching settings',
  packages_dag_components_settingpanel_shujuyuan: 'Data source:',
  packages_dag_components_settingpanel_chuliqixiancheng:
    'Number of processor threads:',
  packages_dag_components_settingpanel_miao: 'Seconds',
  packages_dag_components_settingpanel_zengliangshezhi: 'Incremental Settings',
  packages_dag_components_settingpanel_renwuzaijinhang:
    'The strategy the task executes when doing reads and writes',
  packages_dag_components_settingpanel_duxieshezhi: 'Read and write settings',
  packages_dag_components_settingpanel_renwuzaiqidong:
    'Environment settings for tasks at startup and run time',
  packages_dag_components_settingpanel_yunxingshezhi: 'Running Settings',
  packages_dag_components_settingpanel_jibenshezhi: 'Basic Settings',
  packages_dag_src_editor_chucuole: 'Something went wrong',
  packages_dag_src_editor_renwubaocunchu: 'Task save error',
  packages_dag_src_editor_zengshanziduan: 'Add and delete fields',
  packages_dag_src_editor_ziduangaiming: 'Field Rename',
  packages_dag_src_editor_leixingxiugai: 'Type Modification',
  packages_dag_src_editor_ziduanjisuan: 'Field Calculation',
  packages_dag_src_editor_zhuconghebing: 'Master-slave merge',
  packages_dag_src_editor_juhe: 'Aggregate',
  packages_dag_src_editor_zhuijiahebing: 'Union',
  packages_dag_src_editor_join: 'Join',
  packages_dag_src_editor_row_filter: 'Row Filter',
  packages_dag_src_migrationeditor_jSchuli: 'Enhanced JS',
  packages_dag_src_migrationeditor_jSchuli_standard: 'Standard JS',
  packages_dag_src_migrationeditor_ziduanbianji: 'Field Editor',
  packages_dag_src_migrationeditor_biaobianji: 'Table Editor',
  packages_dag_src_migrationeditor_zhuangtaijanting: 'Status monitoring',
  packages_dag_src_migrationmonitor_gaijiedianbuzhi:
    'This node does not support',
  packages_dag_src_migrationmonitor_cunzaibuzhichi:
    'There is a node that does not support {val1}',
  packages_dag_src_migrationmonitor_noden: "'{val1}' Configuration Error",
  packages_dag_src_migrationmonitorviewer_gaifuzhirenwu:
    'This replication task has no subtasks',
  packages_dag_src_migrationmonitorviewer_gaijiedianbuzhi:
    'This node does not support',
  packages_dag_src_migrationmonitorviewer_cunzaibuzhichi:
    'There is a node that does not support {val1}',
  packages_dag_src_migrationmonitorviewer_noden:
    "'{val1}' does not have any connections",
  packages_dag_mixins_editor_renwujiazaichu: 'Error loading task',
  packages_dag_mixins_editor_renwubucunzai: 'Task does not exist',
  packages_dag_mixins_editor_renwuzhonghanyou:
    'The current task includes JS nodes, custom nodes, Union nodes, or incremental custom SQL for node settings. However, please note that DDL is currently unsupported and therefore it will need to be closed manually',
  packages_dag_mixins_editor_gaijiedianbuzhi:
    'This node does not support running on {val1}（{val2}）',
  packages_dag_mixins_editor_not_support_ddl:
    'This node does not support DDL, please close it',
  packages_dag_mixins_editor_not_support_cdc:
    'The node does not support CDC. Change the task type to full',
  packages_dag_mixins_editor_task_not_support_cdc:
    'The task contains nodes that do not support CDC, change the task type to full',
  packages_dag_mixins_editor_buzhichiduotiao:
    'Multiple links are not supported, please re-edit the task link',
  packages_dag_mixins_editor_renwulianlubu: 'The task link is incomplete',
  packages_dag_mixins_editor_renwushezhiyi: 'The task setting is abnormal',
  packages_dag_mixins_editor_suoshuage:
    'The agent node to which it is associated is experiencing a conflict',
  packages_dag_mixins_editor_noden: "'{val1}' configuration is abnormal",
  packages_dag_mixins_editor_jiedianjiaoyancuo: 'Node check error',
  packages_dag_mixins_editor_shanchulianjie: 'Delete Connection',
  packages_dag_mixins_editor_initV:
    'The monitoring enabled by initView-dataflowEdit',
  packages_dag_mixins_editor_xinrenwu: 'New Task@',
  packages_dag_mixins_editor_source:
    "'{val1}' does not support the node '{val2}' as a target",
  packages_dag_mixins_editor_gaijiedianta:
    'The node "{val1}" is only supported as a source',
  packages_dag_mixins_editor_gaijiedianyijing:
    'The node has reached the maximum connection limit',
  packages_dag_mixins_editor_gaijiedianso:
    'The node "{val1}" is only supported as a target',
  packages_dag_mixins_formscope_tuiyanshibai: 'Deduction Failed',
  packages_dag_mixins_formscope_liuyipar:
    'Note that the parent cannot be found',
  packages_dag_nodes_aggregate_fanhuishili: 'Return Example',
  packages_dag_nodes_aggregate_fenzuziduan: 'Grouping Field',
  packages_dag_nodes_aggregate_zuoyongmubiao: 'Action Target',
  packages_dag_nodes_aggregate_juhehanshu: 'Aggregate Function',
  packages_dag_nodes_database_zengliangduoxiancheng:
    'Incremental multi-threaded write',
  packages_dag_nodes_database_quanliangduoxiancheng:
    'Full multi-threaded write',
  packages_dag_nodes_database_duoxianchengfenqujian:
    'Multithreaded Write - Partition Key',
  packages_dag_nodes_database_bucunzaishidiu: 'Discard if not exists',
  packages_dag_nodes_database_shanchushijian: 'Delete Event',
  packages_dag_nodes_database_bucunzaishicha: 'Insert if not exists',
  packages_dag_nodes_database_bucunzaishidayinrizhi: 'Print log if not exists',
  packages_dag_nodes_database_gengxinshijian: 'Update Event',
  packages_dag_nodes_database_mubiaocunzaishi: 'Discard when target exists',
  packages_dag_nodes_database_charushijian: 'Insert Event',
  packages_dag_nodes_database_shujuxieruce: 'Data write strategy',
  packages_dag_nodes_database_baochimubiaoduan:
    'Preserve the original table structure and data on the target side',
  packages_dag_nodes_database_qingchumubiaoduan:
    'Clear the original table structure and data on the target side',
  packages_dag_nodes_database_chongfuchulice: 'If the target table exists',
  packages_dag_nodes_database_tuiyanjieguo: 'Target Table Structure',
  packages_dag_nodes_database_guolvjieguo: 'Filter Results',
  packages_dag_nodes_database_dangqianjiedianzhi:
    'The current node has the capability to process DDL events',
  packages_dag_nodes_database_ddLshijian: 'DDL event collection',
  packages_dag_nodes_database_kaiqihourenwu:
    'Upon opening, the task will automatically gather the chosen source DDL events.',
  packages_dag_nodes_database_dongtaixinzengbiao: 'Dynamic new table',
  packages_dag_nodes_database_quanliangmeipici:
    'The number of records read per batch in full load should typically be kept at the default value. If your downstream system is slower and you encounter issues with the loss of the source cursor during tasks, please reduce this value.',
  packages_dag_nodes_database_piliangduqutiao: 'Batch read number',
  packages_dag_nodes_database_zengliangmeipici: 'Incremental batch size',
  packages_dag_nodes_database_zidingyi: 'Custom',
  packages_dag_nodes_database_xuanzebiao: 'Select Table',
  packages_dag_nodes_database_suoshuage: 'Belonging Agent',
  packages_dag_nodes_database_increment_exactly_once_enable_title:
    'Increment Exactly Once Write',
  packages_dag_nodes_database_increment_exactly_once_enable_tips:
    'Incremental data is accurately written once by marking and checking in the target cache. You are advised to enable this function when the value of the association condition changes. After this function is enabled, the synchronization speed decreases. The target needs to have table creation and write permissions.',
  packages_dag_nodes_database_increment_exactly_once_enable_time_window_day_title:
    'Time Window (Day)',
  packages_dag_nodes_database_increment_exactly_once_enable_time_window_day_tips:
    'The time for accurate write and cache data retention also represents the time window for accurate write. When the engine is running, it will trigger automatic clearing once a day. The longer the window time is set, the more storage space is occupied by the target database.',
  packages_dag_extends_nodetype_queshaobiyaode:
    'Missing required type attribute!',
  packages_dag_nodes_javascript_moxingshengming: 'Model Declaration',
  packages_dag_nodes_javascript_jiaoben: 'Script',
  packages_dag_nodes_join_youce: 'Right',
  packages_dag_nodes_join_zuoce: 'Left',
  packages_dag_nodes_join_lianjieziduanshe: 'Connection field settings',
  packages_dag_nodes_join_zuolianjie: 'Left Join',
  packages_dag_nodes_jointcache_qingxuanzehuochuang:
    'Please select or create a write path field',
  packages_dag_nodes_jointcache_xierulujing: 'Write Path',
  packages_dag_nodes_jointcache_yuanbiaoguanlianjian:
    'Source table associated key',
  packages_dag_nodes_jointcache_huancunbiaozhujian: 'Cache table primary key',
  packages_dag_nodes_jointcache_guanlianshezhi: 'Association settings',
  packages_dag_nodes_jointcache_chuangjianpipeishu: 'Create matching data',
  packages_dag_nodes_jointcache_baoliupipeishu: 'Keep matching data',
  packages_dag_nodes_jointcache_duiyinghuancunjie: 'Corresponding cache node',
  packages_dag_nodes_mergetable_mubiaobiaoziduan: 'Target table field',
  packages_dag_nodes_mergetable_dangqianbiaoziduan: 'Current table field',
  packages_dag_nodes_mergetable_guanliantiaojian: 'Association Conditions',
  packages_dag_nodes_mergetable_gengxinjianguanlian: 'Enable update join key',
  packages_dag_nodes_mergetable_gengxinjianguanlian_tips:
    'If the association condition may change, you need to open this switch, which will affect performance',
  packages_dag_nodes_mergetable_neiqianshuzupi: 'Table primary key',
  packages_dag_nodes_mergetable_guanlianhouxieru: 'Field write path',
  packages_dag_nodes_mergetable_gengxinjinneiqian: 'Update into embedded array',
  packages_dag_nodes_mergetable_shujuxierumo: 'Data write mode',
  packages_dag_nodes_rowfilter_tiaojianbiaodashi: 'Conditional expression',
  packages_dag_nodes_rowfilter_diuqipipeishu: 'Discard matching data',
  packages_dag_nodes_rowfilter_zhixingdongzuo: 'Execute Action',
  packages_dag_nodes_table_gengxintiaojianzi: 'Update condition field',
  packages_dag_nodes_table_gengxinyicunzai:
    'Update existing or insert new data',
  packages_dag_nodes_table_yunxingqianshanchu:
    'Delete existing data before running',
  packages_dag_nodes_table_baochiyicunzai: 'Keep existing data',
  packages_dag_nodes_table_yiyoushujuchu: 'Existing data processing',
  packages_dag_nodes_table_ddLshijian: 'DDL event collection',
  packages_dag_nodes_table_meiciduqushu: 'Number of reads per time (rows)',
  packages_dag_nodes_table_zengliangtongbujian:
    'Incremental synchronization interval (ms)',
  packages_dag_nodes_table_yifuzhi: 'Copied',
  packages_dag_nodes_table_fuzhibiaoming: 'Copy table name',
  packages_dag_nodes_table_qingxuanzebiao: 'Please select a table',
  packages_dag_nodes_table_fuzhishujuku: 'Copy database name',
  packages_dag_copy_node_id: 'Copy Node ID',
  packages_dag_nodes_table_shujuku: 'Database',
  packages_dag_nodes_targetdatabase_mubiaocunzaishi:
    'Update when target exists',
  packages_dag_nodes_targetdatabase_baochimubiaoduan:
    'To maintain the original table structure of the target, please clear the existing data.',
  packages_dag_nodes_targetdatabase_jiedianmiaoshu: 'Node Description',
  packages_dag_src_store_weizhaodaojiedian: 'Node not found',
  packages_dag_src_store_qingkongjiedianshu:
    'Clear the monitoring of node input and output',
  packages_dag_components_alert_dangqianrenwuyi:
    'The current task has been stopped with an error, please pay attention.',
  packages_dag_components_alert_gaojingfashengci: 'Number of alert occurrences',
  packages_dag_components_alert_gaojingzuijinfa: 'Last Occurred',
  packages_dag_components_alert_gaojingshoucifa: 'First Occurred',
  packages_dag_components_alert_gaojingmiaoshu: 'Alert Description',
  packages_dag_components_alert_gaojingzhuangtai: 'Alert Status',
  packages_dag_components_alert_gaojingjibie: 'Alert Level',
  packages_dag_components_frequency_shuaxinpinlu: 'Refresh Frequency',
  packages_dag_components_nodedetaildialog_xieruhaoshi: 'Writing Time',
  packages_dag_components_nodedetaildialog_zengliangduquyan:
    'Incremental read latency',
  packages_dag_components_nodedetaildialog_pingjunduquhao: 'Average read time',
  packages_dag_components_nodedetaildialog_zengliangshijiandian2:
    'Incremental time:',
  packages_dag_components_nodedetaildialog_dangqianbiaotongbu: 'Table Progress',
  packages_dag_components_nodedetaildialog_quanliangkaishishi: 'Full Start',
  packages_dag_components_timeselect_renwuzuijinyi:
    'From the last task activation until now',
  packages_dag_monitor_leftsider_shanchu: 'Delete:',
  packages_dag_monitor_leftsider_gengxin: 'Update:',
  packages_dag_monitor_leftsider_charu: 'Insert:',
  packages_dag_monitor_leftsider_renwushijiantong:
    'Processed Event Stats(Rows)',
  packages_dag_monitor_leftsider_zuidazengliangyan: 'Maximum replication delay',
  packages_dag_monitor_leftsider_tongbuxinxi: 'Sync Information',
  packages_dag_monitor_leftsider_tiaoshixinxi: 'Debug Information',
  packages_dag_monitor_leftsider_chayixiangqing: 'Difference Details',
  packages_dag_components_nodedetaildialog_chulixieruhao:
    'Processing/writing time',
  packages_dag_components_nodedetaildialog_duquchulihao:
    'Reading/processing time',
  packages_dag_components_nodedetaildialog_chulihaoshidang:
    'Processing time: the average time for the current node to process events',
  packages_dag_components_nodedetaildialog_xieruhaoshidang:
    'Writing time: the time it takes for the current target node to write data to the target database',
  packages_dag_components_nodedetaildialog_chulihaoshiyuan:
    'Processing time: the time it takes for the source node to complete the processing after reading the event from the source database',
  packages_dag_node_only_as_source:
    'This node({val1}) is only supported as a source',
  packages_dag_node_only_as_target:
    'This node({val1}) is only supported as a target',
  packages_dag_node_none_input:
    '「 {val1} 」At least {val2} source nodes are required',
  packages_dag_node_none_output:
    '「 {val1} 」At least {val2} target nodes are required',
  packages_dag_node_none_connection: '「 {val1} 」 no connection',
  packages_dag_components_nodedetaildialog_dangqianjiedianchu:
    "The current node's average event processing time",
  packages_dag_components_nodedetaildialog_dangqianjiedianping:
    'The average number of input events and output events per second processed by the current node',
  packages_dag_components_nodedetaildialog_dangqianjiedianping2:
    'The average input event size and output event size processed by the current node per second',
  packages_dag_monitor_leftsider_renwuchuliwan:
    'The processing time for completing a new event is calculated as the total time required for task processing. In cases where there are multiple targets, only the longest processing time is considered.',
  packages_dag_monitor_leftsider_shijiancongyuanku:
    'The delay time between the event being generated from the source library and the completion of writing to the target after the task is processed, Taking into account the maximum replication delay time when multiple targets are involved.',
  packages_dag_monitor_timeDifference:
    'Significant time difference between data source and engine ({val}), incremental delay is biased, please manually align the time',
  packages_dag_monitor_leftsider_qpSshizhi:
    'QPS refers to the average number of input events and output events processed by the task per second',
  packages_dag_monitor_leftsider_qpSshizhi2:
    'QPS refers to the average input event size and output event size processed by the task per second',
  packages_dag_components_nodedetaildialog_zengliangduquyan2:
    "Incremental read delay: the delay time from the time the incremental event is generated to the time it is read to the start of the task's processing in the incremental phase",
  packages_dag_components_nodedetaildialog_pingjunduquhao2:
    'Average read time: the average time to read each piece of data in the full stage',
  packages_dag_components_log_zuidashijianshu:
    'Maximum number of events (pieces)',
  packages_dag_message_save_fail: 'Save Failed',
  packages_dag_task_reset_start: 'Starting cleaning task',
  packages_dag_task_reset_pdk_node_external_resource:
    "Clean up external resources of pdk data node [{nodeName}({nodeId})]...{status}, time-consuming: {elapsedTime} ms's external resource(s)...{status}, elapsed time: {elapsedTime} ms",
  packages_dag_task_reset_pdk_node_state:
    "Clean up status data of pdk data node [{nodeName}({nodeId})]...{status}, time-consuming: {elapsedTime} ms's state data...{status}, elapsed time: {elapsedTime} ms",
  packages_dag_task_reset_merge_node:
    "Clean up the cache data of the master-slave merge node [{nodeName}({nodeId})]...{status}, time-consuming: {elapsedTime} ms's cache data...{status}, elapsed time: {elapsedTime} ms",
  packages_dag_task_reset_aggregate_node:
    "Clearing the cached data of aggregation node [{nodeName}({nodeId})]...{status}, time spent: {elapsedTime} ms's cache data...{status}, elapsed time: {elapsedTime} ms",
  packages_dag_task_reset_custom_node:
    "Clean up the status data of custom node [{nodeName}({nodeId})]...{status}, time spent: {elapsedTime} ms's cache data...{status}, elapsed time: {elapsedTime} ms",
  packages_dag_task_reset_join_node:
    "Clean join node[{nodeName}({nodeId})]'s cache data...{status}, elapsed time: {elapsedTime} ms",
  packages_dag_task_reset_end:
    'The task is cleaned, in total, {totalEvent} items need to clean, succeed: {succeedEvent} item, failed: {failedEvent} item...{status}, elapsed time: {elapsedTime} ms',
  packages_dag_unknown_error:
    'Clean node[{nodeName}({nodeId})] occur an unknown error',
  packages_dag_console_log_status_success: 'Succeed',
  packages_dag_console_log_status_fail: 'Failed',
  packages_dag_auto_reset_start:
    'The task will automatically attempt to reset the cleanup {rest} times on failed cleanup items after {resetInterval} seconds',
  packages_dag_auto_reset_start_nth:
    'The task starts to perform the {resetTimes} automatic reset cleanup',
  packages_dag_auto_reset_start_result:
    'The task reset failed, please try again later',
  packages_dag_migration_alarmpanel_lianxu: 'Continuous',
  packages_dag_migration_alarmpanel_youjiantongzhi: 'Email Notification',
  packages_dag_migration_alarmpanel_xitongtongzhi: 'System Notification',
  packages_dag_migration_alarmpanel_renwuzengliangyan:
    'Task increment delay alert',
  packages_dag_migration_alarmpanel_renwutingzhigao: 'Task stop alert',
  packages_dag_migration_alarmpanel_renwuzengliangkai:
    'Task increment start notification',
  packages_dag_migration_alarmpanel_renwuquanliangwan:
    'Notice of full completion of tasks',
  packages_dag_migration_alarmpanel_renwujiaoyanchu: 'Task validation error',
  packages_dag_migration_alarmpanel_renwuyunxingchu: 'Task running error alert',
  packages_dag_migration_alarmpanel_jiedianpingjunchu:
    'Node average processing time alert',
  packages_dag_migration_alarmpanel_shujuyuanxieyi:
    'Data source protocol connection time-consuming alert',
  packages_dag_migration_alarmpanel_shujuyuanwangluo:
    'Data source network connection time-consuming alert',
  packages_dag_migration_alarmpanel_shujuyuanwufa:
    'Data source cannot be connected to alert',
  packages_dag_migration_configpanel_gaojingshezhi: 'Alert Settings',
  packages_dag_monitor_bottompanel_guanlianrenwu: 'Associated Tasks',
  packages_dag_monitor_bottompanel_gaojingliebiao: 'Alert List',
  packages_dag_components_alert_guanbichenggong: 'Close Successfully',
  packages_dag_components_alert_quanbugaojing: 'All Alerts',
  packages_dag_mixins_editor_debug: '[DEBUG] Initialize ws monitor',
  packages_dag_mixins_editor_debug2:
    '[DEBUG] Polling the loading task details, the status is inconsistent, and update according to the returned status',
  packages_dag_mixins_editor_debug3:
    '[DEBUG] Polling load task details, current status: [{val1}], return status: [{val2}]',
  packages_dag_mixins_editor_debug4:
    '[DEBUG] Start polling loading tasks, every 3s',
  packages_dag_mixins_editor_debug5:
    '[DEBUG]ws returned, task status: [{val1}]',
  packages_dag_monitor_topheader_zuijinyiciqi: 'Last start time:',
  packages_dag_components_nodedetaildialog_quanliangyiwancheng:
    'Full volume completed',
  packages_dag_components_node_quanliangwanchenghaixu: 'Estimated finish time',
  packages_dag_components_node_xieruhaoshi: 'Writing time:',
  packages_dag_components_node_chulihaoshi: 'Processing time:',
  packages_dag_components_node_zanbuzhichi: 'Not Supported',
  packages_dag_page_return_confirm_title: 'Return to confirm',
  packages_dag_page_return_confirm_content:
    'Would you like to keep the current task, even though it is empty?',
  packages_dag_page_return_confirm_ok_text: "Don't keep",
  packages_dag_page_return_confirm_cancel_text: 'Keep',
  packages_dag_monitor_node_popover_cdcTimeTitle_source:
    'Read incremental time',
  packages_dag_monitor_node_popover_cdcTimeTitle_target:
    'Write incremental time',
  packages_dag_monitor_node_popover_cdcTimeTitle_processor:
    'Process incremental time',
  packages_dag_monitor_node_popover_targetWriteTime_title: 'Average write time',
  packages_dag_monitor_node_per_deal_need_time: 'Single processing time',
  packages_dag_api_docs: 'API Documentation',
  packages_dag_js_declare_index_queding: 'OK',
  packages_dag_js_declare_index_shilidaima: 'Sample Code',
  packages_dag_js_declare_index_shiyongbangzhu: 'Use Help',
  packages_dag_js_declare_index_xianshishengminglai:
    'Explicit declarations to define and modify models',
  packages_dag_js_declare_index_zengjiayigezi:
    "// Add a field, do not operate if the field already exists\nTapModelDeclare.addField({val1}, 'fieldName', 'TapString')\n// Remove an existing field\nTapModelDeclare.removeField({val2}, 'fieldName')\n//Update an existing field\nTapModelDeclare.updateField({val3}, 'fieldName', 'TapString')\n//Update the field, if it does not exist, add it\nTapModelDeclare.upsertField({ val4}, 'fieldName', 'TapString')\n// Set the field as the primary key\nTapModelDeclare.setPk({val5}, 'fieldName')\n// Cancel the primary key\nTapModelDeclare.unSetPk({val6}, 'fieldName' )\n// Add index\nTapModelDeclare.addIndex({val7}, 'indexName', [{'{'}'fieldName':'fieldName1', 'order': 'asc'{'}'}])\n// Remove index\nTapModelDeclare. removeIndex({val8}, 'indexName')\n",
  packages_dag_python_declare_index_zengjiayigezi:
    "# Add a field, do not operate if the field already exists\nTapModelDeclare.addField({val1}, 'fieldName', 'TapString')\n# Remove an existing field\nTapModelDeclare.removeField({val2}, 'fieldName')\n//Update an existing field\nTapModelDeclare.updateField({val3}, 'fieldName', 'TapString')\n//Update the field, if it does not exist, add it\nTapModelDeclare.upsertField({ val4}, 'fieldName', 'TapString')\n# Set the field as the primary key\nTapModelDeclare.setPk({val5}, 'fieldName')\n# Cancel the primary key\nTapModelDeclare.unSetPk({val6}, 'fieldName' )\n# Add index\nTapModelDeclare.addIndex({val7}, 'indexName', [{'{'}'fieldName':'fieldName1', 'order': 'asc'{'}'}])\n# Remove index\nTapModelDeclare. removeIndex({val8}, 'indexName')\n",
  packages_dag_python_not_support_windows:
    'Python nodes are currently only supported on Linux Agents, not Windows.',
  packages_dag_js_processor_index_duibi: 'Comparison',
  packages_dag_js_processor_index_yongfa: 'Usage:',
  packages_dag_js_processor_index_zuoyong: 'Function:',
  packages_dag_js_processor_index_fangfa: 'Method',
  packages_dag_js_processor_index_wangluogongju: 'Network Tools',
  packages_dag_js_processor_index_iDshengchengqi: 'ID Generator',
  packages_dag_js_processor_index_riqichuli: 'Date Processing',
  packages_dag_merge_table_tree_index_biaozhijianketong:
    'Tables can be nested by dragging and dropping to determine the master-slave relationship',
  packages_dag_merge_table_tree_index_biaomingchengzhichi: 'Table Name',
  packages_dag_migration_settingpanel_cronbiao: 'Cron expression format error',
  packages_dag_hooks_useaftertasksaved_moxingyishengcheng:
    'The model has been generated, execute callback',
  packages_dag_mixins_editor_wsshoudaole:
    'Ws received the return of other tasks',
  packages_dag_nodes_database_tongjizhuijiaxie: 'Append write',
  packages_dag_nodes_database_anshijianleixing: 'Process by event type',
  packages_dag_nodes_database_tongjizhuijiaxie2:
    'Statistics additional writing: only handle insert events, discard update and delete events',
  packages_dag_nodes_database_setting_cdc_changjing_desc:
    'The act of clearing the target table structure and data is not supported in the pure incremental scenario.',
  packages_dag_nodes_database_xierumeipizui:
    'Write the maximum waiting time for each batch (ms)',
  packages_dag_nodes_database_xierumeipizui_tips:
    'If the configuration time limit is exceeded and there are still not enough accumulated batches, a write operation will be initiated.',
  packages_dag_nodes_database_quanliangmeipici2:
    'When a certain amount of data is accumulated, it will be written in batches.',
  packages_dag_nodes_database_piliangxierutiao: 'Number of writes per batch',
  packages_dag_nodes_database_zhengzebiaodashi:
    'When the regular expression matching mode is enabled, any newly added tables in the database that meet the expression criteria will be automatically synchronized to the target.',
  packages_dag_nodes_database_anzhengzebiaoda: 'Match by regular expression',
  packages_dag_nodes_database_anbiaomingxuanze: 'Select by table name',
  packages_dag_nodes_database_value_zanbuzhiciddl:
    'Does not support DDL event collection',
  packages_dag_nodes_mergetable_const_zuiduozhichiliangceng:
    'Up to two levels of nesting are supported',
  packages_dag_nodes_mergetable_zhucongpeizhi: 'Master-slave Configuration',
  packages_dag_nodes_table_isDaa_ruguoyuanweimongodb:
    'When using MongoDB as the source, ensure synchronized deletion events for the associated _id field.',
  packages_dag_nodes_table_tianjia: 'Add',
  packages_dag_nodes_table_zidingyitiaojian: 'Custom Conditions',
  packages_dag_nodes_table_guolushezhi: 'Filter Settings',
  packages_dag_nodes_table_meiciduquhang: 'The number of rows read each time',
  packages_dag_nodes_table_lunxunjiangem: 'Polling Interval (ms)',
  packages_dag_nodes_table_lunxunziduanmo: 'Polling field default value',
  packages_dag_nodes_table_zhidinglunxunzi: 'Specify the polling field',
  packages_dag_nodes_cdcPollingFields_tip:
    'Please ensure that the selected polling fields have indexes; otherwise, it may impact the source database due to query performance issues.',
  packages_dag_nodes_table_lunxun: 'Polling',
  packages_dag_nodes_table_rizhicdc: 'Log CDC',
  packages_dag_nodes_table_tedingziduande:
    'The real-time log method analyzes and synchronizes incremental events using the data source transaction log. On the other hand, field polling uses field polling to synchronize incremental events, but it may not be able to perform synchronous deletion of events.',
  packages_dag_nodes_table_zengliangtongbufang:
    'Incremental synchronization method',
  packages_dag_table_list_card_index_zanshimeiyoupi:
    'There is no matching table yet',
  packages_dag_nodes_database_pipeidaodebiao: 'Matched Table',
  packages_dag_nodes_tableprocessor_biaomingchongfu:
    'The table name is repeated',
  packages_dag_monitor_leftsider_zuidaQps: 'Maximum QPS(Q/S)',
  packages_dag_monitor_leftsider_pingjunQps: 'Average QPS(Q/S)',
  packages_dag_monitor_leftsider_quanliangwanchenghao: 'Full Sync Duration',
  packages_dag_monitor_bottompanel_renwujindu: 'Task Progress',
  packages_dag_src_editor_shaohouqidong: 'Start Later',
  packages_dag_src_editor_jixuqidong: 'Continue to start',
  packages_dag_src_editor_renwubaocunjianceshi:
    'An alert was detected while saving the task, which may result in abnormal task execution. It is advisable to resolve the alert before starting the task',
  packages_dag_monitor_leftsider_jibenxinxi: 'Basic Information',
  packages_dag_nodes_aggregate_waicunpeizhi: 'External storage configuration',
  packages_dag_field_inference_main_tuiyanyichang: 'Deduction exception',
  packages_dag_field_inference_main_gengxintiaojianyi:
    'The update condition is abnormal',
  packages_dag_field_inference_main_quanbubiao: 'All tables',
  packages_dag_migration_settingpanel_zhuanweiputongC:
    'Switch to normal CDC mode',
  packages_dag_migration_settingpanel_renwuzhijiebao:
    'The task reports an error and stops',
  packages_dag_migration_settingpanel_danggongxiangwajue:
    'When shared mining is not available (Task Start)',
  packages_dag_migration_settingpanel_danggongxiangwajuetooltip:
    'The availability of shared mining will be detected when the task is started, and the strategy selected below will be used when mining is unavailable.\nPossible unavailable scenarios\n1. The switch is not turned on in the data connection\n2. The set start time is earlier than the first entry of the external storage log data\n3. The mining task reports an error and stops',
  packages_dag_field_inference_list_gaiziduanyingshe:
    'The target data type of this field mapping is the result of system speculation, and the result may be biased. Please check and confirm whether it meets expectations, and adjust it according to the actual situation. ',
  packages_dag_field_inference_list_gaiziduanwufa:
    'This field type is not currently supported. To avoid data processing errors, you can use the field editing function to hide this field.',
  packages_dag_field_inference_main_xuanzemorengeng:
    'When selecting the default update condition field, the default priority is to associate with the primary key field, if there is no primary key, associate with the unique index field, and if there is no primary key and no unique index, a hash field will be automatically added. When the specified field is selected, it will be associated with the specified update condition field.\nNote: System will automatically create indexes for update condition fields to optimize performance. Consider manually creating indexes before running tasks to avoid impacting the target database.',
  packages_dag_nodes_table_zidingyichaxun: 'Fully Customizable Query',
  packages_dag_field_inference_main_gaibiaocunzaibu:
    'The table has an unsupported data type',
  packages_dag_validate_customsql_fail:
    'Once full custom query is enabled, processing nodes only support using JS nodes.',
  packages_dag_validate_customsql_target_fail:
    'Once full custom query is enabled, only weak schema type data sources can be used as targets, such as Mongo, Kafka, and ES.',
  packages_dag_field_inference_list_gaiziduanshuju:
    'The system cannot determine the deduction type of this field, please set the type manually, otherwise the processing of this field will be ignored during task execution.',
  packages_dag_monitor_leftsider_huancunkaishishi: 'Cache start time',
  packages_dag_monitor_node_zhengzaishiyongdehuancun: 'Cache in use',
  packages_dag_nodes_database_fenpianyipidu: 'Sharding batch read limit',
  packages_dag_nodes_database_fenpianbingfaxian:
    'Sharding concurrency thread count',
  packages_dag_nodes_database_fenpianshuliang: 'Number of shards',
  packages_dag_nodes_database_fenpiandaxiao: 'Shard Size',
  packages_dag_nodes_database_jiyucou: 'Sharding based on count',
  packages_dag_nodes_database_jiyumin: 'Sharding based on min/max',
  packages_dag_nodes_database_fenpianfangshi: 'Sharding Method',
  packages_dag_nodes_database_kaiqifenpian: 'Enable Sharding',
  packages_dag_nodes_database_fenpianpilianghezengliang:
    'Shard batches and incremental data are merged locally before sending',
  packages_dag_nodes_database_guanbicigongnenghoufenpian:
    'When this function is turned off, the shard batch and incremental data will not be merged locally, but will be sent directly to the target. This feature is suitable for scenarios where there is only batching or no incremental events will occur during the batching process. ',
  packages_dag_nodes_database_quanliangduandianshi:
    'The full breakpoint is suitable for scenarios where the data size exceeds 1e, and it will cause the waiting time for the task to start synchronizing data to become longer. After it is enabled, the task in the full phase can be interrupted',
  packages_dag_nodes_database_quanliangduandianxu: 'Full breakpoint resume',
  packages_dag_nodes_table_depskai:
    'It is not supported to enable filtering settings when enabling full breakpoint resume upload.',
  packages_dag_nodes_table_depskai2:
    'It is not supported to open custom SQL when full breakpoint resume is enabled.',
  packages_dag_nodes_table_depsd:
    'After enabling the custom SQL/filtering settings, it is not supported to enable full resuming of breakpoints.',
  packages_dag_task_old_version_confirm:
    'Detected an update to the current task, please refresh the page to load the latest version.',
  packages_dag_date_processor: 'Time Calculation',
  packages_dag_date_processor_data_types:
    'Please select the type of time you want to calculate',
  packages_dag_date_processor_method: 'Please select the calculation method',
  packages_dag_date_processor_increase: 'Increase',
  packages_dag_date_processor_decrease: 'Decrease',
  packages_dag_nodes_table_shiligro:
    'Example: {\'{\'}"$group": {\'{\'} "_id": "$name", totalQuantity: {\'{\'} $sum: "$quantity" {\'} }}\'}',
  packages_dag_nodes_table_jinzhichiqu:
    'Only support query, for example: {\'{\'} "_id": "apples", "qty": 5 {\'}\'}',
  packages_dag_migration_settingpanel_shirenwubaocuo:
    'When the task reports an error, stop',
  packages_dag_migration_settingpanel_dangtiaoguoshijian:
    'When the number of skip events exceeds',
  packages_dag_migration_settingpanel_dangtiaoguoshijian2:
    'When the percentage of skipped events to synchronized events exceeds',
  packages_dag_migration_settingpanel_zhidingtiaoguoce: 'Specify skip strategy',
  packages_dag_migration_settingpanel_renwutiaoguoshi:
    'Stop task when skip event exceeds threshold',
  packages_dag_migration_settingpanel_tiaoguoyichangshi:
    'Skip abnormal events, the task continues to run',
  packages_dag_migration_settingpanel_dangdanbiaotongbu:
    'When the event processing is abnormal',
  packages_dag_migration_settingpanel_anzhaomorenzhong:
    'Retry according to the default retry logic',
  packages_dag_mixins_formscope_gaizduanshibi: 'This field is required!',
  packages_dag_default_js: 'Default JS',
  packages_dag_standardization_js: 'Standardized JS',
  packages_dag_mixins_formscope_gaiziduanshibi: 'This field is required!',
  packages_dag_shared_mining_table_info_index_wajuebiaoxinxi:
    'Mining table information',
  packages_dag_table_not_exist:
    'Table not exist, will be automatically created',
  packages_dag_field_inference_list_anxishutiaozheng: 'Adjust by coefficient',
  packages_dag_field_inference_list_zidingyitiaozheng: 'Custom Adjustments',
  packages_dag_field_inference_list_anzhaoxishu:
    'Adjust field length by coefficient',
  packages_dag_field_inference_list_anzhaoxishu_tip:
    'Adjustment by coefficient refers to multiplying the original deduced length by the set coefficient as the adjusted field length',
  packages_dag_field_rename_index_yixiacaozuoyi:
    'The following operations cannot match the source field',
  packages_dag_nodes_database_jinwuzhujianbiao:
    'No Primary Key and No Unique Index',
  packages_dag_nodes_database_jinyouzhujianbiao:
    'Includes Primary Key or Unique Index',
  packages_dag_nodes_database_biaoxianshi: 'Selectable table range',
  packages_dag_nodes_database_xuanzeyaoguolvdiaode:
    'Select the field type to filter out',
  packages_dag_data_schema: 'Data Schema',
  packages_dag_config_ddl: 'DDL Synchronization',
  packages_dag_config_data_read: 'Data Read',
  packages_dag_config_breakpoint_resume: 'Resume from Breakpoint',
  packages_dag_config_datasource: 'Data Source',
  packages_dag_config_data_write: 'Data Write',
  packages_dag_config_incremental_mode: 'Incremental Mode',
  packages_dag_config_data_filter: 'Data Filter',
  packages_dag_config_data_filter_tip:
    'Data filter configuration may impact the source database due to query filter performance issues. Please use with caution.',
  packages_dag_field_add_del_index_zhidi: 'To Bottom',
  packages_dag_field_add_del_index_xiayi: 'Move down',
  packages_dag_field_add_del_index_shangyi: 'Move Up',
  packages_dag_field_add_del_index_zhiding: 'To Top',
  packages_dag_src_editor_leixingguolu: 'Type Filter',
  packages_dag_src_editor_date_processor_field_list:
    'Fields affected by operations',
  packages_dag_dynamicAdjustMemoryUsage_title:
    'Dynamic Adjustment Memory Usage',
  packages_dag_dynamicAdjustMemoryUsage_tip:
    'In the full synchronization phase, if identified data consumes significant memory, the system will automatically proportionally reduce memory queue usage to prevent memory overflow errors. This may result in a reduction in synchronization speed. It is advisable to enable this feature when machine resources are limited for stable synchronization. When machine resources are sufficient, it is recommended to disable it.',
  packages_dag_mergeMode: 'Merge Mode',
  packages_dag_main_table_first: 'Snapshot read primary table priority',
  packages_dag_sub_table_first: 'Snaphost read child table priority',
  packages_dag_model_generation: 'Schema Generating',
  packages_dag_materialized_view: 'Materialized View',
  packages_dag_build_materialized_view: 'Build Materialized View',
  packages_dag_materialized_view_help_title: 'How to build materialized views?',
  packages_dag_materialized_view_help_desc:
    'A materialized view is a special type of database view that enhances data retrieval speed. With Tapdata Cloud, you can create real-time materialized views, simplifying data management and application development processes.',
  packages_dag_materialized_view_help_tutorial_btn: 'Detailed tutorial',
  packages_dag_materialized_view_help_video_desc:
    'The following video tutorial explains how to build materialized views using Tapdata Cloud...',
  packages_dag_select_database_tips: 'Select a Database',
  packages_dag_select_table_tips: 'Select a Table',
  packages_dag_join_table: 'Join Table',
  packages_dag_write_target: 'Write Target',
  packages_dag_materialized_view_field_type: 'Field Type',
  packages_dag_materialized_view_main_talbe_tips: 'Please select a main table',
  packages_dag_materialized_view_field_flatten: 'Flatten',
  packages_dag_materialized_view_field_document: 'Embedded Document',
  packages_dag_materialized_view_field_array: 'Embedded Array',
  packages_dag_materialized_view_storage_table:
    'Materialized View Storage Table',
  packages_dag_add_field: 'Add Field',
  packages_dag_search_node: 'Search Node',
  packages_dag_unwind_name: 'Unwinding Arrays',
  packages_dag_unwind_path: 'Array Field Path',
  packages_dag_unwind_includeArrayIndex: 'Array Index Field Name',
  packages_dag_unwind_preserveNullAndEmptyArrays:
    'Preserve Empty and Null Arrays',
  packages_dag_unwind_preserveNullAndEmptyArrays_tips:
    'If true, if the path is null, missing, or an empty array, outputs the document.\nIf false, if path is null, missing, or an empty array, does not output a document.',
  packages_dag_unwind_unwindModel: 'Unwind Model',
  packages_dag_unwind_embedded: 'Embedded Object',
  packages_dag_unwind_flatten: 'Flatten Fields',
  packages_dag_unwind_arrayModel: 'Array Element Type',
  packages_dag_unwind_arrayModel_mix: 'Mixed Type',
  packages_dag_unwind_arrayModel_basic: 'Basic Type',
  packages_dag_unwind_arrayModel_object: 'Object Type',
  packages_dag_unwind_joiner: 'Field Joiner',
  packages_dag_btn_disable_node: 'Disable Node',
  packages_dag_only_mongodb: 'Supports MongoDB databases only.',
  packages_dag_field_inference_list_zidingyileixing: 'Custom Type',
  packages_dag_field_inference_list_xuanzetiaozhengde:
    'Select the type to adjust:',
  packages_dag_enableSyncMetricCollector_title: 'Sync Metrics Collection',
  packages_dag_enableSyncMetricCollector_tip:
    'If enabled, the sync metrics of the task will be automatically collected. After the task stops, the corresponding metric information will be output for analysis.',
  packages_dag_update_conditions_tip:
    'Note: System will automatically create indexes for update condition fields to optimize performance. Consider manually creating indexes before running tasks to avoid impacting the target database.',
  packages_dag_existDataProcessMode_desc:
    'This action will directly delete the target table and data, potentially impacting the database. Please use with caution.',
  packages_dag_ddl_events_collapse_tip:
    'Enabling this feature will automatically apply DDL operations from the source to the target database, potentially impacting the target database. Please enable with caution.',
  packages_dag_ddl_stopped_on_error: 'Stop Task Upon Encountering DDL',
  packages_dag_ddl_auto_ignore: 'Automatically Ignore All DDLs',
  packages_dag_ddl_sync_events: 'Sync DDL Events',
  packages_dag_dateFieldName: 'Date Field Name',
  packages_dag_time_field_injection: 'Time Field Injection',
  packages_dag_task_setting_syncPoint_recent_increment:
    'Time of the most recent increment',
  packages_dag_task_setting_syncPoint_from_now: 'Apply',
  packages_dag_feature_agent_version_tips: `Requires Agent version {val} or higher`,
  packages_dag_syncIndex: 'Table Creation Synchronize Index',
  packages_dag_syncIndex_desc:
    'Currently, only unique indexes and regular indexes are supported, and functions cannot be used in indexes.',
  packages_dag_ddl_ignore_rules: 'DDL Ignoring Rules',
  packages_dag_ddl_ignore_rules_placeholder:
    'Please enter a regular expression to ignore specific DDL',
  packages_dag_ddl_ignore_rules_tip:
    'When the option to halt the task with an error upon encountering DDL is selected, it is possible to configure which DDLs to ignore through regular expressions.\nExample:\nALTER\\s+TABLE\\s+"([^"]+)"\\s+ADD\\s+\\("([^"]+)"\\s+[^\\)]+\\)',
  packages_dag_just_insert: 'Insert Only',
  packages_dag_unwind_validate_error:
    'When using the Unwind node, the target node write strategy should support "insert-only".',
  packages_dag_doubleActive: 'Bidirectional Synchronization',
  packages_dag_doubleActive_tip:
    'When bidirectional synchronization is required and the generated incremental events do not interfere with the system itself, please turn on this switch.',
  packages_dag_time_zone_offset: 'Time Zone Offset',
  packages_dag_dynamic_date_suffix: 'Dynamic Date Suffix',
  packages_dag_dynamic_date_suffix_tip:
    'When enabled, the generated table names will have a date suffix corresponding to the runtime of the task',
  packages_dag_table_rename_multiple:
    'In the task, only one table editing node is allowed',
  packages_dag_migrate_union: 'Union',
  packages_dag_merged_tableName: 'Merged Table Name',
  packages_dag_merged_tableName_ph: 'Please enter the merged table name',
  packages_dag_migrate_union_multiple:
    'In the task, only one Union node is allowed',
  packages_dag_enableConcurrentProcess: 'Enable concurrent processing',
  packages_dag_concurrentNum: 'Number of Concurrent Tasks',
  packages_dag_uniqueIndexEnable: 'Index with unique identifier',
  packages_dag_migration_uniqueIndexEnable:
    'Update condition field index to add unique identifier',
  packages_dag_uniqueIndexEnable_tip:
    'When on, creates unique index based on update conditions. When off, creates normal index. Note: Records with the same update fields may lose data during updates, and concurrent writes may cause duplicates.',
  packages_dag_refresh_schema: 'Refresh Schema',
  packages_dag_switch_to_table_view: 'Switch to Table View',
  packages_dag_switch_to_tree_view: 'Switch to Tree View',
  packages_dag_syncIndexTip:
    'Enabling this capability will automatically synchronize the source index to the target. This action may impact the target database, so please enable it with caution.',
  packages_dag_updateConditionFields_alert:
    'To ensure performance, the system will auto-index updated fields.',
  packages_dag_syncPartitionTableEnable: 'Synchronized Partitioned Table',
  packages_dag_syncSourcePartitionTableEnable:
    'Synchronized Partitioned Main Table',
  packages_dag_syncSourcePartitionTableEnable_tip:
    'When enabled, the child tables are filtered out; when disabled, the main table is filtered out.',
  packages_dag_enableConcurrentRead: 'Enable Concurrent Table Reading',
  packages_dag_enableConcurrentRead_tips:
    'Enabling this will allow the system to read and sync multiple tables simultaneously, ideal for scenarios with many small tables to improve performance. \nNote: In full-sync mode, newly added tables won’t sync once enabled. Adjust the target node concurrent thread count based on available resources to maintain stability.',
  packages_dag_concurrentReadThreadNumber: 'Number of Tables to Read',
  packages_dag_missing_primary_key_or_index:
    'Missing Primary Key or Unique Index',
  packages_dag_merge_table_missing_key_or_index:
    'The current node lacks a primary key or unique index. Please add one to ensure accurate and consistent merging, then try again.',
  packages_dag_add_own_datasource: 'Add My Own Data Source',
  packages_dag_add_own_target_datasource: 'Add My Own Target Data Source',
  packages_dag_add_new_connection: 'Create New Connection',
  packages_dag_add_own_datasource_desc:
    'Configure a new data source from the list of connectors in TapData',
  packages_dag_no_datasource: 'I Don’t Have a Data Source',
  packages_dag_no_target_datasource: 'I Don’t Have a Target Data Source',
  packages_dag_no_datasource_desc:
    'TapData provides a demo library with 2 sources and 2 targets.',
  packages_dag_have_connection: 'Select Existing Connection',
  packages_dag_have_connection_desc:
    'Connections or data sources you have previously created.',
  packages_dag_select_datasource: 'Select Data Source',
  packages_dag_select_connection: 'Select Connection',
  packages_dag_search_connection: 'Search Connection',
  packages_dag_search_datasource: 'Search Data Source',
  packages_dag_tour_task_success:
    'Congratulations on successfully creating your first replication task!',
  packages_dag_tour_task_success_desc:
    'You can now use our product for database replication, migration, and other tasks.',
  packages_dag_access_task_list: 'Access Task List',
  packages_dag_current_selected: 'Currently Selected',
  packages_dag_task_monitor: 'Task Monitoring',
  packages_dag_select_HasKeys_alert:
    'Only tables with primary keys or unique indexes are synced. To sync tables without primary keys, please switch manually.',
  packages_dag_counting: 'Counting',
  packages_dag_counting_num_of_rows_table:
    'Counting the number of rows in the table',
  packages_dag_noPkSyncMode: 'No Primary Key Table Sync Mode',
  packages_dag_noPkSyncMode_ADD_HASH: 'Add Hash Column',
  packages_dag_noPkSyncMode_ALL_COLUMNS: 'Full Column Index',
  packages_dag_join_keys_empty:
    'Association conditions for {tableName} cannot be empty',
  packages_dag_join_keys_field_empty:
    'Field in association condition #{index} for {tableName} cannot be empty.',
  packages_dag_src_editor_huawei_drs_kafka_convertor:
    'Huawei DRS Kafka Message Converter',
  packages_dag_field_path: 'Field Path',
  packages_dag_email_receivers: 'Email Receivers',
  packages_dag_merge_table_js_node_error:
    'Merge table node cannot have JS node after it',
  packages_dag_merge_table_table_not_allow_target:
    'Merge table does not support writing to {val}',
  packages_dag_only_include_pk: 'Only Include Primary Key',
  packages_dag_only_include_uk: 'Only Include Unique Index',
}

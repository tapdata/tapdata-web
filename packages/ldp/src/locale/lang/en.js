export default {
  packages_ldp_lineage: 'Lineage',
  packages_ldp_order_fully_managed_storage: 'Buy Now',
  packages_ldp_connection_expired: 'Storage has expired, please reset.',
  packages_ldp_view_lineage: 'View Lineage',
  packages_ldp_lineage_loading_tips: 'Double-click the node to drill down.',
  packages_ldp_table_comment: 'Table Comment',
  packages_ldp_src_dashboard_anEsctui:
    'Press Esc to exit the traceability scene',
  packages_ldp_src_tablepreview_querenshanchu: 'Confirm to delete? ',
  packages_ldp_src_tablepreview_gaibiaojianghuicong:
    'The table will be deleted from the database and cannot be recovered after the operation',
  packages_ldp_src_tablepreview_jiancedaoyouren:
    'It is detected that a task is using {val1}, please delete all related tasks and try again',
  packages_ldp_src_target_muqianzhichide: 'Currently supported types',
  packages_ldp_upgrade_storage: 'Upgrade Storage',
  packages_ldp_data_hub_intro_title: 'What is Real Time Data Hub?',
  packages_ldp_data_hub_intro_desc1:
    'A data hub allows you to consolidate mission critical data from siloed sources into centralized storage, then provide fresh data to downstream applications or dashboards from a single location.',
  packages_ldp_data_hub_intro_desc2:
    'Tapdata uses CDC technology to sync the data from source and uses MongoDB / MongoDB Atlas as hub storage, to achieve the near real time data latency experiecne.',
  packages_ldp_data_hub_intro_scene_title:
    'Which Use Cases Can I Use Real Time Data Hub?',
  packages_ldp_data_hub_intro_scene_single_view: 'Single View',
  packages_ldp_data_hub_intro_scene_single_view_sub:
    'Products ｜ Customers ｜ Orders',
  packages_ldp_data_hub_intro_scene_realtime: 'Real Time',
  packages_ldp_data_hub_intro_scene_realtime_sub: 'Dashboards  ｜  Reports',
  packages_ldp_data_hub_intro_scene_api: 'Enterprise API Service',
  packages_ldp_data_hub_intro_scene_api_sub: 'Database to API',
  packages_ldp_data_hub_intro_how_do: 'How Does It Work?',
  packages_ldp_data_hub_intro_how_do_step1: 'Configure Data Hub Storage',
  packages_ldp_data_hub_intro_how_do_step1_sub:
    'First configure a data storage in the cloud, Tapdata uses MongoDB Atlas.',
  packages_ldp_data_hub_intro_how_do_step2: 'Sync Data & Consolidate',
  packages_ldp_data_hub_intro_how_do_step2_sub:
    'Use Tapdata Replication & Transformation, sync data from your data sources into Data Hub.',
  packages_ldp_data_hub_intro_how_do_step3: 'Publish API or Send to Dashboards',
  packages_ldp_data_hub_intro_how_do_step3_sub:
    'from data hub, or connect to the Bl product of your choice You may then publish API.',
  packages_ldp_data_hub_subscribe: 'Configure Storage',
  page_title_data_hub: 'Real Time Data Hub',
  packages_ldp_source_empty_text: '1. Create your own data source first',
  packages_ldp_target_empty_text: '2. Next, create your target database.',
  packages_ldp_not_support_increments:
    'Current source data does not support increments.',
  packages_ldp_drag_source_table_to_start:
    'Drag the source table here to start copying.',
  packages_ldp_run_only_once: 'Run only once',
  packages_ldp_run_every_10_minutes: 'Run every 10 minutes',
  packages_ldp_run_every_hour: 'Run every 1 hour',
  packages_ldp_run_every_day: 'Run every day',
  packages_ldp_custom_cron_expression: 'Custom cron expression',
  packages_ldp_view_task_monitor: 'View Task Monitor',
  packages_ldp_book_demo: 'Feel free to Book a Demo with us',
  packages_ldp_mdm_create_method: 'Create Method',
  packages_ldp_mdm_create_method_transformation: 'Use Data Transformation Task',
  packages_ldp_mdm_create_method_materialized: 'Use Materialized View',
  packages_ldp_fdm_create_task_has_synced:
    'You have already copied some tables, but you can still select more. Newly selected tables will be added to the existing list.',
  packages_ldp_fdm_create_task_has_expression:
    'You have selected tables by regex matching and cannot select more. Please use the Data Copy feature to continue copying tables.',
  packages_ldp_task_delay_detail: 'Task Delay Details',
  packages_ldp_task_delay_detail_tip:
    'Displays all tasks involved in this model and their corresponding delay durations',
  packages_ldp_task_delay_detail_logic: 'Calculation Logic',
  packages_ldp_task_delay_detail_logic_tip1:
    'Maximum data delay represents the longest time required for data changes generated in the source systems to be written into the model, after passing through all related synchronization and processing tasks.',
  packages_ldp_task_delay_detail_logic_tip2:
    'This metric aggregates the incremental delays across all upstream tables and their associated task pipelines involved in building the model, and takes the maximum value to indicate how late the most recently updated data in the model may be.',
  packages_ldp_task_delay_detail_logic_tip3:
    'Tasks included in this calculation are highlighted with their delay',

  // ─── Data Trace ───
  packages_ldp_trace_data_filters: 'Data Filters',
  packages_ldp_trace_builder: 'Builder',
  packages_ldp_trace_mql_json: 'MQL JSON',
  packages_ldp_trace_btn: 'Trace',
  packages_ldp_trace_tracked_fields:
    'Select the fields you want to trace across the data lineage',
  packages_ldp_trace_add_field: '+ Add Field',
  packages_ldp_trace_data_lineage: 'Data Lineage',
  packages_ldp_trace_no_results_title: 'No trace results yet',
  packages_ldp_trace_no_results_desc:
    'Configure filters and click {0} to start tracking data across pipeline nodes.',
  packages_ldp_trace_flow: 'Data Tracing',
  packages_ldp_trace_copy: 'Copy',
  packages_ldp_trace_no_data: 'No data found',
  packages_ldp_trace_data_missing: 'Data missing',
  packages_ldp_trace_no_data_comment:
    '// No data — record missing at this node',
  packages_ldp_trace_change_stream: 'Change Stream / Oplog',
  packages_ldp_trace_tab_table: 'Table',
  packages_ldp_trace_tab_json: 'JSON',
  packages_ldp_trace_tab_changelog: 'Change Log',
  packages_ldp_trace_changelog_start: 'Start time',
  packages_ldp_trace_changelog_end: 'End time',
  packages_ldp_trace_changelog_query: 'Query',
  packages_ldp_trace_changelog_empty: 'Select a time range and click Query to view change logs.',
  packages_ldp_trace_changelog_no_more: 'No more logs',
  packages_ldp_trace_changelog_max_range: 'Time range cannot exceed 7 days',
  packages_ldp_trace_changelog_shortcut_1h: 'Last 1 hour',
  packages_ldp_trace_changelog_shortcut_1d: 'Last 1 day',
  packages_ldp_trace_changelog_shortcut_3d: 'Last 3 days',
  packages_ldp_trace_status_loading: 'Loading…',
  packages_ldp_trace_status_ok: 'Data Found',
  packages_ldp_trace_status_error: 'Missing Data',
  packages_ldp_trace_main_table: 'Main Table',
  packages_ldp_trace_sub_table: 'Sub Table',
  packages_ldp_trace_join: '{0} join | {0} joins',
  packages_ldp_trace_filter_field: 'Field',
  packages_ldp_trace_filter_value: 'Enter value...',
  packages_ldp_trace_page_title: 'Data Trace',
  packages_ldp_trace_qc_title: 'Query Conditions',
  packages_ldp_trace_qc_edit: 'Edit Conditions',
  packages_ldp_trace_qc_cancel: 'Cancel',
  packages_ldp_trace_qc_save: 'Save & Retrace',
  packages_ldp_trace_qc_invalid_json: 'Invalid JSON',
}

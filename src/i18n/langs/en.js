export default {
  /** 全局 */
  gl_see_more: 'See more',
  gl_no_data: 'No data',
  gl_no_match_result: 'No matching results were found',
  gl_back_to_list: 'Back to list',
  gl_button_cancel: 'Cancel',
  gl_button_finish: '完成',
  gl_button_delete_fail: 'Failed to delete',
  gl_button_update_success: 'Successfully modified',
  gl_qr_code_wx_public_account: 'WeChat public account',
  gl_qr_code_tip: 'Code scanning consultation',
  gl_qr_code_wx_customer_service: 'WeChat customer service',
  gl_telephone_tip: 'Telephone consultation',
  /** 模块 */
  // 工作台
  workbench_manage: 'Workbench',
  workbench_quick_start: 'Quick start',
  workbench_notice: 'Announcement notice',
  workbench_overview: 'Overview',
  workbench_guide: "Beginner's guide",
  workbench_agent_desc:
    'Welcome to Tapdata Cloud, you are about to start your real-time data synchronization journey! Please install and deploy the Agent for the first use, otherwise the task cannot be run. ',
  workbench_agent_button_create: 'Create Agent',
  workbench_connection_desc:
    "Data connection is mainly used to establish the connection between the Agent and the user's source database and target database. Come and create a data connection, and test and manage the status of the existing data connection. ",
  workbench_connection_button_create: 'Create connection',
  workbench_task_desc:
    'Task management is mainly used to create and manage synchronization tasks. Come and create a data synchronization task, and view and manage the types and status of existing data synchronization tasks. ',
  workbench_task_button_create: 'Create task',
  workbench_overview_connection: 'Connect',
  workbench_overview_connection_ready: 'Active connection',
  workbench_overview_connection_invalid: 'Invalid connection',
  workbench_overview_task: 'Task',
  workbench_guide_novice: 'Novice Guide',
  workbench_guide_documentation: 'Product Documentation',
  workbench_guide_problem: 'Common problems',
  workbench_guide_data_safe: 'How does Tapdata cloud ensure data security? ',

  // Agent
  agent_manage: 'Agent Management',
  agent_name: 'Agent ID/Name',
  agent_id: 'Agent ID',
  agent_task_number: 'Number of tasks',
  agent_create_time: 'Creation time',
  agent_version: 'Version',
  agent_status: 'status',
  agent_operate: 'operate',
  agent_status_all: 'All status',
  agent_status_creating: 'Creating',
  agent_status_running: 'Running',
  agent_status_stopped: 'Stopped',
  agent_search: 'Search by ID/Agent name',
  agent_test_use: 'For testing use only',
  agent_button_create: 'Create Agent',
  agent_button_order1: 'Order Instance1',
  agent_button_order2: 'Order Instance2',
  agent_button_deploy: 'Deploy',
  agent_button_deploy_now: 'Deploy now',
  agent_button_deploy_later: 'Deploy later',
  agent_button_stop: 'stop',
  agent_button_delete: 'delete',
  agent_button_auto_upgrade: 'Auto update',
  agent_button_manual_upgrade: 'Manual upgrade',
  agent_tip_auto_upgrade: 'Unable to use "Auto upgrade" when Agent is offline',
  agent_dialog_upgrade_title:
    'The Agent version is updated. You can upgrade your Agent to the latest version in the following ways. Tasks cannot be run during the upgrade process.',
  agent_dialog_upgrade_fail: 'Automatic upgrade failed, please try to upgrade manually.',
  agent_link_to_purchase_msg: 'Jump to the download page after confirmation',
  agent_link_to_purchase_title: 'Whether to confirm the order instance？',
  agent_link_to_old_purchase_msg: 'After confirmation, jump to the page for ordering hosting instances',
  agent_link_to_old_purchase_title: 'Confirm to order managed instance？',
  agent_button_create_msg_success: 'Agent created successfully',
  agent_button_create_msg_success_desc:
    'Please click [Deploy] to enter the deployment page and follow the instructions to complete the Agent deployment.',
  agent_button_stop_tip: 'Whether to stop',
  agent_button_stop_tip_running:
    'There is a task currently running on the Agent. Forcibly stopping the Agent may cause the task to be abnormal. Do you want to forcibly stop it?',
  agent_button_stop_tip_no_running:
    'After the Agent is stopped, the task can no longer be run. You need to go to the Agent installation directory to start the Agent again. Are you sure to stop?',
  agent_button_stop_msg_success: 'Agent is stopped',
  agent_button_stop_msg_fail: 'Agent failed to stop',
  agent_button_delete_confirm_title: 'The agent can no longer be used after it is deleted. Are you sure to delete it?',
  agent_button_delete_confirm_msg:
    'There are tasks currently running on the Agent. Please stop the tasks before deleting them.',
  agent_button_delete_success: 'Agent deleted successfully',
  agent_button_delete_fail: 'Agent deletion failed',
  agent_auto_upgrade_tip_running_task:
    'It has been detected that you have tasks running, please stop all tasks before proceeding with the upgrade operation!',
  agent_auto_upgrade_tip_start: 'Start to upgrade',
  agent_auto_upgrade_tip_upgrading: 'Automatically upgrading',
  agent_auto_upgrade_tip_progress: 'Upgrade package download progress',
  agent_auto_upgrade_tip_fail: 'Automatic upgrade failed, please upgrade manually',
  agent_auto_upgrade_tip_have_new: 'Agent version is updated, click to upgrade',
  agent_button_create_tip: 'Create an Agent？',
  agent_detail_synchronization_task_number: 'Number of synchronization tasks',
  agent_detail_version: 'Agent version',
  agent_detail_create_time: 'Agent creation time',
  agent_detail_host_ip: 'Host IP',
  agent_detail_host_cpu_number: 'Host CPU number',
  agent_detail_host_memory_size: 'Host memory size',
  agent_detail_installation_manual: 'Installation directory',

  // Agent部署
  agent_deploy_title: 'Agent download and installation',
  agent_deploy_select_tip:
    'Tapdata DFS Cloud Edition needs to install the Agent locally to ensure the normal operation of the database connection and data transmission service. You can select the corresponding type below to download and install according to the type of server to be installed.',
  agent_deploy_before_prepare_title: 'Prepare before installation',
  agent_deploy_before_prepare_windows_first:
    '1. Before installation, please make sure that Java 1.8 is installed in your deployment environment and the environment variables are correctly configured. ',
  agent_deploy_before_prepare_windows_first_link: 'Click to see how to install and configure Java 1.8',
  agent_deploy_before_prepare_windows_second:
    '2. Click the download button below to download the Tapdata Agent installation package to the local environment. ',
  agent_deploy_before_prepare_windows_second_download: 'Click to download Tapdata Agent',
  agent_deploy_start_install: 'Start installation',
  agent_deploy_start_install_button_copy: 'Copy',
  agent_deploy_start_install_button_copied: 'Copied',
  agent_deploy_start_install_windows_first:
    '1. Put the downloaded Tapdata Agent into the directory where you want to install the Agent, and execute the following commands in the directory through the cmd window to realize the automatic deployment and startup of the Tapdata Agent',
  agent_deploy_start_install_windows_second:
    '2. After the above command is executed, the log as shown in the figure below appears, which means that the agent started successfully:',
  agent_deploy_start_install_windows_third:
    "3. If you need to view the agent's log or start and stop the agent, please refer to",
  agent_deploy_link_agent_operation: '《Agent Basic Operations》',
  agent_deploy_before_prepare_linux_first:
    '1. Before installation, please make sure that Java 1.8 is installed in your deployment environment and the environment variables are correctly configured. ',
  agent_deploy_before_prepare_linux_first_link: 'Click to see how to install and configure Java 1.8',
  agent_deploy_before_prepare_linux_second:
    '2. We highly recommend deploying Tapdata Agent in a separate and clean folder',
  agent_deploy_before_prepare_linux_third:
    '3. Download and deploy Tapdata Agent without root permission, only need to have read and write permissions on the deployment directory',
  agent_deploy_start_install_linux_first:
    '1. Please copy the following command and execute it in the local deployment environment, which includes the download, automatic deployment and startup of Tapdata Agent',
  agent_deploy_start_install_linux_second:
    '2. After the above command is executed, the log as shown in the figure below appears, which means that the agent started successfully:',
  agent_deploy_start_install_linux_third:
    "3. If you need to view the agent's log or start and stop the agent, please refer to",
  agent_deploy_before_prepare_docker_first:
    '1. We provide an image that contains the environment required for Tapdata Agent to run',
  agent_deploy_before_prepare_docker_second:
    '2. First, your deployment environment must have Docker installed before you can use Docker to install, if not installed, please refer to',
  agent_deploy_before_prepare_docker_install_link: '《Docker Installation》',
  agent_deploy_before_prepare_docker_second_install: 'Proceed to install',
  agent_deploy_start_install_docker_first:
    '1. Please copy the following command and execute it in the deployment environment, which includes the download and operation of the image, the download, automatic deployment and start of the Tapdata Agent',
  agent_deploy_start_install_docker_second:
    '2. After the docker installation is successful, the container ID of the installed Agent will be automatically output. You can use the docker ps command to view the running docker',
  agent_deploy_start_install_docker_third:
    "3. If you need to view the agent's log or start and stop the agent, please refer to",

  // Agent升级
  agent_upgrade_title: 'Agent version upgrade',
  agent_upgrade_select_tip:
    'The system has detected that your Agent is not the latest version, please follow the instructions to upgrade',
  agent_upgrade_before_title: 'Before upgrade',
  agent_upgrade_step_title: 'Upgrade step',
  agent_deploy_upgrade_button_copy: 'Copy',
  agent_deploy_upgrade_button_copied: 'copied',
  agent_upgrade_before_windows_first: '1. Backup the tapdata.exe of the existing program',
  agent_upgrade_before_windows_second:
    '2. Download the new version of tapdata.exe program and put it in the program directory',
  agent_upgrade_before_windows_second_download: 'Click to download',
  agent_upgrade_before_windows_third: '3. Follow the upgrade steps',
  agent_upgrade_step_windows_first: '1. Open the cmd window and enter the original Agent installation directory',
  agent_upgrade_step_windows_second:
    '2. Copy the upgrade command below and execute it in the directory. The upgrade command will automatically back up, upgrade and start. If the upgrade fails, it will automatically roll back the version.',
  agent_upgrade_step_windows_third:
    '3. After the upgrade command is executed, if the following appears, it means that the Agent upgrade is successful: Update finished.',
  agent_upgrade_step_linux_first: '1. Enter the original Agent installation directory',
  agent_upgrade_step_linux_second:
    '2. Copy the upgrade command below and execute it in the directory. The upgrade command will automatically back up, upgrade and start. If the upgrade fails, it will automatically roll back the version.',
  agent_upgrade_step_linux_third:
    '3. After the upgrade command is executed, if the following appears, it means that the Agent upgrade is successful: Update finished.',
  agent_upgrade_step_docker_first: '1. Enter the docker container of the original Agent',
  agent_upgrade_step_docker_first_one: "(1) Found the original agent's docker container CONTAINER ID",
  agent_upgrade_step_docker_first_two: '(2) Enter the container through the container ID',
  agent_upgrade_step_docker_first_three:
    '(3) If the container has stopped running, you can start the container first and then enter the container to upgrade',
  agent_upgrade_step_docker_first_four: 'Start the container',
  agent_upgrade_step_docker_first_five: 'Enter the container',
  agent_upgrade_step_docker_second:
    '2. Copy the upgrade command below to execute directly in the container, the upgrade command will automatically back up, upgrade and start, if the upgrade fails, it will automatically roll back the version',
  agent_upgrade_step_docker_third:
    '3. After the upgrade command is executed, if the following appears, it means that the Agent upgrade is successful: Update finished.',

  // 连接
  connection_manage: 'Connection Management',

  // 任务
  task_manage: 'Task Management',
  task_name: 'Task name',
  task_sync_type_initial_sync: 'full amount',
  task_sync_type_cdc: 'Incremental',
  task_sync_type_initial_sync_cdc: 'Full amount + incremental',

  // 数据校验
  verify_manage: 'Data verification',
  verify_details_title: 'Task verification details',
  verify_history_title: 'Task verification history',
  verify_diff_history_title: 'Diff verification history',
  verify_diff_details_title: 'Diff verification details',
  verify_result_title: 'Verification result',
  verify_button_diff_verify: 'diff verification',
  verify_button_diff_verify_running: 'verification in progress',
  verify_button_diff_verify_tips:
    'Re-verify the difference data result of this full verification, the difference in the number of rows does not support the difference verification',
  verify_last_start_time: 'Last verification time',
  verify_button_diff_task_history: 'Verify History',
  verify_message_old_data_not_support: 'Old data does not support secondary verification',
  verify_message_out_of_limit:
    'Your discrepancy data volume has exceeded the maximum number of error data saved by the task support, and the second verification is temporarily unable to be performed',
  verify_result_count_more: 'Target count more: {0}',
  verify_result_count_less: 'Target count less: {0}',
  verify_result_content_diff: 'Table data difference: {0}',
  verify_result_count_inconsistent: 'inconsistent',
  verify_result_count_consistent: 'consistent',

  // 操作日志
  operation_log_manage: 'Operation log'
}

const Mock = require('mockjs')
const settings = require('./settings.json')
const Random = Mock.Random

module.exports = {
  '/api/Connections': {
    code: 'ok',
    msg: 'ok',
    'data|1-30': [
      {
        name: '@name',
        connection_type: 'target',
        database_type: 'mongodb',
        database_host: '',
        database_username: '',
        database_port: Random.integer(0, 5000),
        database_uri: 'mongodb://192.168.1.191:27017/tapdata_test',
        database_name: '',
        id: '@id',
        sslCert: '',
        additionalString: '',
        'ssl|1': Boolean,
        sslKey: '',
        sslPass: '',
        'schemaAutoUpdate|1': Boolean,
        sslCA: '',
        search_databaseType: '',
        status: 'ready',
        fill: 'uri',
        user_id: '@id',
        last_updated: Random.datetime(),
        loadCount: Random.integer(0, 100),
        'loadFieldsStatus|1': ['loading', 'finished'],
        tableCount: Random.integer(0, 100),
        username: '@name'
      }
    ]
  },
  '/api/Settings': settings,
  '/api/timeStamp': { data: '1620388869929', code: 'ok', msg: 'ok' },
  '/api/users/login': { data: '1620388869929', code: 'ok', msg: 'ok' },
  '/api/users/:id': {
    data: {
      account_status: 1,
      accesscode: '3324cfdf-7d3e-4792-bd32-571638d4562f',
      username: 'admin',
      email: 'admin@admin.com',
      emailVerified: true,
      id: '5fcf01b8f89acdf892e8bf78',
      role: 1,
      emailVerified_from_frontend: true,
      data: { isCompleteGuide: true },
      last_updated: '2021-04-03T08:05:58.827Z',
      isCompleteGuide: true,
      favorites: [
        {
          name: 'dataExplorer',
          query: {
            apiServer: 'apiServerId',
            collection: 'v1POLICY_REPL_v1',
            condition: '{"and":[{"POLICY_ID":"P100000001"}]}',
            sortBy: '_id',
            fields:
              '{"POLICY_ID":true,"CUSTOMER_ID":true,"QUOTE_DAY":true,"COVER_START":true,"LAST_ANN_PREMIUM_GROSS":true,"POLICY_STATUS":true,"LAST_CHANGE":true,"_id":true}'
          },
          meta: { title: 'tst' }
        }
      ],
      roleMappings: [
        {
          id: '600162d8188734b1d4e010e1',
          principalType: 'USER',
          principalId: '5fcf01b8f89acdf892e8bf78',
          roleId: '5b9a0a383fcba02649524bf1',
          role: {
            created: '2021-01-07T13:03:42.794Z',
            modified: '2021-01-07T13:03:42.794Z',
            name: 'admin',
            id: '5b9a0a383fcba02649524bf1',
            last_updated: '2021-01-15T13:15:19.201Z',
            register_user_default: false,
            user_id: '5fcf01b8f89acdf892e8bf78'
          }
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/users/:id/permissions': {
    data: {
      permissions: [
        {
          description: '系统消息通知设置功能',
          resources: [{ type: 'button', code: 'home_notice' }],
          need_permission: true,
          id: '1',
          name: 'notice',
          order: 1,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'datasource_delete_all_data' }],
          need_permission: true,
          id: '10',
          name: 'datasource_delete_all_data',
          order: 10,
          parentId: 'datasource_delete',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: 'API服务器模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_server', path: '/apiServers' }
          ],
          need_permission: true,
          id: '100',
          name: 'API_server',
          order: 100,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_server_management' }],
          need_permission: true,
          id: '101',
          name: 'API_server_management',
          order: 101,
          parentId: 'API_server',
          status: 'enable',
          type: 'write'
        },
        {
          description: '数据采集旧版模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'data_collect(old)_menu',
              path: '/dataCollect'
            }
          ],
          need_permission: true,
          id: '102',
          dataControl: true,
          isMenu: true,
          name: 'data_collect_menu',
          order: 102,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据采集旧版模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'data_collect(old)' }],
          need_permission: true,
          id: '103',
          dataControl: true,
          name: 'data_collect',
          order: 103,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [
            {
              type: 'page',
              code: 'data_collect_all_data',
              path: '/dataCollect'
            }
          ],
          need_permission: true,
          id: '104',
          name: 'data_collect_all_data',
          order: 104,
          parentId: 'data_collect',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '系统管理模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'system_management_menu' }],
          need_permission: true,
          id: '105',
          isMenu: true,
          name: 'system_management_menu',
          order: 105,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '系统管理模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'system_management' }],
          need_permission: true,
          id: '106',
          name: 'system_management',
          order: 106,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '调度任务模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'schedule_jobs_menu', path: '/tasks' }
          ],
          need_permission: true,
          id: '107',
          isMenu: true,
          name: 'schedule_jobs_menu',
          order: 107,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '调度任务模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'page', code: 'schedule_jobs', path: '/tasks' }],
          need_permission: true,
          id: '108',
          name: 'schedule_jobs',
          order: 108,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'schedule_jobs_management' }],
          need_permission: true,
          id: '109',
          name: 'schedule_jobs_management',
          order: 109,
          parentId: 'schedule_jobs',
          status: 'enable',
          type: 'write'
        },
        {
          description: '编辑数据源功能',
          resources: [
            { type: 'page', code: 'datasource_edition', path: '/connection' }
          ],
          need_permission: true,
          id: '11',
          dataControl: true,
          name: 'datasource_edition',
          order: 11,
          parentId: 'datasource',
          status: 'enable',
          type: 'write'
        },
        {
          description: '集群管理模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'Cluster_management_menu',
              path: '/clusterManagement'
            }
          ],
          need_permission: true,
          id: '110',
          dataControl: true,
          isMenu: true,
          name: 'Cluster_management_menu',
          order: 110,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '集群管理模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'Cluster_management',
              path: '/clusterManagement'
            }
          ],
          need_permission: true,
          id: '111',
          dataControl: true,
          name: 'Cluster_management',
          order: 111,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'Cluster_management_all_data' }],
          need_permission: true,
          id: '112',
          name: 'Cluster_management_all_data',
          order: 112,
          parentId: 'Cluster_management',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'Cluster_operation' }],
          need_permission: true,
          id: '113',
          name: 'Cluster_operation',
          order: 113,
          parentId: 'Cluster_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'status_log' }],
          need_permission: true,
          id: '114',
          name: 'status_log',
          order: 114,
          parentId: 'Cluster_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '进程管理模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'page', code: 'agents_menu', path: '/agents' }],
          need_permission: true,
          id: '115',
          isMenu: true,
          name: 'agents_menu',
          order: 115,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '进程管理模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'page', code: 'agents', path: '/agents' }],
          need_permission: true,
          id: '116',
          name: 'agents',
          order: 116,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '用户管理模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'user_management_menu', path: '/users' }
          ],
          need_permission: true,
          id: '117',
          dataControl: true,
          isMenu: true,
          name: 'user_management_menu',
          order: 117,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '用户管理模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'user_management', path: '/users' }
          ],
          need_permission: true,
          id: '118',
          dataControl: true,
          name: 'user_management',
          order: 118,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_management_all_data' }],
          need_permission: true,
          id: '119',
          name: 'user_management_all_data',
          order: 119,
          parentId: 'user_management',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'datasource_edition_all_data' }],
          need_permission: true,
          id: '12',
          name: 'datasource_edition_all_data',
          order: 12,
          parentId: 'datasource_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_creation' }],
          need_permission: true,
          id: '120',
          name: 'user_creation',
          order: 120,
          parentId: 'user_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_edition' }],
          need_permission: true,
          id: '121',
          dataControl: true,
          name: 'user_edition',
          order: 121,
          parentId: 'user_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_edition_all_data' }],
          need_permission: true,
          id: '122',
          name: 'user_edition_all_data',
          order: 122,
          parentId: 'user_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_delete' }],
          need_permission: true,
          id: '123',
          dataControl: true,
          name: 'user_delete',
          order: 123,
          parentId: 'user_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_delete_all_data' }],
          need_permission: true,
          id: '124',
          name: 'user_delete_all_data',
          order: 124,
          parentId: 'user_delete',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_category_management' }],
          need_permission: true,
          id: '125',
          name: 'user_category_management',
          order: 125,
          parentId: 'user_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'user_category_application' }],
          need_permission: true,
          id: '126',
          name: 'user_category_application',
          order: 126,
          parentId: 'user_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '角色管理模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'role_management_menu', path: '/roles' }
          ],
          need_permission: true,
          id: '127',
          dataControl: true,
          isMenu: true,
          name: 'role_management_menu',
          order: 127,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '角色管理模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'role_management', path: '/roles' }
          ],
          need_permission: true,
          id: '128',
          dataControl: true,
          name: 'role_management',
          order: 128,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'role_management_all_data' }],
          need_permission: true,
          id: '129',
          name: 'role_management_all_data',
          order: 129,
          parentId: 'role_management',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据传输模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'data_transmission_menu',
              path: '/dataFlows'
            },
            { type: 'page', code: 'data_transmission', path: '/job' }
          ],
          need_permission: true,
          id: '13',
          isMenu: true,
          name: 'data_transmission_menu',
          order: 13,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'role_creation' }],
          need_permission: true,
          id: '130',
          name: 'role_creation',
          order: 130,
          parentId: 'role_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'role_edition' }],
          need_permission: true,
          id: '131',
          dataControl: true,
          name: 'role_edition',
          order: 131,
          parentId: 'role_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'role_edition_all_data' }],
          need_permission: true,
          id: '132',
          name: 'role_edition_all_data',
          order: 132,
          parentId: 'role_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'role_delete' }],
          need_permission: true,
          id: '133',
          dataControl: true,
          name: 'role_delete',
          order: 133,
          parentId: 'role_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'role_delete_all_data' }],
          need_permission: true,
          id: '134',
          name: 'role_delete_all_data',
          order: 134,
          parentId: 'role_delete',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '系统设置模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'system_settings_menu', path: '/settings' }
          ],
          need_permission: true,
          id: '135',
          isMenu: true,
          name: 'system_settings_menu',
          order: 135,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '系统设置模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'system_settings', path: '/settings' }
          ],
          need_permission: true,
          id: '136',
          name: 'system_settings',
          order: 136,
          parentId: 'system_management',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'system_settings_modification' }],
          need_permission: true,
          id: '137',
          name: 'system_settings_modification',
          order: 137,
          parentId: 'system_settings',
          status: 'enable',
          type: 'write'
        },
        {
          description: '首页图表',
          resources: [{ type: 'button', code: 'chart' }],
          need_permission: true,
          id: '138',
          dataControl: true,
          name: 'chart',
          order: 138,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '首页图表',
          resources: [{ type: 'button', code: 'chart_all_data' }],
          need_permission: true,
          id: '139',
          name: 'chart_all_data',
          order: 139,
          parentId: 'chart',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据传输模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'data_transmission', path: '/dataFlows' },
            { type: 'page', code: 'data_transmission', path: '/job' }
          ],
          need_permission: true,
          id: '14',
          name: 'data_transmission',
          order: 14,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '字典模板',
          resources: [
            { type: 'page', code: 'dictionary_menu', path: '/dictionary' }
          ],
          need_permission: true,
          id: '140',
          isMenu: true,
          name: 'dictionary_menu',
          order: 140,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '字典模板',
          resources: [{ type: 'button', code: 'dictionary' }],
          need_permission: true,
          id: '141',
          name: 'dictionary',
          order: 141,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '字典模板',
          resources: [{ type: 'button', code: 'dictionary_all_data' }],
          need_permission: true,
          id: '142',
          name: 'dictionary_all_data',
          order: 142,
          parentId: 'data_government',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据同步模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'Data_SYNC_menu', path: '/dataFlows' }
          ],
          need_permission: true,
          id: '15',
          dataControl: true,
          isMenu: true,
          name: 'Data_SYNC_menu',
          order: 15,
          parentId: 'data_transmission',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据同步模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'Data_SYNC', path: '/dataFlows' },
            { type: 'page', code: 'Data_SYNC', path: '/job' }
          ],
          need_permission: true,
          id: '16',
          dataControl: true,
          name: 'Data_SYNC',
          order: 16,
          parentId: 'data_transmission',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'Data_SYNC_all_data' }],
          need_permission: true,
          id: '17',
          name: 'Data_SYNC_all_data',
          order: 17,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '对同步任务分类的新建、编辑、删除操作',
          resources: [{ type: 'button', code: 'SYNC_category_management' }],
          need_permission: true,
          id: '18',
          name: 'SYNC_category_management',
          order: 18,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '分类对同步任务的应用操作',
          resources: [{ type: 'button', code: 'SYNC_category_application' }],
          need_permission: true,
          id: '19',
          name: 'SYNC_category_application',
          order: 19,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '系统消息通知设置功能',
          resources: [{ type: 'button', code: 'home_notice_settings' }],
          need_permission: true,
          id: '2',
          name: 'notice_settings',
          order: 2,
          parentId: 'system_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '创建新的同步任务功能',
          resources: [{ type: 'button', code: 'SYNC_job_creation' }],
          need_permission: true,
          id: '20',
          name: 'SYNC_job_creation',
          order: 20,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '删除同步任务功能',
          resources: [{ type: 'button', code: 'SYNC_job_delete' }],
          need_permission: true,
          id: '21',
          dataControl: true,
          name: 'SYNC_job_delete',
          order: 21,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'SYNC_job_delete_all_data' }],
          need_permission: true,
          id: '22',
          name: 'SYNC_job_delete_all_data',
          order: 22,
          parentId: 'SYNC_job_delete',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '编辑同步任务功能',
          resources: [{ type: 'button', code: 'SYNC_job_edition' }],
          need_permission: true,
          id: '23',
          dataControl: true,
          name: 'SYNC_job_edition',
          order: 23,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'SYNC_job_edition_all_data' }],
          need_permission: true,
          id: '24',
          name: 'SYNC_job_edition_all_data',
          order: 24,
          parentId: 'SYNC_job_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '对同步任务的启动、停止、重置等操作',
          resources: [{ type: 'button', code: 'SYNC_job_operation' }],
          need_permission: true,
          id: '25',
          dataControl: true,
          name: 'SYNC_job_operation',
          order: 25,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'SYNC_job_operation_all_data' }],
          need_permission: true,
          id: '26',
          name: 'SYNC_job_operation_all_data',
          order: 26,
          parentId: 'SYNC_job_operation',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '同步任务导入功能',
          resources: [{ type: 'button', code: 'SYNC_job_import' }],
          need_permission: true,
          id: '27',
          name: 'SYNC_job_import',
          order: 27,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '同步任务导出功能',
          resources: [{ type: 'button', code: 'SYNC_job_export' }],
          need_permission: true,
          id: '28',
          name: 'SYNC_job_export',
          order: 28,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '全局函数的应用和管理',
          resources: [{ type: 'button', code: 'SYNC_Function_management' }],
          need_permission: true,
          id: '29',
          name: 'SYNC_Function_management',
          order: 29,
          parentId: 'Data_SYNC',
          status: 'enable',
          type: 'write'
        },
        {
          description: '数据源模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'datasource_menu', path: '/connections' }
          ],
          need_permission: true,
          id: '3',
          isMenu: true,
          name: 'datasource_menu',
          order: 3,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据校验模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'Data_verify_menu',
              path: '/dataVerification'
            }
          ],
          need_permission: true,
          id: '30',
          dataControl: true,
          isMenu: true,
          name: 'Data_verify_menu',
          order: 30,
          parentId: 'data_transmission',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据校验模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'Data_verify', path: '/dataVerification' }
          ],
          need_permission: true,
          id: '31',
          dataControl: true,
          name: 'Data_verify',
          order: 31,
          parentId: 'data_transmission',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'Data_verify_all_data' }],
          need_permission: true,
          id: '32',
          name: 'Data_verify_all_data',
          order: 32,
          parentId: 'Data_verify',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '创建校验任务功能',
          resources: [{ type: 'button', code: 'verify_job_creation' }],
          need_permission: true,
          id: '33',
          name: 'verify_job_creation',
          order: 33,
          parentId: 'Data_verify',
          status: 'enable',
          type: 'write'
        },
        {
          description: '编辑校验任务功能',
          resources: [{ type: 'button', code: 'verify_job_edition' }],
          need_permission: true,
          id: '34',
          dataControl: true,
          name: 'verify_job_edition',
          order: 34,
          parentId: 'Data_verify',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'verify_job_edition_all_data' }],
          need_permission: true,
          id: '35',
          name: 'verify_job_edition_all_data',
          order: 35,
          parentId: 'verify_job_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '删除校验任务功能',
          resources: [{ type: 'button', code: 'verify_job_delete' }],
          need_permission: true,
          id: '36',
          dataControl: true,
          name: 'verify_job_delete',
          order: 36,
          parentId: 'Data_verify',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'verify_job_delete_all_data' }],
          need_permission: true,
          id: '37',
          name: 'verify_job_delete_all_data',
          order: 37,
          parentId: 'verify_job_delete',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据治理模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'data_government_menu' }],
          need_permission: true,
          id: '38',
          isMenu: true,
          name: 'data_government_menu',
          order: 38,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据治理模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'data_government' }],
          need_permission: true,
          id: '39',
          name: 'data_government',
          order: 39,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据源模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'datasource', path: '/connections' }
          ],
          need_permission: true,
          id: '4',
          dataControl: true,
          name: 'datasource',
          order: 4,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据目录模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'data_catalog_menu',
              path: '/metadataDefinition'
            }
          ],
          need_permission: true,
          id: '40',
          dataControl: true,
          isMenu: true,
          name: 'data_catalog_menu',
          order: 40,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据目录模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'data_catalog', path: '/metadataDefinition' }
          ],
          need_permission: true,
          id: '41',
          dataControl: true,
          name: 'data_catalog',
          order: 41,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'data_catalog_all_data' }],
          need_permission: true,
          id: '42',
          name: 'data_catalog_all_data',
          order: 42,
          parentId: 'data_catalog',
          status: 'enable',
          type: 'read'
        },
        {
          description: '对元数据分类的新建、编辑、删除操作',
          resources: [
            { type: 'button', code: 'data_catalog_category_management' }
          ],
          need_permission: true,
          id: '43',
          name: 'data_catalog_category_management',
          order: 43,
          parentId: 'data_catalog',
          status: 'enable',
          type: 'write'
        },
        {
          description: '分类对元数据的应用操作',
          resources: [
            { type: 'button', code: 'data_catalog_category_application' }
          ],
          need_permission: true,
          id: '44',
          name: 'data_catalog_category_application',
          order: 44,
          parentId: 'data_catalog',
          status: 'enable',
          type: 'write'
        },
        {
          description: '对元数据的编辑功能',
          resources: [
            {
              type: 'page',
              code: 'data_catalog_edition',
              path: '/metadataInstances'
            }
          ],
          need_permission: true,
          id: '45',
          dataControl: true,
          name: 'data_catalog_edition',
          order: 45,
          parentId: 'data_catalog',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [
            { type: 'button', code: 'data_catalog_edition_all_data' }
          ],
          need_permission: true,
          id: '46',
          name: 'data_catalog_edition_all_data',
          order: 46,
          parentId: 'data_catalog_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '元数据删除',
          resources: [{ type: 'button', code: 'meta_data_deleting' }],
          need_permission: true,
          id: '47',
          dataControl: true,
          name: 'meta_data_deleting',
          order: 47,
          parentId: 'data_catalog',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'meta_data_deleting_all_data' }],
          need_permission: true,
          id: '48',
          name: 'meta_data_deleting_all_data',
          order: 48,
          parentId: 'meta_data_deleting',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '创建新模型的功能',
          resources: [{ type: 'button', code: 'new_model_creation' }],
          need_permission: true,
          id: '49',
          name: 'new_model_creation',
          order: 49,
          parentId: 'data_catalog',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'datasource_all_data' }],
          need_permission: true,
          id: '5',
          name: 'datasource_all_data',
          order: 5,
          parentId: 'datasource',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据质量模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'data_quality_menu', path: '/dataQuality' }
          ],
          need_permission: true,
          id: '50',
          dataControl: true,
          isMenu: true,
          name: 'data_quality_menu',
          order: 50,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据质量模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'data_quality', path: '/dataQuality' }
          ],
          need_permission: true,
          id: '51',
          dataControl: true,
          name: 'data_quality',
          order: 51,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'data_quality_all_data' }],
          need_permission: true,
          id: '52',
          name: 'data_quality_all_data',
          order: 52,
          parentId: 'data_quality',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'data_quality_edition' }],
          need_permission: true,
          id: '53',
          dataControl: true,
          name: 'data_quality_edition',
          order: 53,
          parentId: 'data_quality',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [
            { type: 'button', code: 'data_quality_edition_all_data' }
          ],
          need_permission: true,
          id: '54',
          name: 'data_quality_edition_all_data',
          order: 54,
          parentId: 'data_quality_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据规则模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'data_rules_menu', path: '/dataRules' }
          ],
          need_permission: true,
          id: '55',
          dataControl: true,
          isMenu: true,
          name: 'data_rules_menu',
          order: 55,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据规则模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'page', code: 'data_rules', path: '/dataRules' }],
          need_permission: true,
          id: '56',
          dataControl: true,
          name: 'data_rules',
          order: 56,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'data_rules_all_data' }],
          need_permission: true,
          id: '57',
          name: 'data_rules_all_data',
          order: 57,
          parentId: 'data_rules',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'data_rule_management' }],
          need_permission: true,
          id: '58',
          dataControl: true,
          name: 'data_rule_management',
          order: 58,
          parentId: 'data_rules',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [
            { type: 'button', code: 'data_rule_management_all_data' }
          ],
          need_permission: true,
          id: '59',
          name: 'data_rule_management_all_data',
          order: 59,
          parentId: 'data_rule_management',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '对数据源分类的新建、编辑、删除操作',
          resources: [
            { type: 'button', code: 'datasource_catalog_management' }
          ],
          need_permission: true,
          id: '6',
          name: 'datasource_category_management',
          order: 6,
          parentId: 'datasource',
          status: 'enable',
          type: 'write'
        },
        {
          description: '数据生命周期模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'time_to_live_menu', path: '/ttl' }
          ],
          need_permission: true,
          id: '60',
          dataControl: true,
          isMenu: true,
          name: 'time_to_live_menu',
          order: 60,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据生命周期模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'page', code: 'time_to_live', path: '/ttl' }],
          need_permission: true,
          id: '61',
          dataControl: true,
          name: 'time_to_live',
          order: 61,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'time_to_live_all_data' }],
          need_permission: true,
          id: '62',
          name: 'time_to_live_all_data',
          order: 62,
          parentId: 'time_to_live',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'time_to_live_management' }],
          need_permission: true,
          id: '63',
          dataControl: true,
          name: 'time_to_live_management',
          order: 63,
          parentId: 'time_to_live',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [
            { type: 'button', code: 'time_to_live_management_all_data' }
          ],
          need_permission: true,
          id: '64',
          name: 'time_to_live_management_all_data',
          order: 64,
          parentId: 'time_to_live_management',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '数据地图模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'data_lineage_menu', path: '/dataMap' }
          ],
          need_permission: true,
          id: '65',
          isMenu: true,
          name: 'data_lineage_menu',
          order: 65,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据地图模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'page', code: 'data_lineage', path: '/dataMap' }],
          need_permission: true,
          id: '66',
          name: 'data_lineage',
          order: 66,
          parentId: 'data_government',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据发布模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'data_publish_menu' }],
          need_permission: true,
          id: '67',
          isMenu: true,
          name: 'data_publish_menu',
          order: 67,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '数据发布模块，关闭此模块及相关功能不可见',
          resources: [{ type: 'button', code: 'data_publish' }],
          need_permission: true,
          id: '68',
          name: 'data_publish',
          order: 68,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API发布模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_management_menu', path: '/modules' }
          ],
          need_permission: true,
          id: '69',
          dataControl: true,
          isMenu: true,
          name: 'API_management_menu',
          order: 69,
          parentId: '',
          status: 'enable',
          type: 'read'
        },
        {
          description: '分类对数据源的应用操作',
          resources: [
            { type: 'button', code: 'datasource_category_application' }
          ],
          need_permission: true,
          id: '7',
          name: 'datasource_category_application',
          order: 7,
          parentId: 'datasource',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API发布模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_management', path: '/modules' }
          ],
          need_permission: true,
          id: '70',
          dataControl: true,
          name: 'API_management',
          order: 70,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_management_all_data' }],
          need_permission: true,
          id: '71',
          name: 'API_management_all_data',
          order: 71,
          parentId: 'API_management',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_category_application' }],
          need_permission: true,
          id: '72',
          name: 'API_category_application',
          order: 72,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_category_management' }],
          need_permission: true,
          id: '73',
          name: 'API_category_management',
          order: 73,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_creation' }],
          need_permission: true,
          id: '74',
          name: 'API_creation',
          order: 74,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_delete' }],
          need_permission: true,
          id: '75',
          dataControl: true,
          name: 'API_delete',
          order: 75,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_delete_all_data' }],
          need_permission: true,
          id: '76',
          name: 'API_delete_all_data',
          order: 76,
          parentId: 'API_delete',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_edition' }],
          need_permission: true,
          id: '77',
          dataControl: true,
          name: 'API_edition',
          order: 77,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_edition_all_data' }],
          need_permission: true,
          id: '78',
          name: 'API_edition_all_data',
          order: 78,
          parentId: 'API_edition',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_publish' }],
          need_permission: true,
          id: '79',
          dataControl: true,
          name: 'API_publish',
          order: 79,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '创建新的数据源功能',
          resources: [
            { type: 'page', code: 'datasource_creation', path: '/connection' }
          ],
          need_permission: true,
          id: '8',
          name: 'datasource_creation',
          order: 8,
          parentId: 'datasource',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_publish_all_data' }],
          need_permission: true,
          id: '80',
          name: 'API_publish_all_data',
          order: 80,
          parentId: 'API_publish',
          status: 'enable',
          type: 'readAllData'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_import' }],
          need_permission: true,
          id: '81',
          name: 'API_import',
          order: 81,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_export' }],
          need_permission: true,
          id: '82',
          name: 'API_export',
          order: 82,
          parentId: 'API_management',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API数据浏览模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'API_data_explorer_menu',
              path: '/dataExplorer'
            }
          ],
          need_permission: true,
          id: '83',
          isMenu: true,
          name: 'API_data_explorer_menu',
          order: 83,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API数据浏览模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_data_explorer', path: '/dataExplorer' }
          ],
          need_permission: true,
          id: '84',
          name: 'API_data_explorer',
          order: 84,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API数据预览导出',
          resources: [{ type: 'button', code: 'API_data_explorer_export' }],
          need_permission: true,
          id: '85',
          name: 'API_data_explorer_export',
          order: 85,
          parentId: 'API_data_explorer',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API数据浏览删除',
          resources: [{ type: 'button', code: 'API_data_explorer_deleting' }],
          need_permission: true,
          id: '86',
          name: 'API_data_explorer_deleting',
          order: 86,
          parentId: 'API_data_explorer',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API数据浏览删除',
          resources: [{ type: 'button', code: 'API_data_time_zone_editing' }],
          need_permission: true,
          id: '87',
          name: 'API_data_time_zone_editing',
          order: 87,
          parentId: 'API_data_explorer',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API数据浏览删除',
          resources: [{ type: 'button', code: 'API_data_creation' }],
          need_permission: true,
          id: '88',
          name: 'API_data_creation',
          order: 88,
          parentId: 'API_data_explorer',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API数据浏览删除',
          resources: [{ type: 'button', code: 'API_data_download' }],
          need_permission: true,
          id: '89',
          name: 'API_data_download',
          order: 89,
          parentId: 'API_data_explorer',
          status: 'enable',
          type: 'write'
        },
        {
          description: '删除数据源功能',
          resources: [{ type: 'button', code: 'datasource_delete' }],
          need_permission: true,
          id: '9',
          dataControl: true,
          name: 'datasource_delete',
          order: 9,
          parentId: 'datasource',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API数据浏览加标签',
          resources: [{ type: 'button', code: 'API_data_explorer_tagging' }],
          need_permission: true,
          id: '90',
          name: 'API_data_explorer_tagging',
          order: 90,
          parentId: 'API_data_explorer',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API文档测试模块，关闭此模块及相关功能不可见',
          resources: [
            {
              type: 'page',
              code: 'API_doc_&_test_menu',
              path: '/apiDocAndTest'
            }
          ],
          need_permission: true,
          id: '91',
          isMenu: true,
          name: 'API_doc_test_menu',
          order: 91,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API文档测试模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_doc_&_test', path: '/apiDocAndTest' }
          ],
          need_permission: true,
          id: '92',
          name: 'API_doc_test',
          order: 92,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API文档测试批量导出',
          resources: [{ type: 'page', code: 'API_doc_&_test_export' }],
          need_permission: true,
          id: '93',
          name: 'API_doc_test_export',
          order: 93,
          parentId: 'API_doc_test',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API统计分析模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_stats_menu', path: '/apiAnalysis' }
          ],
          need_permission: true,
          id: '94',
          isMenu: true,
          name: 'API_stats_menu',
          order: 94,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API统计分析模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_stats', path: '/apiAnalysis' }
          ],
          need_permission: true,
          id: '95',
          name: 'API_stats',
          order: 95,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API客户端模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_clients_menu', path: '/applications' }
          ],
          need_permission: true,
          id: '96',
          isMenu: true,
          name: 'API_clients_menu',
          order: 96,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: 'API客户端模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_clients', path: '/applications' }
          ],
          need_permission: true,
          id: '97',
          name: 'API_clients',
          order: 97,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        },
        {
          description: '',
          resources: [{ type: 'button', code: 'API_clients_amangement' }],
          need_permission: true,
          id: '98',
          name: 'API_clients_amangement',
          order: 98,
          parentId: 'API_clients',
          status: 'enable',
          type: 'write'
        },
        {
          description: 'API服务器模块，关闭此模块及相关功能不可见',
          resources: [
            { type: 'page', code: 'API_server_menu', path: '/apiServers' }
          ],
          need_permission: true,
          id: '99',
          isMenu: true,
          name: 'API_server_menu',
          order: 99,
          parentId: 'data_publish',
          status: 'enable',
          type: 'read'
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DatabaseTypes': {
    data: [
      {
        id: '6093eebec51425290fec3d22',
        type: 'mysql',
        name: 'MySql',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.849Z',
        createTime: '2021-05-06T13:27:26.849Z'
      },
      {
        id: '6093eebec51425290fec3d23',
        type: 'oracle',
        name: 'Oracle',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.864Z',
        createTime: '2021-05-06T13:27:26.864Z'
      },
      {
        id: '6093eebec51425290fec3d24',
        type: 'mongodb',
        name: 'MongoDB',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.871Z',
        createTime: '2021-05-06T13:27:26.871Z'
      },
      {
        id: '6093eebec51425290fec3d25',
        type: 'sqlserver',
        name: 'SQL Server',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.877Z',
        createTime: '2021-05-06T13:27:26.877Z'
      },
      {
        id: '6093eebec51425290fec3d26',
        type: 'sybase ase',
        name: 'Sybase ASE',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.883Z',
        createTime: '2021-05-06T13:27:26.883Z'
      },
      {
        id: '6093eebec51425290fec3d27',
        type: 'gridfs',
        name: 'GridFS',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.890Z',
        createTime: '2021-05-06T13:27:26.890Z'
      },
      {
        id: '6093eebec51425290fec3d28',
        type: 'file',
        name: 'File(s)',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow', 'gridfs', 'file'],
        last_updated: '2021-05-06T13:27:26.896Z',
        createTime: '2021-05-06T13:27:26.896Z'
      },
      {
        id: '6093eebec51425290fec3d29',
        type: 'rest api',
        name: 'REST API',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.902Z',
        createTime: '2021-05-06T13:27:26.902Z'
      },
      {
        id: '6093eebec51425290fec3d2a',
        type: 'udp',
        name: 'Udp',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.910Z',
        createTime: '2021-05-06T13:27:26.910Z'
      },
      {
        id: '6093eebec51425290fec3d2b',
        type: 'dummy db',
        name: 'Dummy DB',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.922Z',
        createTime: '2021-05-06T13:27:26.922Z'
      },
      {
        id: '6093eebec51425290fec3d2c',
        type: 'gbase-8s',
        name: 'GBase 8s',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.928Z',
        createTime: '2021-05-06T13:27:26.928Z'
      },
      {
        id: '6093eebec51425290fec3d2d',
        type: 'custom_connection',
        name: 'Custom Connection',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.935Z',
        createTime: '2021-05-06T13:27:26.935Z'
      },
      {
        id: '6093eebec51425290fec3d2e',
        type: 'db2',
        name: 'IBM Db2',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.941Z',
        createTime: '2021-05-06T13:27:26.941Z'
      },
      {
        id: '6093eebec51425290fec3d2f',
        type: 'gaussdb200',
        name: 'GaussDB200',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.948Z',
        createTime: '2021-05-06T13:27:26.948Z'
      },
      {
        id: '6093eebec51425290fec3d30',
        type: 'postgres',
        name: 'PostgreSQL',
        buildProfiles: null,
        supportTargetDatabaseType: [
          'dummy db',
          'bitsflow',
          'mongodb',
          'oracle',
          'mysql',
          'sqlserver',
          'udp',
          'sybase ase',
          'gbase-8s',
          'db2',
          'gaussdb200',
          'postgres',
          'file',
          'elasticsearch',
          'mem_cache',
          'custom_connection'
        ],
        last_updated: '2021-05-06T13:27:26.954Z',
        createTime: '2021-05-06T13:27:26.954Z'
      },
      {
        id: '6093eebec51425290fec3d31',
        type: 'elasticsearch',
        name: 'Elasticsearch',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.960Z',
        createTime: '2021-05-06T13:27:26.960Z'
      },
      {
        id: '6093eebec51425290fec3d32',
        type: 'mem_cache',
        name: 'Memory Cache',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.966Z',
        createTime: '2021-05-06T13:27:26.966Z'
      },
      {
        id: '6093eebec51425290fec3d33',
        type: 'log_collect',
        name: 'Log Collect',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.972Z',
        createTime: '2021-05-06T13:27:26.972Z'
      },
      {
        id: '6093eebec51425290fec3d34',
        type: 'redis',
        name: 'Redis',
        buildProfiles: null,
        supportTargetDatabaseType: ['dummy db', 'bitsflow'],
        last_updated: '2021-05-06T13:27:26.978Z',
        createTime: '2021-05-06T13:27:26.978Z'
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/Connections/count': { data: { count: 232 }, code: 'ok', msg: 'ok' },
  '/api/Workers/availableAgent': {
    data: {
      result: [
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172519,
          worker_type: 'connector',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        },
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172520,
          worker_type: 'transformer',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/Connections/:id/customQuery': { code: 'ok', msg: 'ok' },
  '/api/tcm/agent/regionZone': { code: 'ok', msg: 'ok' },
  '/api/tcm/product/vip': { code: 'ok', msg: 'ok' },
  '/api/Connections/:id/copy': {
    code: 'ok',
    msg: 'ok',
    data: {
      result: {}
    }
  },
  '/api/Connections/:id': {
    code: 'ok',
    msg: 'ok'
  },
  '/api/Workers/:id/availableAgent': {
    data: {
      result: [
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172519,
          worker_type: 'connector',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        },
        {
          process_id: '1d5bc63c-94da-4d52-87a3-b6ef49dec278',
          ping_time: 1620390172520,
          worker_type: 'transformer',
          version: 'v1.19.0-216-g54d4110e9',
          hostname: 'tapdaas-test-tapdaas-84b6db7bd6-rgmg2'
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/users/self': {
    data: {
      account_status: 1,
      accesscode: '5033fb0b9245df807b56e068a66ec639',
      username: '小瓶套',
      email: '60718c178fbae2c47bc294b3@custom.com',
      emailVerified: true,
      id: '6072c1cbbf43e90010570f3c',
      userId: '60718c178fbae2c47bc294b3',
      customId: '60718c178fbae2c47bc294b3',
      isPrimary: '0',
      role: 0,
      user_id: '604f4b7ce1ca905fa754520c',
      isCompleteGuide: true,
      last_updated: '2021-04-13T13:46:24.922Z',
      createTime: '2021-04-11T09:30:51.937Z',
      roleMappings: [
        {
          id: '6072c1cbbf43e90010570f3e',
          principalType: 'USER',
          principalId: '6072c1cbbf43e90010570f3c',
          roleId: '5cda998c39a8c094a56811cf',
          role: {
            description: 'default role for cloud users',
            name: 'cloud default',
            register_user_default: true,
            user_id: '604f4b7ce1ca905fa754520c',
            id: '5cda998c39a8c094a56811cf',
            modified: '2021-05-08T03:25:49.846Z',
            created: '2021-05-08T03:25:49.846Z'
          }
        },
        {
          id: '6072c1cbbf43e90010570f3f',
          principalType: 'USER',
          principalId: '6072c1cbbf43e90010570f3c',
          roleId: '5d31ae1ab953565ded04badd',
          role: {
            created: '2021-03-15T11:56:47.991Z',
            description: '新注册用户的默认角色',
            modified: '2021-03-15T11:56:47.991Z',
            name: '新用户默认角色',
            register_user_default: true,
            user_id: '604f4b7ce1ca905fa754520c',
            id: '5d31ae1ab953565ded04badd'
          }
        }
      ]
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/clusterStates': {
    code: 'ok',
    data: []
  },
  '/api/DataFlows/chart': {
    data: {
      chart1: {
        totalDataFlows: 0,
        'statusCount|4': [
          { '_id|+1': ['draft', 'error', 'paused', 'running'], count: 0 }
        ]
      },
      chart2: [
        {
          _id: '',
          totalInput: 0,
          totalOutput: 0,
          totalInputDataSize: 0,
          totalOutputDataSize: 0,
          totalInsert: 0,
          totalInsertSize: 0,
          totalUpdate: 0,
          totalUpdateSize: 0,
          totalDelete: 0,
          totalDeleteSize: 0
        }
      ],
      chart3: [],
      chart4: { initializing: 0, initialized: 0, cdc: 0, Lag: 0 },
      chart5: {
        totalDataFlows: 0,
        'statusCount|4': [
          { '_id|+1': ['draft', 'error', 'paused', 'running'], count: 0 }
        ]
      },
      chart6: { initializing: 0, initialized: 0, cdc: 0, Lag: 0 },
      chart7: { total: 0, passed: 0, countDiff: 0, valueDiff: 0, error: 0 }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/count': { data: { count: 41 }, code: 'ok', msg: 'ok' },
  '/api/DataFlows': {
    data: [
      {
        createTime: '2021-04-28T11:10:57.691Z',
        last_updated: '2021-04-28T13:03:49.326Z',
        id: '608942c1c66ab700108de57f',
        name: 'sudu 8',
        status: 'error',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '860486ba-a620-44e8-82a4-dc98b62778ec',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['76dfca82-f8d1-4909-b6e4-d341fb310bb2'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: 'cdc'
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
            inputLanes: ['860486ba-a620-44e8-82a4-dc98b62778ec'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'ff013_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'sudu 8',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '',
        startTime: '2021-04-28T11:11:05.961Z',
        stats: {
          input: { rows: 4990000, dataSize: 239520000 },
          output: { rows: 4990000, dataSize: 239520000 },
          insert: { rows: 4990000, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 662899,
          transTimeAvg: 0,
          replicationLag: 7872,
          stagesMetrics: [
            {
              stageId: '860486ba-a620-44e8-82a4-dc98b62778ec',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 4990000, dataSize: 239520000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 7872,
              status: 'cdc'
            },
            {
              stageId: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
              input: { rows: 4990000, dataSize: 239520000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 4990000, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 662899,
              transTimeAvg: 0,
              replicationLag: 7872,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {}
      },
      {
        createTime: '2021-04-28T11:03:03.904Z',
        last_updated: '2021-04-28T11:03:13.765Z',
        id: '608940e76ea5330010a5e00e',
        name: 'sudu 7',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'dc42e554-94a8-4bbf-8a57-d85fa65e7254',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['8ea8f280-cb17-4fb4-9f0d-b02117a8451e'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '8ea8f280-cb17-4fb4-9f0d-b02117a8451e',
            inputLanes: ['dc42e554-94a8-4bbf-8a57-d85fa65e7254'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: '',
            table_suffix: 'yy',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'sudu 7',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 10000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T11:03:09.016Z',
        stats: {
          input: { rows: 3320000, dataSize: 159360000 },
          output: { rows: 3320000, dataSize: 159360000 },
          insert: { rows: 2380000, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 3365713,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: 'dc42e554-94a8-4bbf-8a57-d85fa65e7254',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 3320000, dataSize: 159360000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '8ea8f280-cb17-4fb4-9f0d-b02117a8451e',
              input: { rows: 3320000, dataSize: 159360000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 2380000, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 3365713,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-28T10:55:15.595Z',
        last_updated: '2021-04-28T10:55:22.256Z',
        id: '60893f13e7dcda00109f3d26',
        name: '速度测试 5',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '019b4d1a-df66-46c6-afea-d4a090d52a85',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['5d242c4f-4561-449d-8c99-c9618e5729ef'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '5d242c4f-4561-449d-8c99-c9618e5729ef',
            inputLanes: ['019b4d1a-df66-46c6-afea-d4a090d52a85'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'xx05_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: '速度测试 5',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 1000,
          transformerConcurrency: 16,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T10:55:18.753Z',
        stats: {
          input: { rows: 1540000, dataSize: 73920000 },
          output: { rows: 1540000, dataSize: 73920000 },
          insert: { rows: 1373000, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 3445624,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '019b4d1a-df66-46c6-afea-d4a090d52a85',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 1540000, dataSize: 73920000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '5d242c4f-4561-449d-8c99-c9618e5729ef',
              input: { rows: 1540000, dataSize: 73920000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 1373000, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 3445624,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-28T10:36:21.304Z',
        last_updated: '2021-04-28T10:39:11.343Z',
        id: '60893aa59755a900103ef522',
        name: 'one by one 测试',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'e16d897d-3714-4a7c-8c5b-f6cd20b46491',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['089774cf-f537-4949-a1bd-e5f6ce607d2f'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: 'cdc'
          },
          {
            connectionId: '6084e6785806600010c813d0',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '089774cf-f537-4949-a1bd-e5f6ce607d2f',
            inputLanes: ['e16d897d-3714-4a7c-8c5b-f6cd20b46491'],
            joinTables: [],
            name: 'DRS-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['ff5'], type: 'table' }],
            table_prefix: 'ff00_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'one by one 测试',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T10:39:09.526Z',
        stats: {
          input: { rows: 4, dataSize: 192 },
          output: { rows: 4, dataSize: 192 },
          insert: { rows: 4, dataSize: 192 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 1576,
          transTimeAvg: 0,
          replicationLag: 9788,
          stagesMetrics: [
            {
              stageId: 'e16d897d-3714-4a7c-8c5b-f6cd20b46491',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 4, dataSize: 192 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 9788,
              status: 'cdc'
            },
            {
              stageId: '089774cf-f537-4949-a1bd-e5f6ce607d2f',
              input: { rows: 4, dataSize: 192 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 4, dataSize: 192 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 1576,
              transTimeAvg: 0,
              replicationLag: 9788,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-28T09:47:53.000Z',
        last_updated: '2021-04-28T10:59:05.241Z',
        id: '60892f499755a900103e91b8',
        name: '速度测试6',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'c053c6d1-0a4c-42ce-bd11-f88ac3459caf',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['f2d88f0b-85de-4818-9f9d-5399a62ae85c'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'f2d88f0b-85de-4818-9f9d-5399a62ae85c',
            inputLanes: ['c053c6d1-0a4c-42ce-bd11-f88ac3459caf'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'ff010_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql'
          }
        ],
        setting: {
          name: '速度测试6',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T10:25:12.350Z',
        stats: {},
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-28T09:33:35.714Z',
        last_updated: '2021-04-28T09:46:05.660Z',
        id: '60892bef9755a900103e813b',
        name: '速度3',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '264f7b2f-c65f-405a-babf-d70fb7a054ba',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['fe1ebe3e-9fa8-4c9e-b06a-bbe969fde118'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: 'cdc'
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'fe1ebe3e-9fa8-4c9e-b06a-bbe969fde118',
            inputLanes: ['264f7b2f-c65f-405a-babf-d70fb7a054ba'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'speed3_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: '速度3',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T09:38:53.017Z',
        stats: {
          input: { rows: 4990000, dataSize: 239520000 },
          output: { rows: 4990000, dataSize: 239520000 },
          insert: { rows: 4990000, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 647037,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '264f7b2f-c65f-405a-babf-d70fb7a054ba',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 4990000, dataSize: 239520000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: 'cdc'
            },
            {
              stageId: 'fe1ebe3e-9fa8-4c9e-b06a-bbe969fde118',
              input: { rows: 4990000, dataSize: 239520000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 4990000, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 647037,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-28T09:19:13.526Z',
        last_updated: '2021-04-28T09:19:39.639Z',
        id: '6089289196175c00100a2047',
        name: '速度提升2',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '4d27f20d-2337-4304-ab83-30836828ccb8',
            inputLanes: [],
            joinTables: [],
            name: 'local_179',
            outputLanes: ['4f5981cf-9b34-42eb-a690-12ace3e3ec32'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '4f5981cf-9b34-42eb-a690-12ace3e3ec32',
            inputLanes: ['4d27f20d-2337-4304-ab83-30836828ccb8'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'speed2_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: '速度提升2',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '60803202ddc0f40343b87e35',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 5000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T09:19:36.189Z',
        stats: {
          input: { rows: 3740000, dataSize: 179520000 },
          output: { rows: 3740000, dataSize: 179520000 },
          insert: { rows: 3280000, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 6246808,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '4d27f20d-2337-4304-ab83-30836828ccb8',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 3740000, dataSize: 179520000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '4f5981cf-9b34-42eb-a690-12ace3e3ec32',
              input: { rows: 3740000, dataSize: 179520000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 3280000, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 6246808,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-28T09:10:38.775Z',
        last_updated: '2021-04-28T09:10:54.455Z',
        id: '6089268e04163d0010242d6f',
        name: '加速加速',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '050e7d5f-5a74-4a3f-a8a2-84d3e9a154e2',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['ec6f7f23-1f6c-4feb-92ab-686f03eed67b'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'ec6f7f23-1f6c-4feb-92ab-686f03eed67b',
            inputLanes: ['050e7d5f-5a74-4a3f-a8a2-84d3e9a154e2'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'speed_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: '加速加速',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 100,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-28T09:10:51.308Z',
        stats: {
          input: { rows: 425100, dataSize: 20404800 },
          output: { rows: 425100, dataSize: 20404800 },
          insert: { rows: 416700, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 3631955,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '050e7d5f-5a74-4a3f-a8a2-84d3e9a154e2',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 425100, dataSize: 20404800 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: 'ec6f7f23-1f6c-4feb-92ab-686f03eed67b',
              input: { rows: 425100, dataSize: 20404800 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 416700, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 3631955,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T17:52:40.000Z',
        last_updated: '2021-04-28T06:13:31.030Z',
        id: '60884f6804163d0010220216',
        name: 'IOIOIO',
        status: 'error',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '181b6567-0d1b-4cfa-83da-c72246188555',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['a607d60d-8717-4957-a1d4-8de90cd00a3b'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: 'initializing'
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'a607d60d-8717-4957-a1d4-8de90cd00a3b',
            inputLanes: ['181b6567-0d1b-4cfa-83da-c72246188555'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'uiui_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'IOIOIO',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 100,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '',
        startTime: '2021-04-28T05:12:44.378Z',
        stats: {
          input: { rows: 73800, dataSize: 3542400 },
          output: { rows: 73800, dataSize: 3542400 },
          insert: { rows: 0, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 24686632,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '181b6567-0d1b-4cfa-83da-c72246188555',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 73800, dataSize: 3542400 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: 'initializing'
            },
            {
              stageId: 'a607d60d-8717-4957-a1d4-8de90cd00a3b',
              input: { rows: 73800, dataSize: 3542400 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 24686632,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {}
      },
      {
        createTime: '2021-04-27T16:46:11.021Z',
        last_updated: '2021-04-27T17:33:29.792Z',
        id: '60883fd304163d001021faea',
        name: 'YIYI',
        status: 'error',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '40cc8cf4-0f6c-432b-8d68-64153044dc9b',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['eb64f508-3f3d-4c38-8f3f-88b90164c700'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'eb64f508-3f3d-4c38-8f3f-88b90164c700',
            inputLanes: ['40cc8cf4-0f6c-432b-8d68-64153044dc9b'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'xxx2_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'YIYI',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 100,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '',
        startTime: '2021-04-27T17:06:58.269Z',
        stats: {
          input: { rows: 216298, dataSize: 10382304 },
          output: { rows: 216298, dataSize: 10382304 },
          insert: { rows: 169184, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 10478302,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '40cc8cf4-0f6c-432b-8d68-64153044dc9b',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 216298, dataSize: 10382304 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: 'eb64f508-3f3d-4c38-8f3f-88b90164c700',
              input: { rows: 216298, dataSize: 10382304 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 169184, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 10478302,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {}
      },
      {
        createTime: '2021-04-27T16:21:37.514Z',
        last_updated: '2021-04-27T16:23:04.435Z',
        id: '60883a1104163d001021f7cd',
        name: 'OIOIO',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '7890f083-b52d-473d-ab4c-52f9431b2656',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['f9b51b2c-6e02-4052-bed4-557acaba91b8'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '60803202ddc0f40343b87e35',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'f9b51b2c-6e02-4052-bed4-557acaba91b8',
            inputLanes: ['7890f083-b52d-473d-ab4c-52f9431b2656'],
            joinTables: [],
            name: 'CSS-Mysql-Test - (Copy)',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'iio_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'OIOIO',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 100,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T16:21:40.209Z',
        stats: {
          input: { rows: 442798, dataSize: 21254304 },
          output: { rows: 442798, dataSize: 21254304 },
          insert: { rows: 438198, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 271984,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '7890f083-b52d-473d-ab4c-52f9431b2656',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 442798, dataSize: 21254304 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: 'f9b51b2c-6e02-4052-bed4-557acaba91b8',
              input: { rows: 442798, dataSize: 21254304 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 438198, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 271984,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T16:14:49.196Z',
        last_updated: '2021-04-27T16:16:33.122Z',
        id: '6088387904163d001021f613',
        name: 'III',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'c0bdd463-2f5c-4001-ab0a-2d9c45517937',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['d0bc2633-83f5-4960-b967-5682bdd44bb1'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'd0bc2633-83f5-4960-b967-5682bdd44bb1',
            inputLanes: ['c0bdd463-2f5c-4001-ab0a-2d9c45517937'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'fff07_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'III',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 100,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T16:14:51.499Z',
        stats: {
          input: { rows: 22598, dataSize: 1084704 },
          output: { rows: 22598, dataSize: 1084704 },
          insert: { rows: 13198, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 796792,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: 'c0bdd463-2f5c-4001-ab0a-2d9c45517937',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 22598, dataSize: 1084704 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: 'd0bc2633-83f5-4960-b967-5682bdd44bb1',
              input: { rows: 22598, dataSize: 1084704 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 13198, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 796792,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T15:22:51.313Z',
        last_updated: '2021-04-27T16:13:28.596Z',
        id: '60882c4b736ee70010c95c61',
        name: 'XXD',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '77e4eed8-2262-4edc-8416-9db0ab528187',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['b0f19358-1745-4681-978c-329408b57a2b'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'b0f19358-1745-4681-978c-329408b57a2b',
            inputLanes: ['77e4eed8-2262-4edc-8416-9db0ab528187'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'fff06_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'XXD',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 5000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T16:13:25.523Z',
        stats: {
          input: { rows: 474998, dataSize: 22799904 },
          output: { rows: 474998, dataSize: 22799904 },
          insert: { rows: 0, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 0,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: 'f74e905f-5f04-477f-9b3b-37754a198ba1',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 470000, dataSize: 22560000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '1746bea4-6112-4b4a-ba1d-196fab72a248',
              input: { rows: 470000, dataSize: 22560000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '77e4eed8-2262-4edc-8416-9db0ab528187',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 474998, dataSize: 22799904 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: 'b0f19358-1745-4681-978c-329408b57a2b',
              input: { rows: 474998, dataSize: 22799904 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T15:11:19.439Z',
        last_updated: '2021-04-27T15:12:05.623Z',
        id: '60882997736ee70010c959e9',
        name: 'XXC',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6076fdae39b43007f82cf086',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'bf97fc3c-68bb-4885-8e07-d2aa704ecb4f',
            inputLanes: [],
            joinTables: [],
            name: 'CSS-Mysql-Test',
            outputLanes: ['8cb7fd1c-14a8-4ea3-8246-40bf73d76300'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '8cb7fd1c-14a8-4ea3-8246-40bf73d76300',
            inputLanes: ['bf97fc3c-68bb-4885-8e07-d2aa704ecb4f'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'fff01_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'XXC',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6076fdae39b43007f82cf086',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 5000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T15:11:22.274Z',
        stats: {
          input: { rows: 474998, dataSize: 22799904 },
          output: { rows: 474998, dataSize: 22799904 },
          insert: { rows: 0, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 0,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: 'bf97fc3c-68bb-4885-8e07-d2aa704ecb4f',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 474998, dataSize: 22799904 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '8cb7fd1c-14a8-4ea3-8246-40bf73d76300',
              input: { rows: 474998, dataSize: 22799904 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T09:28:24.472Z',
        last_updated: '2021-04-27T09:28:31.648Z',
        id: '6087d938736ee70010c92740',
        name: '88',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6084e2345806600010c7e416',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '5d1e9c17-d42f-46a5-8e5c-447e8afd9174',
            inputLanes: [],
            joinTables: [],
            name: 'DRS-SRC',
            outputLanes: ['2c5f8a60-55d6-4d59-9c49-51cd730d5e29'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '2c5f8a60-55d6-4d59-9c49-51cd730d5e29',
            inputLanes: ['5d1e9c17-d42f-46a5-8e5c-447e8afd9174'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'm18_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: '88',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6084e2345806600010c7e416',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 5000,
          transformerConcurrency: 8,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T09:28:28.136Z',
        stats: {
          input: { rows: 580000, dataSize: 27840000 },
          output: { rows: 580000, dataSize: 27840000 },
          insert: { rows: 88600, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 5175452,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '5d1e9c17-d42f-46a5-8e5c-447e8afd9174',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 580000, dataSize: 27840000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '2c5f8a60-55d6-4d59-9c49-51cd730d5e29',
              input: { rows: 580000, dataSize: 27840000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 88600, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 5175452,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T09:22:42.411Z',
        last_updated: '2021-04-27T09:28:04.457Z',
        id: '6087d7e292cd660010a87107',
        name: '8',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6084e2345806600010c7e416',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'b69c21d3-cf56-4c17-bf22-45e8eea66d25',
            inputLanes: [],
            joinTables: [],
            name: 'DRS-SRC',
            outputLanes: ['a95bd689-1cb1-4d58-bc80-3721b1fc7afc'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'a95bd689-1cb1-4d58-bc80-3721b1fc7afc',
            inputLanes: ['b69c21d3-cf56-4c17-bf22-45e8eea66d25'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'm16_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: '8',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6084e2345806600010c7e416',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 1000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T09:22:45.653Z',
        stats: {
          input: { rows: 134000, dataSize: 6432000 },
          output: { rows: 134000, dataSize: 6432000 },
          insert: { rows: 39998, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 2128903,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: 'b69c21d3-cf56-4c17-bf22-45e8eea66d25',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 134000, dataSize: 6432000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: 'a95bd689-1cb1-4d58-bc80-3721b1fc7afc',
              input: { rows: 134000, dataSize: 6432000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 39998, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 2128903,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T08:51:50.998Z',
        last_updated: '2021-04-27T09:23:31.884Z',
        id: '6087d0a692cd660010a868f2',
        name: 'fucker',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6084e2345806600010c7e416',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'd9eacadb-7e01-4254-b54f-95401005e9a1',
            inputLanes: [],
            joinTables: [],
            name: 'DRS-SRC',
            outputLanes: ['c0c129cd-6e27-46f6-8762-e2478945b3fb'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: 'c0c129cd-6e27-46f6-8762-e2478945b3fb',
            inputLanes: ['d9eacadb-7e01-4254-b54f-95401005e9a1'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'm12_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'fucker',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6084e2345806600010c7e416',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 1000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T08:51:54.449Z',
        stats: {},
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T08:40:36.708Z',
        last_updated: '2021-04-27T08:42:23.079Z',
        id: '6087ce0492cd660010a86660',
        name: 'ceshi 25000',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6084e2345806600010c7e416',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: '296193eb-6dd0-4886-8a14-622e8814c285',
            inputLanes: [],
            joinTables: [],
            name: 'DRS-SRC',
            outputLanes: ['8f31b7ef-6bde-451e-ae1b-0c7548007251'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '8f31b7ef-6bde-451e-ae1b-0c7548007251',
            inputLanes: ['296193eb-6dd0-4886-8a14-622e8814c285'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'm10_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'ceshi 25000',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6084e2345806600010c7e416',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 1000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T08:40:40.425Z',
        stats: {
          input: { rows: 102998, dataSize: 4943904 },
          output: { rows: 102998, dataSize: 4943904 },
          insert: { rows: 7998, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 440056,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: '296193eb-6dd0-4886-8a14-622e8814c285',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 102998, dataSize: 4943904 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '8f31b7ef-6bde-451e-ae1b-0c7548007251',
              input: { rows: 102998, dataSize: 4943904 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 7998, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 440056,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T08:33:32.552Z',
        last_updated: '2021-04-27T09:40:55.803Z',
        id: '6087cc5c0786e30010d4d705',
        name: 'OOO',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6084e2345806600010c7e416',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'a56d61b1-4858-4189-a797-3a7d6f491cfd',
            inputLanes: [],
            joinTables: [],
            name: 'DRS-SRC',
            outputLanes: ['4fa55453-728d-4d09-87dc-90dcbe01f739'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '4fa55453-728d-4d09-87dc-90dcbe01f739',
            inputLanes: ['a56d61b1-4858-4189-a797-3a7d6f491cfd'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'm9_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'OOO',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6084e2345806600010c7e416',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T08:33:35.563Z',
        stats: {},
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      },
      {
        createTime: '2021-04-27T08:26:35.688Z',
        last_updated: '2021-04-27T08:27:21.721Z',
        id: '6087cabb0786e30010d4d571',
        name: 'fff',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [
          {
            connectionId: '6084e2345806600010c7e416',
            dataQualityTag: false,
            distance: 1,
            freeTransform: false,
            id: 'dc7d711e-f0cf-4529-bf84-4b582c773234',
            inputLanes: [],
            joinTables: [],
            name: 'DRS-SRC',
            outputLanes: ['43534bc9-96b9-47bf-a611-7b2291290454'],
            type: 'database',
            database_type: 'mysql',
            dropType: 'no_drop',
            readBatchSize: 1000,
            readCdcInterval: 500,
            statsStatus: null
          },
          {
            connectionId: '6087c2ee0786e30010d4c882',
            dataQualityTag: false,
            distance: 0,
            freeTransform: false,
            id: '43534bc9-96b9-47bf-a611-7b2291290454',
            inputLanes: ['dc7d711e-f0cf-4529-bf84-4b582c773234'],
            joinTables: [],
            name: 'DRS-ALI-DEST',
            outputLanes: [],
            type: 'database',
            syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
            table_prefix: 'm7_',
            table_suffix: '',
            readBatchSize: 1000,
            readCdcInterval: 500,
            dropType: 'no_drop',
            database_type: 'mysql',
            statsStatus: null
          }
        ],
        setting: {
          name: 'fff',
          sync_type: 'initial_sync+cdc',
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          twoWay: false,
          syncPoints: [
            {
              connectionId: '6084e2345806600010c7e416',
              type: 'current',
              time: '',
              date: '',
              name: '',
              timezone: '+8'
            }
          ],
          readBatchSize: 25000,
          notificationWindow: 0,
          notificationInterval: 300,
          readCdcInterval: 500,
          description: '',
          drop_target: false,
          needToCreateIndex: false,
          increment: false,
          isSchedule: false,
          emailWaring: {
            edited: false,
            started: false,
            error: true,
            paused: true
          }
        },
        platformInfo: { region: '', zone: '' },
        user_id: '6072c1cbbf43e90010570f3c',
        agentId: '6086a74b71e5a600109bc483-knyj7h6l',
        startTime: '2021-04-27T08:26:39.265Z',
        stats: {
          input: { rows: 2075000, dataSize: 99600000 },
          output: { rows: 2075000, dataSize: 99600000 },
          insert: { rows: 2, dataSize: 0 },
          update: { rows: 0, dataSize: 0 },
          delete: { rows: 0, dataSize: 0 },
          transmissionTime: 4178,
          transTimeAvg: 0,
          replicationLag: 0,
          stagesMetrics: [
            {
              stageId: 'dc7d711e-f0cf-4529-bf84-4b582c773234',
              input: { rows: 0, dataSize: 0 },
              output: { rows: 2075000, dataSize: 99600000 },
              insert: { rows: 0, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 0,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            },
            {
              stageId: '43534bc9-96b9-47bf-a611-7b2291290454',
              input: { rows: 2075000, dataSize: 99600000 },
              output: { rows: 0, dataSize: 0 },
              insert: { rows: 2, dataSize: 0 },
              update: { rows: 0, dataSize: 0 },
              delete: { rows: 0, dataSize: 0 },
              transmissionTime: 4178,
              transTimeAvg: 0,
              replicationLag: 0,
              status: null
            }
          ],
          totalCount: null
        },
        user: {
          email: '60718c178fbae2c47bc294b3@custom.com',
          username: '小瓶套',
          emailVerified: true
        },
        errorEvents: [],
        tcm: {
          agentId: '6086a74b9dc484697bed9e6f',
          agentName: 'dfs-agent-1790dfd7d75'
        }
      }
    ],
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/update': {
    data: {
      success: [{ id: '608942c1c66ab700108de57f', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/:id': {
    data: {
      createTime: '2021-04-28T11:10:57.691Z',
      last_updated: '2021-05-10T07:55:32.824Z',
      id: '608942c1c66ab700108de57f',
      name: 'sudu 8',
      description: '',
      status: 'paused',
      executeMode: 'normal',
      category: '数据库克隆',
      stopOnError: false,
      mappingTemplate: 'cluster-clone',
      stages: [
        {
          connectionId: '60803202ddc0f40343b87e35',
          dataQualityTag: false,
          distance: 1,
          freeTransform: false,
          id: '860486ba-a620-44e8-82a4-dc98b62778ec',
          inputLanes: [],
          joinTables: [],
          name: 'local_179',
          outputLanes: ['76dfca82-f8d1-4909-b6e4-d341fb310bb2'],
          type: 'database',
          database_type: 'mysql',
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          statsStatus: 'cdc'
        },
        {
          connectionId: '6087c2ee0786e30010d4c882',
          dataQualityTag: false,
          distance: 0,
          freeTransform: false,
          id: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
          inputLanes: ['860486ba-a620-44e8-82a4-dc98b62778ec'],
          joinTables: [],
          name: 'DRS-ALI-DEST',
          outputLanes: [],
          type: 'database',
          syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
          table_prefix: 'ff013_',
          table_suffix: '',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: 'no_drop',
          database_type: 'mysql',
          statsStatus: null
        }
      ],
      setting: {
        name: 'sudu 8',
        sync_type: 'initial_sync+cdc',
        distinctWriteType: 'intellect',
        stopOnError: false,
        isOpenAutoDDL: false,
        twoWay: false,
        syncPoints: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            type: 'current',
            time: '',
            date: '',
            name: '',
            timezone: '+8'
          }
        ],
        readBatchSize: 25000,
        notificationWindow: 0,
        notificationInterval: 300,
        readCdcInterval: 500,
        description: '',
        drop_target: false,
        needToCreateIndex: false,
        increment: false,
        isSchedule: false,
        emailWaring: {
          edited: false,
          started: false,
          error: true,
          paused: true
        }
      },
      dataFlowType: 'normal',
      dataSourceModel: {
        source_databaseType: 'mysql',
        target_databaseType: 'mysql',
        source_connectionId: '60803202ddc0f40343b87e35',
        target_connectionId: '6087c2ee0786e30010d4c882',
        source_connectionName: 'local_179',
        target_connectionName: 'DRS-ALI-DEST'
      },
      platformInfo: { region: '', zone: '' },
      agentTags: ['', ''],
      pausedTime: '2021-05-10T07:56:19.429Z',
      finishTime: '2021-05-10T07:56:19.429Z',
      emailWaring: { edited: true, started: false, error: true, paused: false },
      user_id: '6072c1cbbf43e90010570f3c',
      customId: '60718c178fbae2c47bc294b3',
      agentId: '6086a74b71e5a600109bc483-knyj7h6l',
      errorTime: '',
      forceStoppingTime: '',
      operationTime: '2021-05-10T07:56:04.279Z',
      runningTime: '2021-05-10T07:55:32.967Z',
      scheduledTime: '2021-05-10T07:55:28.486Z',
      startTime: '2021-05-10T07:55:28.486Z',
      stoppingTime: '2021-05-10T07:56:04.279Z',
      msg: '',
      scheduleTime: 1620633332823,
      scheduleTimes: 1,
      pingTime: 1620633379338,
      milestones: [
        {
          code: 'INIT_DATAFLOW',
          status: 'finish',
          errorMessage: '',
          start: 1620633333182,
          end: 1620633333221
        },
        {
          code: 'INIT_CONNECTOR',
          status: 'finish',
          errorMessage: '',
          start: 1620633334786,
          end: 1620633334998
        },
        {
          code: 'INIT_TRANSFORMER',
          status: 'running',
          errorMessage: '',
          start: 1620633336474,
          end: 0
        },
        {
          code: 'CONNECT_TO_SOURCE',
          status: 'finish',
          errorMessage: '',
          start: 1620633335270,
          end: 1620633336835
        },
        {
          code: 'CONNECT_TO_TARGET',
          status: 'waiting',
          errorMessage: '',
          start: 0,
          end: 0
        },
        {
          code: 'READ_SOURCE_DDL',
          status: 'finish',
          errorMessage: '',
          start: 1619608272305,
          end: 1619608272507
        },
        {
          code: 'CREATE_TARGET_TABLE',
          status: 'finish',
          errorMessage: '',
          start: 1619608277704,
          end: 1619608462662
        },
        {
          code: 'READ_SNAPSHOT',
          status: 'finish',
          errorMessage: '',
          start: 1619608272891,
          end: 1619608461742
        },
        {
          code: 'WRITE_SNAPSHOT',
          status: 'finish',
          errorMessage: '',
          start: 1619608277671,
          end: 1619608466755
        },
        {
          code: 'READ_CDC_EVENT',
          status: 'finish',
          errorMessage: '',
          start: 1620633335037,
          end: 1620633337825
        },
        {
          code: 'WRITE_CDC_EVENT',
          status: 'waiting',
          errorMessage: '',
          start: 0,
          end: 0
        }
      ],
      stats: {
        input: { rows: 4990000, dataSize: 239520000 },
        output: { rows: 4990000, dataSize: 239520000 },
        insert: { rows: 4990000, dataSize: 0 },
        update: { rows: 0, dataSize: 0 },
        delete: { rows: 0, dataSize: 0 },
        transmissionTime: 662899,
        transTimeAvg: 0,
        replicationLag: 26874,
        stagesMetrics: [
          {
            stageId: '860486ba-a620-44e8-82a4-dc98b62778ec',
            input: { rows: 0, dataSize: 0 },
            output: { rows: 4990000, dataSize: 239520000 },
            insert: { rows: 0, dataSize: 0 },
            update: { rows: 0, dataSize: 0 },
            delete: { rows: 0, dataSize: 0 },
            transmissionTime: 0,
            transTimeAvg: 0,
            replicationLag: 26874,
            status: 'cdc'
          },
          {
            stageId: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
            input: { rows: 4990000, dataSize: 239520000 },
            output: { rows: 0, dataSize: 0 },
            insert: { rows: 4990000, dataSize: 0 },
            update: { rows: 0, dataSize: 0 },
            delete: { rows: 0, dataSize: 0 },
            transmissionTime: 662899,
            transTimeAvg: 0,
            replicationLag: 26874,
            status: null
          }
        ],
        totalCount: null
      },
      cdcLastTimes: [
        {
          sourceConnectionId: '60803202ddc0f40343b87e35',
          sourceConnectionName: 'local_179',
          targetConnectionId: '6087c2ee0786e30010d4c882',
          targetConnectionName: 'DRS-ALI-DEST',
          cdcTime: 1619608271000
        }
      ],
      executionTime: 1.5743833333333332,
      errorEvents: [],
      user: { email: '60718c178fbae2c47bc294b3@custom.com', username: '小瓶套' }
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/:id/copy': {
    data: {
      last_updated: '2021-05-10T07:58:26.739Z',
      id: '6098e7a2c66ab70010981c53',
      name: 'sudu 8 (1)',
      description: '',
      status: 'draft',
      executeMode: 'normal',
      category: '数据库克隆',
      stopOnError: false,
      mappingTemplate: 'cluster-clone',
      stages: [
        {
          connectionId: '60803202ddc0f40343b87e35',
          dataQualityTag: false,
          distance: 1,
          freeTransform: false,
          id: '860486ba-a620-44e8-82a4-dc98b62778ec',
          inputLanes: [],
          joinTables: [],
          name: 'local_179',
          outputLanes: ['76dfca82-f8d1-4909-b6e4-d341fb310bb2'],
          type: 'database',
          database_type: 'mysql',
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          statsStatus: 'cdc'
        },
        {
          connectionId: '6087c2ee0786e30010d4c882',
          dataQualityTag: false,
          distance: 0,
          freeTransform: false,
          id: '76dfca82-f8d1-4909-b6e4-d341fb310bb2',
          inputLanes: ['860486ba-a620-44e8-82a4-dc98b62778ec'],
          joinTables: [],
          name: 'DRS-ALI-DEST',
          outputLanes: [],
          type: 'database',
          syncObjects: [{ objectNames: ['my_test1'], type: 'table' }],
          table_prefix: 'ff013_',
          table_suffix: '',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: 'no_drop',
          database_type: 'mysql',
          statsStatus: null
        }
      ],
      setting: {
        name: 'sudu 8',
        sync_type: 'initial_sync+cdc',
        distinctWriteType: 'intellect',
        stopOnError: false,
        isOpenAutoDDL: false,
        twoWay: false,
        syncPoints: [
          {
            connectionId: '60803202ddc0f40343b87e35',
            type: 'current',
            time: '',
            date: '',
            name: '',
            timezone: '+8'
          }
        ],
        readBatchSize: 25000,
        notificationWindow: 0,
        notificationInterval: 300,
        readCdcInterval: 500,
        description: '',
        drop_target: false,
        needToCreateIndex: false,
        increment: false,
        isSchedule: false,
        emailWaring: {
          edited: false,
          started: false,
          error: true,
          paused: true
        }
      },
      dataFlowType: 'normal',
      dataSourceModel: {
        source_databaseType: 'mysql',
        target_databaseType: 'mysql',
        source_connectionId: '60803202ddc0f40343b87e35',
        target_connectionId: '6087c2ee0786e30010d4c882',
        source_connectionName: 'local_179',
        target_connectionName: 'DRS-ALI-DEST'
      },
      platformInfo: { region: '', zone: '' },
      agentTags: ['', ''],
      emailWaring: { edited: true, started: false, error: true, paused: false },
      user_id: '6072c1cbbf43e90010570f3c',
      customId: '60718c178fbae2c47bc294b3',
      msg: '',
      scheduleTime: 1620633332823,
      scheduleTimes: 1,
      pingTime: 1620633379338,
      stats: {}
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/resetAll': {
    data: {
      success: [{ id: '6098e7a2c66ab70010981c53', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/DataFlows/removeAll': {
    data: {
      success: [{ id: '6098e7a2c66ab70010981c53', code: 1, msg: 'ok' }],
      fail: []
    },
    code: 'ok',
    msg: 'ok'
  },
  '/api/nodeConfigs': { data: [], code: 'ok', msg: 'ok' },
  '/api/MetadataInstances': {
    code: 'ok',
    msg: 'ok',
    'data|1-10': [
      {
        id: '@id',
        meta_type: 'database',
        original_name: '@name',
        username: '@username',
        source: {
          name: 'CSS-MongoDB-Test',
          connection_type: 'source_and_target',
          database_type: 'mongodb',
          database_host: '192.168.1.189',
          database_username: 'root',
          database_port: 24212,
          database_uri: '',
          database_name: 'PC',
          database_owner: '',
          retry: 0,
          nextRetry: null,
          id: '6076ffbab0f20408b0ec0914',
          response_body: {
            validate_details: [
              {
                stage_code: 'validate-3000',
                show_msg: 'CHECK_CONNECT',
                status: 'passed',
                sort: 1,
                error_code: null,
                fail_message: null,
                required: true
              },
              {
                stage_code: 'validate-3100',
                show_msg: 'CHECK_AUTH',
                status: 'passed',
                sort: 2,
                error_code: null,
                fail_message: null,
                required: true
              },
              {
                stage_code: 'validate-3400',
                show_msg: 'CHECK_PERMISSION',
                status: 'passed',
                sort: 3,
                error_code: null,
                fail_message: null,
                required: true
              },
              {
                stage_code: 'validate-3200',
                show_msg: 'LOAD_SCHEMA',
                status: 'passed',
                sort: 4,
                error_code: null,
                fail_message: null,
                required: true
              }
            ],
            retry: 0,
            next_retry: 1619355584409
          },
          project: '',
          submit: true,
          plain_password: '',
          table_filter: '',
          additionalString: 'authSource=admin',
          thin_type: '',
          node_name: '',
          database_schema: '',
          plugin_name: '',
          pgsql_log_decorder_plugin_name: '',
          database_datetype_without_timezone: '',
          supportUpdatePk: false,
          ssl: false,
          sslKey: '',
          sslPass: '',
          schemaAutoUpdate: false,
          sslValidate: false,
          sslCA: '',
          search_databaseType: '',
          sourceType: 'dds',
          updateSchema: false,
          editTest: true,
          sslCert: '',
          status: 'ready',
          fill: '',
          transformed: true,
          user_id: '6072c1cbbf43e90010570f3c',
          customId: '60718c178fbae2c47bc294b3',
          last_updated: '2021-04-25T13:29:36.021Z',
          createTime: '2021-04-14T14:44:10.392Z',
          testTime: 1619357376015,
          dbFullVersion: '4.2.12',
          db_version: 4,
          loadCount: 8,
          loadFieldsStatus: 'finished',
          loadSchemaField: false,
          schemaVersion: '08309d72-2d22-48cf-9b9a-b3942e9279ec',
          tableCount: 8,
          everLoadSchema: true,
          errorMsg: 'testing timeout',
          schema: {},
          _id: '6076ffbab0f20408b0ec0914'
        }
      }
    ]
  },
  '/api/Logs': { data: [], code: 'ok', msg: 'ok' },
  '/api/DataFlowInsights/runtimeMonitor': {
    code: 'ok',
    msg: 'ok',
    data: []
  },
  '/api/Inspects/count': { data: { count: 1 }, code: 'ok', msg: 'ok' },
  '/api/Inspects': {
    code: 'ok',
    msg: 'ok',
    'data|10-50': [
      {
        InspectResult: {
          agentId: '@id',
          createTime: '@now',
          end: 1619339604593,
          errorMsg: 'errorMsg',
          id: '@id',
          inspect: {},
          inspect_id: '@id',
          last_updated: '@now',
          progress: Random.integer(0, 3),
          source_total: Random.integer(10000, 1000000),
          spendMilli: Random.integer(0, 100),
          start: 1619339546788,
          'stats|0-10': [
            {
              taskId: '@name',
              target_total: Random.integer(100, 10000),
              target_only: Random.integer(100, 10000),
              status: 'done',
              speed: Random.integer(0, 100),
              start: 1619339546806,
              end: 1619339587965
            }
          ],
          status: 'error',
          target_total: 44625001,
          threads: Random.integer(0, 100),
          ttlTime: '2021-07-24T08:32:26.799Z'
        },
        agentId: '@id',
        agentTags: [],
        createTime: '2021-04-25T08:32:22.866Z',
        customId: '@id',
        dataFlowName: '@name',
        difference_number: 0,
        enabled: true,
        errorMsg: 'errorMsg',
        flowId: '@id',
        id: '@id',
        inspectMethod: 'row_count',
        lastStartTime: 1619339546685,
        last_updated: '2021-04-25T08:33:24.609Z',
        limit: { keep: 100 },
        mode: 'manual',
        name: '@name',
        ping_time: 1619339601803,
        result: 'failed',
        scheduleTime: 1619339546690,
        scheduleTimes: 1,
        'status|1': ['waiting', 'scheduling', 'error', 'done', 'running'],
        'tasks|0-20': [
          {
            fullMatch: true,
            script: '',
            showAdvancedVerification: false,
            taskId: '@id',
            webScript: '',
            source: {
              connectionId: '@id',
              connectionName: '@name',
              sortColumn: 'id',
              table: '@name',
              'fields|0-10': [
                {
                  field_name: '@name',
                  id: '@id',
                  primary_key_position: 1
                }
              ]
            },
            target: {
              connectionId: '@id',
              connectionName: '@name',
              sortColumn: '@name',
              table: '@name',
              'fields|0-10': [
                {
                  field_name: '@name',
                  id: '@id',
                  primary_key_position: 1
                }
              ]
            }
          }
        ],
        timing: {
          end: 1619425927612,
          intervals: 1440,
          intervalsUnit: 'minute',
          start: 1619339527612
        },
        user_id: '@id'
      }
    ]
  },
  '/api/Inspects/update': { data: { count: 1 }, code: 'ok', msg: 'ok' },
  '/api/InspectResults/count': { data: { count: 1 }, code: 'ok', msg: 'ok' },
  '/api/InspectResults': {
    code: 'ok',
    msg: 'ok',
    data: [
      {
        agentId: '@id',
        createTime: '@now',
        difference_number: Random.integer(0, 20),
        end: '',
        errorMsg: '',
        id: '@id',
        inspect: {},
        inspect_id: '@id',
        last_updated: '@now',
        progress: Random.integer(0, 20),
        result: 'passed',
        source_total: Random.integer(0, 20),
        spendMilli: Random.integer(0, 20),
        start: 1620639705702,
        'stats|1-5': [
          {
            both: Random.integer(0, 20),
            cycles: Random.integer(0, 20),
            end: null,
            errorMsg: null,
            progress: Random.integer(0, 20),
            result: null,
            row_failed: Random.integer(0, 20),
            row_passed: Random.integer(0, 20),
            source: {
              columns: null,
              connectionId: '@id',
              connectionName: '@name',
              direction: null,
              limit: Random.integer(0, 20),
              skip: Random.integer(0, 20),
              sortColumn: '@name',
              table: '@name',
              where: null
            },
            source_only: Random.integer(0, 20),
            source_total: Random.integer(0, 20),
            speed: Random.integer(0, 20),
            start: 1620639705703,
            status: 'running',
            target: {
              columns: null,
              connectionId: '@id',
              connectionName: '@name',
              direction: null,
              limit: Random.integer(0, 20),
              skip: Random.integer(0, 20),
              sortColumn: '@name',
              table: '@name',
              where: null
            },
            target_only: Random.integer(0, 20),
            target_total: Random.integer(0, 20),
            taskId: '@id'
          }
        ],
        status: 'running',
        target_total: Random.integer(0, 20),
        threads: Random.integer(0, 20),
        ttlTime: '@now'
      }
    ]
  },
  '/api/InspectDetails/count': { data: { count: 0 }, code: 'ok', msg: 'ok' },
  '/api/InspectDetails': { data: [], code: 'ok', msg: 'ok' }
}

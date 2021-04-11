import Vue from 'vue';
import Router from 'vue-router';
import factor from '../api/factory';
import i18n from '../i18n/i18n';
import { setPermission } from '../util/util';
// signOut
import { Loading, Message } from 'element-ui';

const view = path => () => import(`../view/${path}`);

Vue.use(Router);

const childRoutes = [
	// {
	// 	path: '/dashboard',
	// 	name: 'dashboard',
	// 	component: view('dashboard/Dashboard'),
	// 	meta: { title: i18n.t('tap.home'), isCollapse: false }
	// },
	{
		path: '/dashboard',
		name: 'dashboard',
		component: view('dashboard/DFSDashboard')
	},
	{
		path: '/connections',
		name: 'connections',
		component: view('connections/List'),
		meta: {
			code: 'datasource_menu',
			title: i18n.t('tap.connection'),
			isCollapse: false
		}
	},
	{
		path: '/connections/create',
		name: 'connectionsCreate',
		component: view('connections/DatabaseForm'),
		meta: {
			title: i18n.t('tap.connection'),
			isCollapse: true,
			code: 'datasource_creation'
		}
	},
	{
		path: '/connections/:id/edit',
		name: 'connectionsEdit',
		component: view('connections/DatabaseForm'),
		meta: {
			title: i18n.t('tap.connection'),
			isCollapse: true,
			code: 'datasource_edition'
		}
	},
	{
		path: '/connection',
		name: 'connection',
		component: view('ExternalLink'),
		meta: {
			code: 'datasource_creation',
			url: '/old/index.html#/connection',
			title: i18n.t('tap.connectionEdtion'),
			isCollapse: false
		}
	},
	{
		path: '/connection/:id',
		name: 'editConnection',
		component: view('ExternalLink'),
		meta: {
			code: 'datasource_edition',
			url: '/old/index.html#/connection',
			title: i18n.t('tap.connectionEdtion'),
			isCollapse: true
		}
	},
	{
		path: '/metadataDefinition',
		name: 'metadataDefinition',
		component: view('ExternalLink'),
		meta: {
			code: 'data_catalog_menu',
			url: '/old/index.html#/metadataDefinition',
			title: i18n.t('tap.metadata'),
			isCollapse: false
		}
	},
	{
		path: '/metadataSearch',
		name: 'metadataSearch',
		component: view('metadata/Search'),
		meta: {
			title: i18n.t('tap.metadataSearch'),
			isCollapse: true
		}
	},
	{
		path: '/metadataInstances/:id',
		name: 'metadataInstances',
		component: view('ExternalLink'),
		meta: {
			code: 'data_catalog_edition',
			title: i18n.t('tap.metadataInstances'),
			isCollapse: true
		}
	},
	{
		path: '/dataQuality',
		name: 'dataQuality',
		component: view('ExternalLink'),
		meta: {
			code: 'data_quality_menu',
			url: '/old/index.html#/dataQuality',
			title: i18n.t('tap.dataQuality'),
			isCollapse: false
		}
	},
	{
		path: '/dataQuality/:id',
		name: 'dataQualityDetail',
		component: view('ExternalLink'),
		meta: { code: 'data_quality_edition', title: i18n.t('tap.dataQuality'), isCollapse: true }
	},
	{
		path: '/ttl',
		name: 'timeToLive',
		component: view('ExternalLink'),
		meta: {
			code: 'time_to_live_menu',
			url: '/old/index.html#/ttl',
			title: i18n.t('tap.TimeToLive'),
			isCollapse: false
		}
	},
	{
		path: '/dataRules',
		name: 'dataRules',
		component: view('ExternalLink'),
		meta: {
			code: 'data_rules_menu',
			url: '/old/index.html#/dataRules',
			title: i18n.t('tap.dataRules'),
			isCollapse: false
		}
	},
	{
		path: '/topology',
		name: 'topology',
		component: view('ExternalLink'),
		meta: {
			code: 'Topology_menu',
			url: '/old/index.html#/topology',
			title: i18n.t('tap.topology'),
			isCollapse: false
		}
	},
	{
		path: '/dictionary',
		name: 'dictionary',
		component: view('ExternalLink'),
		meta: {
			code: 'dictionary_menu',
			url: '/old/index.html#/dictionary',
			title: i18n.t('tap.dictionary'),
			isCollapse: false
		}
	},
	{
		path: '/modules',
		name: 'modules',
		component: view('ExternalLink'),
		meta: {
			code: 'API_management_menu',
			url: '/old/index.html#/modules',
			title: i18n.t('tap.apiManagement'),
			isCollapse: false
		}
	},
	{
		path: '/module',
		name: 'module',
		component: view('ExternalLink'),
		meta: {
			code: 'API_creation'
		}
	},
	{
		path: '/module/:id',
		name: 'editModule',
		component: view('ExternalLink'),
		meta: {
			code: 'API_edition'
		}
	},
	{
		path: '/dataExplorer',
		name: 'dataExplorer',
		component: view('ExternalLink'),
		meta: {
			code: 'API_data_explorer_menu',
			url: '/old/index.html#/dataExplorer',
			title: i18n.t('tap.dataExplor'),
			isCollapse: false
		}
	},
	{
		path: '/apiDocAndTest',
		name: 'apiDocAndTest',
		component: view('ExternalLink'),
		meta: {
			code: 'API_doc_&_test_menu',
			url: '/old/index.html#/apiDocAndTest',
			title: i18n.t('tap.docTest'),
			isCollapse: false
		}
	},
	{
		path: '/apiAnalysis',
		name: 'apiAnalysis',
		component: view('ExternalLink'),
		meta: {
			code: 'API_stats_menu',
			url: '/old/index.html#/apiAnalysis',
			title: i18n.t('tap.apiStats'),
			isCollapse: false
		}
	},
	{
		path: '/applications',
		name: 'applications',
		component: view('ExternalLink'),
		meta: {
			code: 'API_clients_menu',
			url: '/old/index.html#/applications',
			title: i18n.t('tap.apiClients'),
			isCollapse: false
		}
	},
	{
		path: '/apiServers',
		name: 'apiServers',
		component: view('ExternalLink'),
		meta: {
			code: 'API_server_menu',
			url: '/old/index.html#/apiServers',
			title: i18n.t('tap.apiSever'),
			isCollapse: false
		}
	},
	{
		path: '/dataCollect',
		name: 'dataCollect',
		component: view('ExternalLink'),
		meta: {
			url: '/old/index.html#/dataCollect',
			title: i18n.t('tap.dataCollect'),
			code: 'data_collect(old)_menu',
			isCollapse: false
		}
	},
	{
		path: '/tasks',
		name: 'tasks',
		component: view('ExternalLink'),
		meta: {
			code: 'schedule_jobs_menu',
			url: '/old/index.html#/tasks',
			title: i18n.t('tap.jobSchedule'),
			isCollapse: false
		}
	},
	// {
	// 	path: '/agentdownload',
	// 	name: 'agentdownload',
	// 	component: view('ExternalLink'),
	// 	meta: {
	// 		requiresAuth: true,
	// 		url: '/old/index.html#/agentdownload',
	// 		title: i18n.t('tap.agentdownload'),
	// 		isCollapse: false
	// 	}
	// },
	{
		path: '/agents',
		name: 'agents',
		component: view('ExternalLink'),
		meta: {
			code: 'agents_menu',
			url: '/old/index.html#/agents',
			title: i18n.t('tap.agentManagement'),
			isCollapse: false
		}
	},
	{
		path: '/serversOversee',
		name: 'serversOversee',
		component: view('ExternalLink'),
		meta: {
			code: 'servers_oversee_menu',
			url: '/old/index.html#/serversOversee',
			title: i18n.t('tap.serversOversee'),
			isCollapse: false
		}
	},
	{
		path: '/users',
		name: 'users',
		// component: view('ExternalLink'),
		component: view('Users/List'),
		meta: {
			code: 'user_management_menu',
			// url: '/old/index.html#/users',
			title: i18n.t('tap.userManagement'),
			isCollapse: false
		}
	},
	// {
	// 	path: '/journal',
	// 	name: 'journal',
	// 	component: view('ExternalLink'),
	// 	meta: {
	// 		url: '/old/index.html#/journal',
	// 		title: i18n.t('tap.journal'),
	// 		isCollapse: false
	// 	}
	// },
	{
		path: '/roles',
		name: 'roles',
		component: view('Role/Roles'),
		// component: view('ExternalLink'),
		meta: {
			code: 'role_management_menu',
			// url: '/old/index.html#/roles',
			title: i18n.t('tap.roleManagement'),
			isCollapse: false
		}
	},
	{
		path: '/role',
		name: 'role',
		component: view('Role/Role'),
		meta: {
			code: 'role_creation'
		}
		// component: view('ExternalLink')
	},
	{
		path: '/role/:id',
		name: 'editRole',
		component: view('Role/Role'),
		meta: {
			code: 'role_edition'
		}
		// component: view('ExternalLink')
	},
	{
		path: '/settings',
		name: 'settings',
		component: view('ExternalLink'),
		meta: {
			code: 'system_settings_menu',
			url: '/old/index.html#/settings',
			title: i18n.t('tap.systemSettings'),
			isCollapse: false
		}
	},
	/*-----------------------------------------------------------------*/
	{
		path: '/clusterManagement',
		name: 'clusterManagement',
		component: view('clusterManagement/clusterManagement'),
		meta: {
			code: 'Cluster_management_menu',
			title: i18n.t('tap.clusterManagement'),
			isCollapse: false
		}
	},
	{
		path: '/dailyRecord',
		name: 'dailyRecord',
		component: view('clusterManagement/dailyRecord')
	},
	{
		path: '/dataFlows',
		name: 'dataFlows',
		component: view('task/DataFlows'),
		meta: {
			code: 'Data_SYNC_menu',
			title: i18n.t('tap.jobFlow'),
			isCollapse: false
		}
	},
	{
		path: '/relations',
		name: 'relations',
		component: view('relations/relations'),
		meta: {}
	},
	{
		path: '/dataMap',
		name: 'dataMap',
		component: view('dataMap/DataMap'),
		meta: {
			code: 'data_lineage_menu',
			title: i18n.t('tap.dataLineage'),
			isCollapse: false
		}
	},
	{
		path: '/upload',
		name: 'upload',
		component: view('Upload'),
		meta: {
			title: i18n.t('tap.upload'),
			code: 'SYNC_job_import',
			isCollapse: false
		}
	},
	{
		path: '/apiInfo',
		name: 'apiInfo',
		component: view('job/apiInfo'),
		meta: { title: i18n.t('tap.apiInfo'), isCollapse: false }
	},
	{
		path: '/jsFuncs',
		name: 'jsFuncs',
		component: view('ExternalLink'),
		meta: {
			url: '/old/index.html#/jsFuncs',
			isCollapse: false,
			code: 'SYNC_Function_management'
		}
	},
	{
		path: '/tableFlows',
		name: 'tableFlows',
		component: view('task/TableFlows'),
		meta: { isCollapse: true }
	},

	{
		path: '/dataVerification/:id/edit',
		name: 'dataVerificationEdit',
		component: view('dataVerification/Form'),
		meta: {
			title: i18n.t('app.menu.dataVerification'),
			isCollapse: true,
			code: 'verify_job_edition'
		}
	},
	{
		path: '/dataVerification/create',
		name: 'dataVerificationCreate',
		component: view('dataVerification/Form'),
		meta: {
			title: i18n.t('app.menu.dataVerification'),
			isCollapse: true,
			code: 'verify_job_creation'
		}
	},
	{
		path: '/dataVerification',
		name: 'dataVerification',
		component: view('dataVerification/List'),
		meta: {
			title: i18n.t('app.menu.dataVerification'),
			isCollapse: true,
			code: 'Data_verify_menu'
		}
	},
	{
		path: '/dataVerifyHistory',
		name: 'dataVerifyHistory',
		component: view('dataVerification/History'),
		meta: {
			title: i18n.t('dataVerification.verifyHistory'),
			isCollapse: true,
			code: 'Data_verify'
		}
	},
	{
		path: '/dataVerifyResult',
		name: 'dataVerifyResult',
		component: view('dataVerification/Result'),
		meta: {
			title: i18n.t('dataVerification.verifyResult'),
			isCollapse: true,
			code: 'Data_verify'
		}
	},
	{
		path: '/dataVerification/setting',
		name: 'dataVerifySetting',
		component: view('dataVerification/setting'),
		meta: {
			code: 'Data_verify'
		}
	},
	{
		path: '/agentDown',
		name: 'agentDown',
		component: view('downAgent/agentDown')
	},
	{
		path: '/notification',
		name: 'notification',
		component: view('notification/Center'),
		meta: {
			title: i18n.t('notification.systemNotice'),
			isCollapse: true
		}
	},
	{
		path: '/settingCenter',
		name: 'settingCenter',
		redirect: 'settingCenter/accountSetting',
		component: view('setting/SettingCenter'),
		meta: {
			title: i18n.t('tap.settingCenter'),
			isCollapse: true
		},
		children: [
			{
				path: 'accountSetting',
				name: 'accountSetting',
				component: view('setting/AccountSetting'),
				meta: { title: i18n.t('tap.account'), isCollapse: true }
			},
			{
				path: 'notificationSetting',
				name: 'notificationSetting',
				component: view('setting/NotificationSetting'),
				meta: { title: i18n.t('notification.setting'), isCollapse: true }
			}
		]
	},
	{
		path: '/metadata',
		name: 'metadata',
		component: view('metadata/List'),
		meta: {
			code: 'data_catalog_menu',
			title: i18n.t('tap.dataCatalog'),
			isCollapse: true,
			types: ['table', 'view', 'collection', 'mongo_view']
		}
	},
	{
		path: '/metadataDetails',
		name: 'metadataDetails',
		component: view('metadata/Info'),
		meta: {
			code: 'data_catalog_menu',
			title: i18n.t('tap.dataCatalog'),
			isCollapse: true
		}
	}
];

const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: view('Login/Login'),
			meta: {
				title: i18n.t('tap.login')
			}
		},
		{
			path: '/registry',
			name: 'registry',
			component: view('Login/Registration'),
			meta: {
				title: i18n.t('tap.registry')
			}
		},
		{
			path: '/verificationEmail',
			name: 'verificationEmail',
			component: view('Login/VerificationEmail'),
			meta: {
				title: i18n.t('tap.verificationEmail')
			}
		},
		{
			path: '/registyResult',
			name: 'registyResult',
			component: view('Login/RegistyResult'),
			meta: {
				title: i18n.t('tap.registry')
			}
		},
		{
			path: '/passwordReset',
			name: 'passwordReset',
			component: view('Login/PasswordReset'),
			meta: {
				title: i18n.t('tap.passwordReset')
			}
		},
		{
			path: '/job',
			name: 'job',
			component: view('job/Job'),
			meta: { code: 'Data_SYNC', title: i18n.t('tap.jobFlow') }
		},
		{
			path: '/createTask/create',
			name: 'createTask',
			component: view('createTask/createTask')
		},
		{
			path: '/createTask/:id/edit',
			name: 'editTask',
			component: view('createTask/createTask')
		},
		{
			path: '/',
			name: 'layout',
			redirect: 'dashboard',
			component: view('Layout'),
			children: childRoutes
		},
		{
			path: '/guide',
			name: 'guide',
			component: view('Guide')
		}
	]
});

let usersModel = factor('users');
router.afterEach(() => {
	Loading.service({ fullscreen: true }).close();
});
let isFirst = true;
router.beforeEach(async (to, from, next) => {
	window.parent && window.parent.emitRouteChange && window.parent.emitRouteChange(to);
	if (!to.matched.length) {
		Message.error({
			message: 'Page not found!'
		});
		next(false);
		return;
	}
	if (to.meta.title && window.getSettingByKey('SHOW_PAGE_TITLE')) {
		document.title = to.meta.title;
	}
	let cookie = window.VueCookie;
	let token = cookie.get('token');
	// let xToken = cookie.get('xToken');
	// let showGuide = window.getSettingByKey('SHOW_SIMPLE_SCENE') && cookie.get('show_guide');
	let userId = cookie.get('user_id');

	if (token) {
		//若token存在，获取权限
		let permissions = sessionStorage.getItem('tapdata_permissions');
		if (!permissions || isFirst) {
			// if (xToken) {
			try {
				let res = await usersModel.getUserInfo();
				let user = res.data;
				cookie.set('email', user.email);
				cookie.set('username', user.username || '');
				cookie.set('login', 1);
				cookie.set('isAdmin', parseInt(user.role) || 0);
				cookie.set('user_id', user.id);
				cookie.delete('show_guide');
				if (!user.isCompleteGuide) {
					cookie.set('show_guide', 1);
				}
				userId = user.id;
			} catch (e) {
				if (e.response && e.response.msg) {
					Message.error({
						message: e.response.msg
					});
				}
			}
			// }
			//无权限，说明是首次进入页面，重新请求后台获取
			let loading = Loading.service({
				fullscreen: true,
				lock: true,
				text: 'Loading...',
				background: 'rgba(0, 0, 0, 0.7)'
			});
			try {
				let result = await usersModel.getPermissions(`/${userId}/permissions`);
				isFirst = false;
				loading.close();
				if (result && result.data) {
					permissions = result.data.permissions || [];
					//权限存在则存入缓存并继续向下走
					permissions = setPermission(permissions);
					// else {
					// 	//权限列表为空，说明没有权限进入，执行sign out操作并跳转到登录页面
					// 	Message.error({
					// 		message: i18n.t('app.signIn.permission_denied')
					// 	});
					// 	signOut();
					// 	return;
					// }
				} else {
					Message.error({
						message: i18n.t('app.signIn.permission_denied')
					});
					next(false);
					return;
				}
			} catch (e) {
				if (e.response && e.response.msg) {
					Message.error({
						message: e.response.msg
					});
				}
			}
		} else {
			permissions = JSON.parse(permissions);
		}

		//判断当前路由的页面是否有权限，无权限则不跳转，有权限则执行跳转
		let matched = true;
		if (to.meta.code && !window.getSettingByKey('DFS_IGNORE_PERMISSION')) {
			matched = permissions.some(p => p.code === to.meta.code);
		}
		if (matched) {
			// if (showGuide) {
			// 	if (to.name === 'guide') {
			// 		return next();
			// 	} else {
			// 		return next('/guide');
			// 	}
			// }
			if (to.name === 'login' || to.name === 'guide') {
				next('/');
			} else {
				next();
			}
		} else {
			Message.error({
				message: i18n.t('app.signIn.permission_denied')
			});
			next(false);
		}
	} else {
		if (['login', 'registry', 'passwordReset', 'verificationEmail', 'registyResult'].includes(to.name)) {
			next();
		} else {
			next('/login');
		}
	}
});

export default router;
export { childRoutes };

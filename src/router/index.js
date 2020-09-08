import Vue from 'vue';
import Router from 'vue-router';
import factor from '../api/factory';
import i18n from '../i18n/i18n';
import { setPermission, signOut } from '../util/util';
import { Loading, Message } from 'element-ui';

const view = path => () => import(`../view/${path}`);

Vue.use(Router);

const childRoutes = [
	{
		path: '/dashboard',
		name: 'dashboard',
		component: view('dashboard/Dashboard'),
		meta: { requiresAuth: true, title: i18n.t('tap.home') }
	},
	{
		path: '/connections',
		name: 'connections',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/connections', title: i18n.t('tap.connection') }
	},
	{
		path: '/connection',
		name: 'connection',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/connection', title: i18n.t('tap.connectionEdtion') }
	},
	{
		path: '/connection/:id',
		name: 'editConnection',
		component: view('ExternalLink'),
		meta: { url: '/old/index.html#/connection', title: i18n.t('tap.connectionEdtion') }
	},
	{
		path: '/metadataDefinition',
		name: 'metadataDefinition',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/metadataDefinition', title: i18n.t('tap.dataCatalog') }
	},
	{
		path: '/metadataInstances/:id',
		name: 'metadataInstances',
		component: view('ExternalLink'),
		meta: { title: i18n.t('tap.metadataInstances') }
	},
	{
		path: '/dataQuality',
		name: 'dataQuality',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/dataQuality', title: i18n.t('tap.dataQuality') }
	},
	{
		path: '/dataQuality/:id',
		name: 'dataQualityDetail',
		component: view('ExternalLink'),
		meta: { title: i18n.t('tap.dataQuality') }
	},
	{
		path: '/ttl',
		name: 'timeToLive',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/ttl', title: i18n.t('tap.TimeToLive') }
	},
	{
		path: '/dataRules',
		name: 'dataRules',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/dataRules', title: i18n.t('tap.dataRules') }
	},
	{
		path: '/dictionary',
		name: 'dictionary',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/dictionary', title: i18n.t('tap.dictionary') }
	},
	{
		path: '/modules',
		name: 'modules',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/modules', title: i18n.t('tap.apiManagement') }
	},
	{
		path: '/module/:id',
		name: 'editModule',
		component: view('ExternalLink')
	},
	{
		path: '/dataExplorer',
		name: 'dataExplorer',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/dataExplorer', title: i18n.t('tap.dataExplor') }
	},
	{
		path: '/apiDocAndTest',
		name: 'apiDocAndTest',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/apiDocAndTest', title: i18n.t('tap.docTest') }
	},
	{
		path: '/apiAnalysis',
		name: 'apiAnalysis',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/apiAnalysis', title: i18n.t('tap.apiStats') }
	},
	{
		path: '/applications',
		name: 'applications',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/applications', title: i18n.t('tap.apiClients') }
	},
	{
		path: '/apiServers',
		name: 'apiServers',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/apiServers', title: i18n.t('tap.apiSever') }
	},
	{
		path: '/dataCollect',
		name: 'dataCollect',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/dataCollect', title: i18n.t('tap.dataCollect') }
	},
	{
		path: '/tasks',
		name: 'tasks',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/tasks', title: i18n.t('tap.jobSchedule') }
	},
	{
		path: '/agentdownload',
		name: 'agentdownload',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/agentdownload', title: i18n.t('tap.agentdownload') }
	},
	{
		path: '/agents',
		name: 'agents',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/agents', title: i18n.t('tap.agentManagement') }
	},
	{
		path: '/serversOversee',
		name: 'serversOversee',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/serversOversee', title: i18n.t('tap.serversOversee') }
	},
	{
		path: '/users',
		name: 'users',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/users', title: i18n.t('tap.userManagement') }
	},
	{
		path: '/journal',
		name: 'journal',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/journal', title: i18n.t('tap.journal') }
	},
	{
		path: '/roles',
		name: 'roles',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/roles', title: i18n.t('tap.roleManagement') }
	},
	{
		path: '/role',
		name: 'role',
		component: view('ExternalLink')
	},
	{
		path: '/role/:id',
		name: 'editRole',
		component: view('ExternalLink')
	},
	{
		path: '/settings',
		name: 'settings',
		component: view('ExternalLink'),
		meta: { requiresAuth: true, url: '/old/index.html#/settings', title: i18n.t('tap.systemSettings') }
	},
	/*-----------------------------------------------------------------*/
	{
		path: '/clusterManagement',
		name: 'clusterManagement',
		component: view('clusterManagement/layout'),
		meta: { requiresAuth: true, title: i18n.t('tap.clusterManagement') }
	},
	{
		path: '/dataFlows',
		name: 'dataFlows',
		component: view('task/DataFlows'),
		meta: { requiresAuth: true, title: i18n.t('tap.jobFlow') }
	},
	{
		path: '/dataMap',
		name: 'dataMap',
		component: view('dataMap/DataMap'),
		meta: { requiresAuth: true, title: i18n.t('tap.dataLineage') }
	},
	{
		path: '/upload',
		name: 'upload',
		component: view('Upload'),
		meta: { title: i18n.t('tap.upload') }
	},
	{
		path: '/apiInfo',
		name: 'apiInfo',
		component: view('job/apiInfo'),
		meta: { title: i18n.t('tap.apiInfo') }
	},
	{
		path: '/jsFuncs',
		name: 'jsFuncs',
		component: view('ExternalLink'),
		meta: { url: '/old/index.html#/jsFuncs' }
	},
	{
		path: '/notification',
		name: 'notification',
		component: view('notification/list'),
		meta: { title: i18n.t('notification.systemNotice') }
	},
	{
		path: '/dataVerification/create',
		name: 'dataVerificationCreate',
		component: view('dataVerification/Form')
	},
	{
		path: '/dataVerification',
		name: 'dataVerification',
		component: view('dataVerification/List'),
		meta: { title: i18n.t('notification.systemNotice') }
	},
	{
		path: '/dataVerifyHistory',
		name: 'dataVerifyHistory',
		component: view('dataVerification/History'),
		meta: { title: i18n.t('notification.systemNotice') }
	},
	{
		path: '/dataVerifySetting',
		name: 'dataVerifySetting',
		component: view('dataVerification/setting'),
		meta: { title: i18n.t('dataVerify.setting.title') }
	}
];

const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: view('Login'),
			meta: {
				title: i18n.t('tap.login')
			}
		},
		{
			path: '/job',
			name: 'job',
			component: view('job/Job'),
			meta: { requiresAuth: true, title: i18n.t('tap.jobFlow') }
		},
		{
			path: '/',
			name: 'layout',
			redirect: 'dashboard',
			component: view('Layout'),
			children: childRoutes
		}
	]
});

let usersModel = factor('users');
router.beforeEach(async (to, from, next) => {
	if (to.meta.title && window._TAPDATA_OPTIONS_.platform === 'DAAS') {
		document.title = to.meta.title;
	}
	let cookie = window.VueCookie;
	let token = cookie.get('token');
	if (token) {
		//若token存在，获取权限
		let permissions = sessionStorage.getItem('tapdata_permissions');
		if (!permissions) {
			//无权限，说明是首次进入页面，重新请求后台获取
			let loading = Loading.service({
				fullscreen: true,
				lock: true,
				text: 'Loading...',
				background: 'rgba(0, 0, 0, 0.7)'
			});
			let userId = cookie.get('user_id');
			let token = cookie.get('token');
			let result = await usersModel.getPermissions(`/${userId}/permissions?access_token=${token}`);
			loading.close();
			if (result.statusText === 'OK' && result.data) {
				permissions = result.data.permissions || [];
				if (permissions.length) {
					//权限存在则存入缓存并继续向下走
					permissions = setPermission(permissions);
				} else {
					//权限列表为空，说明没有权限进入，执行sign out操作并跳转到登录页面
					Message.error({
						message: 'Permission denied'
					});
					signOut();
					return;
				}
			} else {
				Message.error({
					message: result.statusText
				});
				return;
			}
		} else {
			//若缓存中有权限值，则格式化成json后继续向下走
			permissions = JSON.parse(permissions);
		}

		//判断当前路由的页面是否有权限，无权限则不跳转，有权限则执行跳转
		let matched = true;
		if (to.meta.requiresAuth) {
			matched = permissions.some(p => p.name === to.name || p.path === to.path);
		}
		if (matched) {
			if (to.name === 'login') {
				next('/');
			} else {
				next();
			}
		} else {
			Message.error({
				message: 'Permission denied'
			});
		}
	} else {
		if (to.name === 'login') {
			next();
		} else {
			next('/login');
		}
	}
});

export default router;
export { childRoutes };

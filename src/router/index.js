import Vue from 'vue';
import Router from 'vue-router';
import factor from '../api/factory';
import { Loading, Message } from 'element-ui';

const view = path => () => import(`../view/${path}`);

Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: view('Login')
		},
		{
			path: '/job',
			name: 'job',
			component: view('job/Job'),
			meta: { requiresAuth: true }
		},
		{
			path: '/',
			name: 'layout',
			redirect: 'dashboard',
			component: view('layout'),
			children: [
				{
					path: '/dashboard',
					name: 'dashboard',
					component: view('dashboard/Dashboard'),
					meta: { requiresAuth: true }
				},
				{
					path: '/connections',
					name: 'connections',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/connections' }
				},
				{
					path: '/connection',
					name: 'connection',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/connection' }
				},
				{
					path: '/metadataDefinition',
					name: 'metadataDefinition',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/metadataDefinition' }
				},
				{
					path: '/dataQuality',
					name: 'dataQuality',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/dataQuality' }
				},
				{
					path: '/ttl',
					name: 'timeToLive',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/ttl' }
				},
				{
					path: '/dataRules',
					name: 'dataRules',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/dataRules' }
				},
				{
					path: '/dictionary',
					name: 'dictionary',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/dictionary' }
				},
				{
					path: '/modules',
					name: 'modules',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/modules' }
				},
				{
					path: '/dataExplorer',
					name: 'dataExplorer',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/dataExplorer' }
				},
				{
					path: '/apiDocAndTest',
					name: 'apiDocAndTest',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/apiDocAndTest' }
				},
				{
					path: '/apiAnalysis',
					name: 'apiAnalysis',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/apiAnalysis' }
				},
				{
					path: '/applications',
					name: 'applications',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/applications' }
				},
				{
					path: '/apiServers',
					name: 'apiServers',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/apiServers' }
				},
				{
					path: '/dataCollect',
					name: 'dataCollect',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/dataCollect' }
				},
				{
					path: '/tasks',
					name: 'tasks',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/tasks' }
				},
				{
					path: '/agentdownload',
					name: 'agentdownload',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/agentdownload' }
				},
				{
					path: '/agents',
					name: 'agents',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/agents' }
				},
				{
					path: '/serversOversee',
					name: 'serversOversee',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/serversOversee' }
				},
				{
					path: '/users',
					name: 'users',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/users' }
				},
				{
					path: '/journal',
					name: 'journal',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/journal' }
				},
				{
					path: '/roles',
					name: 'roles',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/roles' }
				},
				{
					path: '/settings',
					name: 'settings',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/settings' }
				},
				/*-----------------------------------------------------------------*/
				{
					path: '/clusterManagement',
					name: 'clusterManagement',
					component: view('clusterManagement/layout'),
					meta: { requiresAuth: true }
				},
				{
					path: '/dataFlows',
					name: 'dataFlows',
					component: view('task/DataFlows'),
					meta: { requiresAuth: true }
				},
				{
					path: '/dataMap',
					name: 'dataMap',
					component: view('dataMap/DataMap'),
					meta: { requiresAuth: true }
				},
				{
					path: '/upload',
					name: 'upload',
					component: view('Upload')
				},
				{
					path: '/apiInfo',
					name: 'apiInfo',
					component: view('job/apiInfo')
				}
			]
		}
	]
});

let usersModel = factor('users');
router.beforeEach(async (to, from, next) => {
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
					let menus = [];
					if (permissions) {
						permissions.forEach(permission => {
							if (permission.resources && permission.resources.length > 0) {
								permission.resources.forEach(res => {
									if (res.type === 'page') menus.push(res);
								});
							}
						});
					}
					sessionStorage.setItem('tapdata_permissions', JSON.stringify(menus));
					permissions = menus;
				} else {
					//权限列表为空，说明没有权限进入，执行sign out操作并跳转到登录页面
					Message.error({
						message: 'Permission denied'
					});
					this.$cookie.delete('token');
					next('/login');
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

import Vue from 'vue';
import Router from 'vue-router';

const view = path => () => import(`../view/${path}`);

Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: '/login',
			name: 'login',
			component: view('login')
		},
		{
			path: '/job',
			name: 'job',
			component: view('job/Job')
		},
		{
			path: '/',
			name: 'layout',
			redirect: 'dashboard',
			component: view('layout'),
			children: [
				{
					path: 'dashboard',
					name: 'dashboard',
					component: view('dashboard/Dashboard')
				},
				{
					path: 'clusterManagement',
					component: view('clusterManagement/layout'),
					children: [
						{
							path: '',
							name: 'clusterManagement',
							component: view('clusterManagement/clusterManagement')
						},
						{
							path: 'dailyRecord',
							name: 'dailyRecord',
							component: view('clusterManagement/dailyRecord')
						}
					]
				},
				{
					path: '/dataFlows',
					name: 'DataFlows',
					component: view('task/DataFlows')
				},
				{
					path: '/upload',
					name: 'Upload',
					component: view('Upload')
				},
				{
					path: '/dataMap',
					name: 'DataMap',
					component: view('dataMap/DataMap')
				},
				{
					path: '/apiInfo',
					name: 'ApiInfo',
					component: view('job/apiInfo')
				}
			]
		}
	]
});

router.beforeEach((to, from, next) => {
	next();
});

export default router;

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
					path: '/dashboard',
					name: 'dashboard',
					component: view('dashboard/Dashboard'),
					meta: { requiresAuth: true }
				},
				{
					path: '/oldDashboard',
					name: 'oldDashboard',
					component: view('ExternalLink'),
					meta: { requiresAuth: true, url: '/old/index.html#/dashboard' }
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
					path: '/apiPublic',
					name: 'apiPublic',
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

router.beforeEach((to, from, next) => {
	next();
});

export default router;

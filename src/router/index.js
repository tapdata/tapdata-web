import Layout from '../views/Layout.vue'
import DrsDashboard from '../views/Dashboard/DRS.vue'
import DfsDashboard from '../views/Dashboard/DFS.vue'
import Workbench from '../views/Workbench/Workbench.vue'
import Iframe from '../views/Iframe.vue'
import Error from '../views/Error.vue'
import AgentDownload from '@/views/AgentDownload/AgentPage.vue'
import FastDownload from '@/views/AgentDownload/FastDownload.vue'
import ContactUs from '@/views/ContactUs'
import Purchase from '@/views/Purchase/Purchase'

const routes = [
	{
		path: '/',
		component: Layout,
		meta: {},
		children: [
			{
				path: '/workbench',
				name: 'Workbench',
				component: () => import('../views/Workbench/Workbench.vue'),
				meta: {
					title: '工作台',
					icon: 'workbench'
				},
				children: [
					{
						path: 'notice',
						name: 'WorkbenchNotice',
						component: () => import('../views/Workbench/Notice.vue'),
						meta: {
							title: '公告通知'
						}
					}
				]
			},
			{
				path: '/',
				name: 'Home',
				component: DfsDashboard,
				meta: {
					title: '首页'
				},
				redirect: { name: 'Workbench' },
				hidden: true
			},
			{
				path: '/dashboard',
				name: 'Dashboard',
				component: DfsDashboard,
				meta: {
					title: '运行概览',
					icon: 'dashboard'
				}
			},
			{
				path: '/instance',
				name: 'Instance',
				component: () => import(/* webpackChunkName: "instance" */ '../views/Instance/Instance.vue'),
				meta: {
					title: 'Agent管理',
					showRegion: true,
					icon: 'agent'
				},
				children: [
					{
						path: ':id',
						name: 'InstanceDetails',
						// route level code-splitting
						// this generates a separate chunk (about.[hash].js) for this route
						// which is lazy-loaded when the route is visited.
						component: () => import(/* webpackChunkName: "instance-details" */ '../views/Instance/Details.vue'),
						meta: {
							title: '实例详情'
						}
					}
				]
			},
			{
				path: '/dataflow',
				name: 'Dataflow',
				component: Iframe,
				meta: {
					title: '任务管理',
					link: './tm/#/dataFlows',
					showRegion: true,
					icon: 'task'
				},
				children: [
					{
						path: 'create',
						name: 'DataflowCreate',
						component: Iframe,
						meta: {
							title: '创建任务',
							link: './tm/#/createTask/create'
						}
					},
					{
						path: ':id',
						name: 'DataflowEdit',
						component: Iframe,
						meta: {
							title: '编辑任务',
							link: './tm/#/createTask/:id/edit'
						}
					}
				]
			},
			{
				path: '/connection',
				name: 'Connection',
				component: Iframe,
				meta: {
					title: '连接管理',
					link: './tm/#/connections',
					showRegion: true,
					icon: 'connection'
				},
				children: [
					{
						path: 'create',
						name: 'ConnectionCreate',
						component: Iframe,
						meta: {
							title: '创建连接',
							link: './tm/#/connections/create'
						}
					},
					{
						path: ':id',
						name: 'ConnectionEdit',
						component: Iframe,
						meta: {
							title: '编辑连接',
							link: './tm/#/connections/:id/edit'
						}
					}
				]
			},
			{
				path: '/verification',
				name: 'Verification',
				component: Iframe,
				meta: {
					title: '数据校验',
					link: './tm/#/dataVerification'
				},
				children: [
					{
						path: 'create',
						name: 'VerificationCreate',
						component: Iframe,
						meta: {
							title: '创建校验任务',
							link: './tm/#/dataVerification/create'
						}
					},
					{
						path: 'result',
						name: 'VerificationResult',
						meta: {
							title: '校验结果',
							link: './tm/#/dataVerifyResult'
						}
					},
					{
						path: 'history',
						name: 'VerificationHistory',
						meta: {
							title: '校验历史',
							link: './tm/#/dataVerifyHistory'
						}
					},
					{
						path: ':id',
						name: 'VerificationEdit',
						component: Iframe,
						meta: {
							title: '编辑校验任务',
							link: './tm/#/dataVerification/:id/edit'
						}
					}
				]
			}
		]
	},
	{
		path: '/agentDownload',
		name: 'AgentDownload',
		component: AgentDownload,
		meta: {
			title: 'Agent 下载'
		}
	},
	{
		path: '/fastDownload',
		name: 'FastDownload',
		component: FastDownload,
		meta: {
			title: 'Agent 立即下载'
		}
	},
	{
		path: '/monitor',
		name: 'Monitor',
		component: Iframe,
		meta: {
			title: '任务监控',
			link: './tm/#/job'
		}
	},
	{
		path: '/contactUs',
		name: 'ContactUs',
		component: ContactUs,
		meta: {
			title: '联系我们'
		}
	},
	{
		path: '/500',
		name: '500',
		component: Error,
		meta: {
			isErrorPage: true
		}
	},
	{
		path: '/invalid',
		name: 'Invalid',
		component: Error,
		meta: {
			isErrorPage: true
		}
	},
	{
		path: '/freeze',
		name: 'Freeze',
		component: Error,
		meta: {
			isErrorPage: true
		}
	},
	{
		path: '/off',
		name: 'Off',
		component: Error,
		meta: {
			isErrorPage: true
		}
	}
]
if (process.env.VUE_APP_HIDE_INSTANCE_BTN !== 'true') {
	routes.push({
		path: '/Purchase',
		name: 'Purchase',
		component: Purchase
	})
}

export default routes

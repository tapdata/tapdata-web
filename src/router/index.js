import Vue from 'vue';
import Router from 'vue-router';
import layout from '../view/layout';
import Job from '../view/job/Job';
import Preview from '../view/job/preview';
import echartData from '../view/job/echartData';

import clusterManagement from '../view/clusterManagement/clusterManagement';
import dailyRecord from '../view/clusterManagement/dailyRecord';
import DataFlows from "../view/task/DataFlows";

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/',
			name: 'layout',
			redirect: '/clusterManagement',
			component: layout,
			children: [
				{
					path: 'clusterManagement',
					name: 'clusterManagement',
					component: clusterManagement
				},
				{
					path: 'dailyRecord',
					name: 'dailyRecord',
					component: dailyRecord
				}
			]
		}, {
			path: '/job',
			name: 'job',
			component: Job
		}, {
			path: '/dataFlows',
			name: 'DataFlows',
			component: DataFlows
		}, {
			path: '/echartData',
			name: 'echartData',
			component: echartData

		}, {
			path: '/preview',
			name: 'preview',
			component: Preview
		}
	]
});

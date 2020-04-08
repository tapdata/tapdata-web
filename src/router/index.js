import Vue from 'vue';
import Router from 'vue-router';
import layout from '../view/layout';
import Job from '../view/job/Job';
import Aggregate from '../view/job/aggregate';
import echartData from '../view/job/echartData';
import Test from '../view/job/Test';

import clusterManagement from '../view/clusterManagement/clusterManagement';
import dailyRecord from '../view/clusterManagement/dailyRecord';
import DataFlows from "../view/task/DataFlows";
import metaData from "../view/metaData";

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
			path: '/aggregate',
			name: 'aggregate',
			component: Aggregate
		},{
			path: '/metadata',
			name: 'metadata',
			component: metaData
		},{
			path: '/test',
			name: 'test',
			component: Test
		},
	]
});

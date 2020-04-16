import Vue from 'vue';
import Router from 'vue-router';
import layout from '../view/layout';
import Job from '../view/job/Job';
import Aggregate from '../view/job/Aggregate';
import DataVerify from '../view/job/DataVerify/List';

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
			path: '/aggregate',
			name: 'aggregate',
			component: Aggregate
		},{
			path: '/metadata',
			name: 'metadata',
			component: metaData
		},{
			path: '/dataVerify',
			name: 'DataVerify',
			component: DataVerify
		},
	]
});

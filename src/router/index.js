import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: "/",
			name: "layout",
			redirect: "/clusterManagement",
			component: () => import("../view/layout"),
			children: [
				{
					path: "clusterManagement",
					name: "clusterManagement",
					component: () => import("../view/clusterManagement/clusterManagement")
				},
				{
					path: "dailyRecord",
					name: "dailyRecord",
					component: () => import("../view/clusterManagement/dailyRecord")
				}
			]
		},
		{
			path: "/job",
			name: "job",
			component: () => import("../view/job/Job")
		},
		{
			path: "/dataFlows",
			name: "DataFlows",
			component: () => import("../view/task/DataFlows")
		},
		{
			path: "/metadata",
			name: "metadata",
			component: () => import("../view/metaData")
		},
		{
			path: "/dataVerify",
			name: "DataVerify",
			component: () => import("../view/job/DataVerify/List")
		},
		{
			path: "/upload",
			name: "Upload",
			component: () => import("../components/upload")
		}
	]
});

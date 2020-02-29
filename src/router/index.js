import Vue from 'vue';
import Router from 'vue-router';
import layout from '../view/layout';
import Job from '../view/job/index';

import clusterManagement from '../view/clusterManagement/clusterManagement';
import dailyRecord from '../view/clusterManagement/dailyRecord';
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
    }
  ]
});

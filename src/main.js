// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import moment from 'moment'; // 时间格式化
import store from './vuex'; // 引入全局数据控制
import VueCookie from 'vue-cookie';
import i18n from './i18n/i18n';
import VueBus from 'vue-bus';
import VueClipboard from 'vue-clipboard2';
import factory from './api/factory';

import './plugins/element.js';
import './theme/index.css';

import './components/form-builder';

Vue.config.productionTip = false;
Vue.use(VueCookie);
Vue.use(VueBus);
Vue.use(VueClipboard);

Vue.prototype.$moment = moment;
Vue.prototype.$api = factory;

window.VueCookie = VueCookie;

// Vue.prototype.i18n = window.jQuery.i18n
router.beforeEach((to, from, next) => {
	/* 路由发生变化修改页面title */
	if (to.meta.title) {
		document.title = to.meta.title;
	}
	next();
});

window.App = new Vue({
	el: '#app',
	router,
	store,
	i18n,
	components: { App },
	template: '<App/>'
});

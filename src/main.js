// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router, { childRoutes } from './router';
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
window.ChildRoutes = childRoutes;

window.openDebug = () => {
	localStorage.setItem('tapdata_debug', 'true');
};

if (process.env.NODE_ENV === 'development') {
	window.openDebug();
}

window._TAPDATA_OPTIONS_ = {
	showLang: 'SHOW_LANGUAGE_OPTION',
	logoUrl: require('../static/icon/logo.png'),
	platform: 'DAAS'
};

document.title = 'Tapdata';

window.App = new Vue({
	el: '#app',
	router,
	store,
	i18n,
	components: { App },
	template: '<App/>'
});
//解决浏览器tab切换时，element ui 组件tooltip气泡不消失的问题  #7752
document.addEventListener('visibilitychange', () => {
	setTimeout(() => {
		let ele = document.querySelector(':focus');
		ele && ele.blur();
	}, 50);
});

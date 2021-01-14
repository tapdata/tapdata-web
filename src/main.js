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
import 'element-ui/lib/theme-chalk/index.css';
import './theme/index.css';
import './components/form-builder';
import './directives';
import 'github-markdown-css';

Vue.config.productionTip = false;
Vue.use(VueCookie);
Vue.use(VueBus);
Vue.use(VueClipboard);

Vue.prototype.$moment = moment;
Vue.prototype.$api = factory;
Vue.prototype.$window = window;

window.VueCookie = VueCookie;
window.ChildRoutes = childRoutes;

window.openDebug = () => {
	localStorage.setItem('tapdata_debug', 'true');
};

//因线上存在偶现bug，默认开启
// if (process.env.NODE_ENV === 'development') {
window.openDebug();
// }

window._TAPDATA_OPTIONS_ = {
	logoUrl: require('../static/icon/logo.png'),
	version: 'DAAS_BUILD_NUMBER'
};

let init = settings => {
	window.getSettingByKey = key => {
		let setting = settings.find(it => it.key === key) || {};
		return setting.isArray ? setting.value.split(',') : setting.value;
	};
	let lang = localStorage.getItem('tapdata_localize_lang');
	if (!lang) {
		lang = window.getSettingByKey('DEFAULT_LANGUAGE');
		localStorage.setItem('tapdata_localize_lang', lang || 'en');
	}
	i18n.locale = lang;
	document.title = window.getSettingByKey('PRODUCT_TITLE') || 'Tapdata';
	window.App = new Vue({
		el: '#app',
		router,
		store,
		i18n,
		components: { App },
		template: '<App/>'
	});
};
//获取全局项目设置（OEM信息）
factory('Setting')
	.get()
	.then(({ data }) => {
		// data = [
		// 	//前端相关
		// 	// { category: 'Frontend', key: 'PRODUCT_TITLE', value: 'Tapdata' },
		// 	// { category: 'Frontend', key: 'PRODUCT_LOGO', value: 'logo.svg' },
		// 	{ category: 'Frontend', key: 'SHOW_LANGUAGE', value: 1 },
		// 	{ category: 'Frontend', key: 'DEFAULT_LANGUAGE', value: 'en' },
		// 	{ category: 'Frontend', key: 'SHOW_REGISTER', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_OLD_PAGE', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_PAGE_TITLE', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_LICENSE', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_NOTIFICATION', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_QA_AND_HELP', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_SETTING_BUTTON', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_HOME_BUTTON', value: 1 },
		// 	{ category: 'Frontend', key: 'ALLOW_DOWNLOAD_AGENT', value: 1 },
		// 	{ category: 'Frontend', key: 'USE_CLOUD_MENU', value: 1 },
		// 	{ category: 'Frontend', key: 'SHOW_DK_VERSION', value: 1 }
		// ];
		if (data && data.length) {
			localStorage.setItem('TAPDATA_SETTINGS', JSON.stringify(data));
		}
		init(data || []);
	});

//解决浏览器tab切换时，element ui 组件tooltip气泡不消失的问题  #7752
document.addEventListener('visibilitychange', () => {
	setTimeout(() => {
		let ele = document.querySelector(':focus');
		ele && ele.blur();
	}, 50);
});

Object.defineProperty(Array.prototype, 'findWhere', {
	value: function(attrs) {
		let keys = Object.keys(attrs),
			length = keys.length;
		for (let idx = 0; idx < this.length; idx++) {
			let object = this[idx];
			if (object == null) continue;
			let obj = Object(object),
				finded = true;
			for (let i = 0; i < length; i++) {
				let key = keys[i];
				if (attrs[key] !== obj[key] || !(key in obj)) {
					finded = false;
					break;
				}
			}
			if (finded) return object;
		}
		return null;
	}
});

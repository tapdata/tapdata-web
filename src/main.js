// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import moment from "moment"; // 时间格式化
import store from "./vuex"; // 引入全局数据控制
import VueCookie from "vue-cookie";
import i18n from "./i18n/i18n";
import VueBus from "vue-bus";

import "./plugins/element.js";
import "./theme/index.css";

Vue.config.productionTip = false;
Vue.use(VueCookie);
Vue.use(VueBus);

Vue.prototype.$moment = moment;

// Vue.prototype.i18n = window.jQuery.i18n

new Vue({
	el: "#app",
	router,
	store,
	i18n,
	components: { App },
	template: "<App/>"
});

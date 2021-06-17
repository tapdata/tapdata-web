import Vue from 'vue'
import './plugins/axios'
import './plugins/element'
import './plugins/monent'
import App from './App.vue'
import VueRouter from 'vue-router'
import './assets/app.scss'
import VueClipboard from 'vue-clipboard2'
import { Message } from 'element-ui'

require('./assets/theme/dfs/index.scss')

Vue.config.productionTip = false
Vue.use(VueClipboard)

Vue.use(VueRouter)

Vue.prototype.$checkAgentStatus = callback => {
	window.axios.get('tm/api/Workers/availableAgent').then(data => {
		if (data.result) {
			callback && callback()
		} else {
			Message.error('Agent当前状态异常，请检查')
		}
	})
}

export default function({ routes }) {
	const router = new VueRouter({
		routes
	})
	let loading = null
	router.beforeEach((to, from, next) => {
		next()
	})
	loading = window.loading({ fullscreen: true })
	let count = 0
	let getData = () => {
		Promise.all([window.axios.get('api/tcm/user')])
			.then(([user]) => {
				let userInfo = user
				//移动云DRS环境代码 ---
				if (userInfo.customerType) {
					userInfo.isInternet = userInfo.customerType.includes('互联网')
				}
				// ----
				window.__USER_INFO__ = userInfo

				if (location.href.includes('purchase.html')) {
					location.href = location.href.split('#/')[0] + '#/off'
				}
				setTimeout(() => {
					window.App = new Vue({
						router,
						render: h => h(App)
					}).$mount('#app')
				}, 0)
				loading.close()
			})
			.catch(() => {
				if (count < 4) {
					setTimeout(() => {
						count++
						getData()
					}, 3000)
				} else {
					loading.close()
					window.App = new Vue({
						router,
						render: h => h(App)
					}).$mount('#app')
					location.replace(location.href.split('#/')[0] + '#/500')
				}
			})
	}
	getData()
}
sessionStorage.setItem(
	'TM_CONFIG',
	JSON.stringify({
		DFS_IGNORE_PERMISSION: true,
		DFS_TM_API_PRE_URL: process.env.VUE_APP_TM_PUBLIC_PATH,
		DFS_TCM_API_PRE_URL: process.env.VUE_APP_API_PATH,
		DFS_CREATE_DATAFLOW_BY_FORM: 1
	})
)

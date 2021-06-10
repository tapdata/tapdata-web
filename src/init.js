import Vue from 'vue'
import './plugins/axios'
import './plugins/element'
import App from './App.vue'
import VueRouter from 'vue-router'
import Moment from 'moment'
import './assets/app.scss'
import VueClipboard from 'vue-clipboard2'

require('./assets/theme/dfs/index.scss')

Vue.config.productionTip = false
Vue.prototype.$moment = Moment
Vue.use(VueClipboard)

Vue.use(VueRouter)

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
		Promise.all([
			window.axios.get('api/tcm/user'),
			window.axios.get('api/tcm/region'),
			window.axios.get('api/tcm/product/status')
		])
			.then(([user, region, status]) => {
				let userInfo = user
				//移动云DRS环境代码 ---
				if (userInfo.customerType) {
					userInfo.isInternet = userInfo.customerType.includes('互联网')
				}
				// ----
				window.__USER_INFO__ = userInfo

				let poolList = region.poolList
				let regionMap = {}
				let zoneMap = {}
				poolList.forEach(item => {
					regionMap[item.poolId] = item.poolName
					item.zoneInfo.forEach(zone => {
						zoneMap[zone.zoneCode] = zone.zoneName
					})
				})
				window.__REGION__ = {
					poolList,
					regionMap,
					zoneMap
				}
				if (location.href.includes('purchase.html') && !['3', '4', '8'].includes(status)) {
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
		DFS_TCM_API_PRE_URL: process.env.VUE_APP_API_PATH
	})
)

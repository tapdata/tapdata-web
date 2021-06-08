import Vue from 'vue'
import init from '../init'
import Purchase from '../views/Purchase/Purchase.vue'
import Result from '../views/Purchase/Result.vue'
import Error from '../views/Error.vue'

if (process.env.VUE_APP_HEADER === 'drs') {
	const ConsoleHeader = require('consoleHeader')
	const OrderHeader = require('orderHeader')
	Vue.use(ConsoleHeader.default)
	Vue.use(OrderHeader.default)
}
window.__API_PRE_URL__ = process.env.VUE_APP_API_PATH

const routes = [
	{
		path: '/',
		name: 'Purchase',
		component: Purchase
	},
	{
		path: '/renew/:id',
		name: 'Renew',
		component: Purchase
	},
	{
		path: '/modify/:id',
		name: 'Modify',
		component: Purchase
	},
	{
		path: '/result',
		name: 'Result',
		component: Result
	},
	{
		path: '/500',
		name: 'Error',
		component: Error,
		meta: {
			isPurchase: true,
			isErrorPage: true
		}
	},
	{
		path: '/invalid',
		name: 'Invalid',
		component: Error,
		meta: {
			isErrorPage: true
		}
	},
	{
		path: '/freeze',
		name: 'Freeze',
		component: Error,
		meta: {
			isErrorPage: true
		}
	},
	{
		path: '/off',
		name: 'Off',
		component: Error,
		meta: {
			isErrorPage: true
		}
	}
]
init({
	routes
})

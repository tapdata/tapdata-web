import Vue from 'vue'
import '@/plugins/icon'
import init from '../init'
import routes from '../router'
if (process.env.VUE_APP_HEADER === 'drs') {
	const ConsoleHeader = require('consoleHeader')
	Vue.use(ConsoleHeader.default)
}

window.__API_PRE_URL__ = process.env.VUE_APP_API_PATH

init({
	routes
})

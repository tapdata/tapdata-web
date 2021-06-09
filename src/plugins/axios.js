'use strict'

import Vue from 'vue'
import axios from 'axios'
import { Message } from 'element-ui'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL ||  '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
	baseURL: process.env.VUE_APP_BASE_URL || ''
	// timeout: 60 * 1000, // Timeout
	// withCredentials: true, // Check cross-site Access-Control
}
const removePending = config => {
	let key = JSON.stringify(config)
	let index = pending.findIndex(it => it === key)
	pending.splice(index, 1)
}
const errorCallback = error => {
	if (error && error.response && error.response.status === 401) {
		location.href = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/login'
		return
	} else if (error && error.response && error.response.status === 502) {
		return
	}
	let data = error?.response?.data
	if (error && error.message !== 'cancel' && (!data || data.state !== 'EXCEPTION')) {
		// Message.error('服务器错误:' + error)
		location.replace(location.href.split('#/')[0] + '#/500')
	}
	if (error && error.response && error.response.config) {
		removePending(error.response.config)
	}
	return Promise.reject(error)
}
const _axios = axios.create(config)

const pending = []

const CancelToken = axios.CancelToken
_axios.interceptors.request.use(function(config) {
	let user = window.__USER_INFO__
	if (user) {
		config.headers['X-Token'] = user.token
	}
	config.headers['x-requested-with'] = 'XMLHttpRequest'
	let cancelFunc = null
	config.cancelToken = new CancelToken(c => {
		cancelFunc = c
	})
	let key = JSON.stringify(config)
	if (pending.includes(key)) {
		console.log('Cancel request:', config) //eslint-disable-line
		cancelFunc('cancel')
	} else {
		pending.push(key)
	}
	// console.log('Vue.confirm', Vue.prototype.$confirm, MessageBox.confirm)
	// Vue.prototype.$confirm?.('您确定要跳转至登录吗？', '用户未登录').then(res => {
	// 	if (res) {
	// 		alert(1)
	// 	}
	// })
	return config
}, errorCallback)

// Add a response interceptor
_axios.interceptors.response.use(function(response) {
	return new Promise((resolve, reject) => {
		removePending(response.config)
		let code = response.data.code
		if (code === 'ok') {
			return resolve(response.data.data)
		} else if (code === 'SystemError') {
			// location.replace(location.href.split('#/')[0] + '#/500?message=' + response.data.message)
			Message.error(response.data.message)
			reject(response)
		}
		reject(response)
	})
}, errorCallback)

const Plugin = {}
Plugin.install = function(Vue) {
	Vue.axios = _axios
	window.axios = _axios
	Object.defineProperties(Vue.prototype, {
		axios: {
			get() {
				return _axios
			}
		},
		$axios: {
			get() {
				return _axios
			}
		}
	})
}

Vue.use(Plugin)

export default Plugin

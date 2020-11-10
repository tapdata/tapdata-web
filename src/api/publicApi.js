import axios from 'axios';
import Cookie from 'tiny-cookie';
import { signOut } from '../util/util';
import { Message } from 'element-ui';

let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let CancelToken = axios.CancelToken;
let removePending = config => {
	for (let p in pending) {
		if (pending[p].u === config.url + '&' + config.method) {
			//当前请求在数组中存在时执行函数体
			pending[p].f(); //执行取消操作
			pending.splice(p, 1); //把这条记录从数组中移除
		}
	}
};

axios.interceptors.request.use(
	function(config) {
		let accessToken = Cookie.get('token');
		if (~config.url.indexOf('?')) {
			if (!~config.url.indexOf('access_token')) {
				config.url = `${config.url}&access_token=${accessToken}`;
			}
		} else {
			config.url = `${config.url}?access_token=${accessToken}`;
		}
		removePending(config); //在一个ajax发送前执行一下取消操作
		config.cancelToken = new CancelToken(c => {
			// 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
			pending.push({ u: config.url + '&' + config.method, f: c });
		});
		return config;
	},
	function(error) {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	response => {
		removePending(response); //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
		let data = response.data || {};
		if (response.status === 200 || response.status === 304) {
			switch (data.code) {
				case '110500':
					Message.error({
						message: data.msg
					});
					break;
				case '110400':
					Message.error({
						message: '404，资源不存在'
					});
					break;
				case '110401':
					signOut();
					setTimeout(() => {
						Message.error({
							message: data.msg
						});
					}, 500);
					break;
			}
		}
		data.data['status'] = 200;
		return {
			data: data.data,
			response: response
		};
	},
	error => {
		let rsp = error.response;
		if (rsp) {
			switch (rsp.status) {
				// 用户无权限访问接口
				case 401:
					signOut();
					setTimeout(() => {
						Message.error({
							message: '登录失效'
						});
					}, 500);
					break;
				// 请求的资源不存在
				case 404:
					// 处理404
					Message.error({
						message: '请求的资源不存在'
					});
					break;
				// 服务器500错误
				case 504:
					Message.error({
						message: '服务器异常'
					});
					break;
				case 500:
					Message.error({
						message: '服务器异常'
					});
					break;
			}
		} else if (
			error.code === 'ECONNABORTED' ||
			error.message === 'Network Error' ||
			(error.message && error.message.includes('timeout')) ||
			!window.navigator.onLine
		) {
			setTimeout(() => {
				Message.error({
					message: '网络未连接'
				});
			}, 100);
		} else if (!error.message) {
			return;
		} else {
			return Promise.reject(error);
		}
	}
);

export default class PublicAPI {
	constructor(url) {
		this.url = url;
	}

	count(params) {
		return axios.get(this.url + '/count', { params });
	}

	patch(params) {
		return axios.patch(this.url, params);
	}

	updateById(id, attributes) {
		return axios.patch(this.url + '/' + id, attributes);
	}

	/**
	 *
	 * @param where 	Criteria to match model instances
	 * @param attributes	An object of model property name/value pairs
	 * @return {Promise<AxiosResponse<T>>}
	 */
	update(where, attributes) {
		if (typeof where === 'object') where = JSON.stringify(where);

		return axios.post(this.url + '/update?where=' + where, attributes);
	}

	get(params, filter) {
		if (Array.isArray(params)) {
			filter = typeof filter === 'object' ? JSON.stringify(filter) : filter;
			let qs = filter ? '?filter=' + filter : '';
			return axios.get(this.url + '/' + params.join('/') + qs);
		}
		params = params || {};
		return axios.get(this.url, { params });
	}

	delete(id) {
		return axios.delete(`${this.url}/${id}`);
	}

	post(params) {
		return axios.post(this.url, params);
	}

	findOne(params) {
		params = params || {};
		return axios.get(this.url + '/findOne', { params });
	}
}

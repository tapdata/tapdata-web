import axios from 'axios';
import Cookie from 'tiny-cookie';
import { signOut } from '../util/util';
import { Message } from 'element-ui';

let pending = {}; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let CancelToken = axios.CancelToken;

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
		let key = config.url + '&' + config.method;
		let cancelFunc = null;
		config.cancelToken = new CancelToken(c => {
			cancelFunc = c;
		});
		if (pending[key]) {
			cancelFunc();
		} else {
			pending[key];
		}
		return config;
	},
	function(error) {
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	response => {
		return new Promise((resolve, reject) => {
			let key = response.config.url + '&' + response.config.method;
			delete pending[key];
			let data = response.data;
			if (data.code === 'ok') {
				return resolve({
					data: data.data || data || {},
					response: response
				});
			} else {
				switch (data.code) {
					case '110500':
						reject(response);
						break;
					case '110400':
						Message.error({
							message: '资源不存在'
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
					default:
						reject(response);
				}
			}
		});
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

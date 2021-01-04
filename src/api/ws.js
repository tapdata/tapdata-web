/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/29/20
 * @description
 */
import EventEmitter from '../editor/lib/EventEmitter';
import Cookie from 'tiny-cookie';
import log from '../log';
import factory from './factory';

const workerApi = factory('Workers');

class WSClient extends EventEmitter {
	constructor() {
		super();

		this.autoReconnect = true;
		this.ws = null;
		this.timeoutId = null;
		this.agentId = null;
	}

	/**
	 * reconnect to server
	 */
	reconnect() {
		let self = this;
		if (self.autoReconnect) {
			if (self.timeoutId) {
				clearTimeout(self.timeoutId);
			}
			self.timeoutId = setTimeout(() => {
				self.connect();
			}, 5000);
		}
	}

	/**
	 * connect to server
	 */
	connect() {
		let self = this;

		if (self.ws) {
			self.disconnect();
		}

		let url = this.getUrl();

		//log('WSClient.connect', 'Connect to server: ' + url);
		try {
			let token = self.getToken();
			self.ws = new WebSocket(`${url}?access_token=${token}`);
		} catch (e) {
			//log('WSClient.connect', 'Connect to server fail', e);
			self.reconnect();
			return;
		}
		self.__bindEvent();
	}

	disconnect() {
		if (this.ws !== null) {
			this.ws.removeEventListener('message', this.__message);
			this.ws.removeEventListener('error', this.__error);
			this.ws.removeEventListener('open', this.__open);
			this.ws.removeEventListener('close', this.__close);
			if ([WebSocket.CONNECTING, WebSocket.OPEN].includes(this.ws.readyState)) this.ws.close(1, null);
		}
	}

	__bindEvent() {
		const self = this;

		self.ws.addEventListener(
			'open',
			(self.__open = () => {
				self.handlerOpen();
			})
		);

		self.ws.addEventListener(
			'message',
			(self.__message = msg => {
				self.handlerMessage(msg);
			})
		);

		self.ws.addEventListener(
			'error',
			(self.__error = e => {
				this.handlerError(e);
			})
		);

		self.ws.addEventListener(
			'close',
			(self.__close = () => {
				this.handlerClose();
			})
		);
	}

	handlerOpen() {
		log('Websocket is opened!');
	}

	handlerClose() {
		log('Websocket is closed, ready to reconnect.');
		this.reconnect();
	}

	handlerError(e) {
		window['console'].error('WSClient connection error', e);
		//log("WSClient connection error", e.message);
	}

	handlerMessage(e) {
		let self = this;
		let msg = e.data;
		let message = {};

		//log("WSClient.receive message: " + msg);

		if (typeof msg === 'string' && /^"?\{.*\}"?$/.test(msg)) {
			try {
				message = JSON.parse(msg);
			} catch (e) {
				log(`Parse message fail: ` + msg, e);
			}
		} else {
			window['console'].error('Received message is not JSON Object', msg);
			return;
		}

		if (message.type === 'pipe') {
			let data = message.data || {};
			let eventName = data.type;
			if (eventName) {
				self.emit(eventName, data);
			} else {
				self.emit(message.type, message);
			}
		} else {
			self.emit(message.type, message);
		}
	}

	send(msg) {
		// this.ready(() => {
		msg = typeof msg === 'string' ? msg : JSON.stringify(msg);
		this.ws.send(msg);
		// });
	}

	ready(cb) {
		if (this.ws.readyState == 1) {
			cb && cb();
		} else {
			setTimeout(() => {
				this.ready(cb);
			}, 500);
		}
	}

	sendPipe(msg, receiver) {
		this.send({
			type: 'pipe',
			receiver: receiver,
			data: msg
		});
	}

	/**
	 * @deprecated
	 */
	subscribeDataAgent() {
		let agentId = this.getAgentId();

		this.send({
			type: 'subscribe',
			topic: `${agentId}`
		});
	}

	/**
	 * get current user started data agent
	 * @return {string}
	 */
	getAgentId(cb) {
		let self = this;
		if (self.agentId) {
			cb(null, self.agentId);
		} else {
			workerApi
				.getAvailableAgent()
				.then(result => {
					log('ws.getAgentId:', result);
					if (result && result.data && result.data.result && result.data.result.length > 0) {
						self.agentId = result.data.result[0].process_id;
						cb(null, self.agentId);
					} else {
						cb(new Error('Can not found data agent id'));
					}
				})
				.catch(e => {
					cb(e);
				});
		}
	}

	getToken() {
		return Cookie.get('token');
	}

	getUserId() {
		return Cookie.get('user_id');
	}

	getUrl() {
		let hostname = location.hostname;
		let host = location.host;
		if (['localhost', '127.0.0.1'].includes(hostname)) {
			host = hostname + ':3030';
		}
		return `${location.protocol.indexOf('https') === 0 ? 'wss:' : 'ws:'}//${host}/ws/agent`;
	}
}

const wsClient = new WSClient();
wsClient.connect();

export default wsClient;

export const EventName = {
	EXECUTE_SCRIPT_RESULT: 'execute_script_result',
	PIPE: 'pipe'
};

/*wsClient.on("execute_script", (msg) => {
	// process msg
});*/

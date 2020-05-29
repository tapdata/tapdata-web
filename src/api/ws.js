/**
 * @author lg<lirufei0808@gmail.com>
 * @date 5/29/20
 * @description
 */
import EventEmitter from "../editor/lib/EventEmitter";
import Cookie from "tiny-cookie";
import log from "../log";
import factory from "./factory";

const workerApi = factory("Workers");

class WSClient extends EventEmitter{

	constructor(){
		super();

		this.autoReconnect = true;
		this.ws = null;
		this.timeoutId = null;
	}

	/**
	 * reconnect to server
	 */
	reconnect() {
		let self = this;
		if(self.autoReconnect){
			if(self.timeoutId){
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

		if(self.ws){
			self.disconnect();
		}

		let url = this.getUrl();

		log("WSClient.connect", "Connect to server: " + url);
		try {
			let token = self.getToken();
			self.ws = new WebSocket(`${url}?access_token=${token}`, {
				perMessageDeflate: true
			});

		} catch (e) {
			log("WSClient.connect", "Connect to server fail", e);
			self.reconnect();
			return;
		}
		self.__bindEvent();
	}

	disconnect(){
		if(this.ws !== null){
			this.ws.removeAllListeners("message");
			this.ws.removeAllListeners("error");
			this.ws.removeAllListeners("open");
			this.ws.removeAllListeners("close");
			this.ws.close(1, null);
		}
	}

	__bindEvent(){
		const self = this;
		self.ws.addEventListener("open", () => {
			self.subscribeDataAgent();
		});

		self.ws.addEventListener("message", (e) => {
			let msg = e.data;
			let message = {};

			log("WSClient.receive message: " + msg);

			if(typeof msg === 'string' && /^"?\{.*\}"?$/.test(msg) ){
				try {
					message = JSON.parse(msg);
				} catch (e) {
					log(`Parse message fail: ` + msg, e);
				}
			} else {
				log.error("Received message is not JSON Object", msg);
				return;
			}

			if(message.type === 'subscribe'){
				self.emit(EventName.EXECUTE_SCRIPT, message.data);
			}
		});

		self.ws.addEventListener("error", (e) => {
			log("WSClient connection error", e.message);
		});

		self.ws.addEventListener("close", () => {
			log("Disconnect server.");
			self.reconnect();
		});
	}

	send(msg){
		msg = typeof msg === "string" ? msg : JSON.stringify(msg);
		this.ws.send(msg);
	}

	subscribeDataAgent(){
		let agentId = this.getAgentId();

		this.send({
			type: "subscribe",
			topic: `${agentId}`
		});
	}

	/**
	 * get current user started data agent
	 * @return {string}
	 */
	getAgentId(cb){
		//TODO: get current user started data agent
		workerApi.findOne({
			filter: JSON.stringify({
				where: {
					worker_type : "connector",
					user_id: {
						regexp: `^${this.getUserId()}$`
					}
				},
				fields: {
					process_id: 1
				}
			})
		}).then( worker => {
			if( worker ){
				cb(null, worker.process_id);
			} else {
				cb("Can not found data agent id");
			}
		}).catch(e => {
			cb(e);
		});
		return "";
	}

	getToken(){
		return Cookie.get("token");
	}

	getUserId(){
		return Cookie.get("user_id");
	}

	getUrl() {
		return `${location.protocol.indexOf("https") === 0 ? "wss:" : "ws:"}//${location.host}/ws/agent`;
	}
}

const wsClient = new WSClient();
wsClient.connect();

export default wsClient;

export const EventName = {
	EXECUTE_SCRIPT: "execute_script"
};

/*wsClient.on("execute_script", (msg) => {
	// process msg
});*/

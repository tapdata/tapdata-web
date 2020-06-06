<template>
	<div class="e-debug-log">
		<el-form inline action="javascript: void(0);">
			<el-form-item>
				<el-input class="inputStyle" :placeholder="$t('message.search')" v-model="search" size="mini">
				</el-input>
			</el-form-item>
			<el-form-item>
				<el-button icon="el-icon-search" size="mini" @click="loadNew" :disabled="loading"></el-button>
			</el-form-item>

			<i class="el-icon-loading" v-if="loading"></i>
		</el-form>
		<div class="logBox" v-loading="loading" :element-loading-text="$t('dataFlow.loadLogTip')">
			<LogBox ref="log" :keyword="search" :load="clickLoad" @scroll="logScroll"></LogBox>
		</div>
	</div>
</template>
<script>
import $ from "jquery";
import factory from "../../api/factory";
import LogBox from "@/components/LogBox";

const logsModel = factory("logs");
export default {
	name: "DebugLogs",
	components: {
		LogBox
	},
	props: {
		dataFlow: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			search: "",
			lastLogsId: "",
			firstLogsId: "",
			timer: null,
			loading: false,
			imageUrl: "static/image/noData.svg"
		};
	},

	mounted() {
		let self = this;
		this.loadNew();
		this.timer = setInterval(() => {
			this.loadNew();
		}, 5000);
	},

	methods: {
		logScroll(logContainer) {
			if (logContainer.scrollHeight - logContainer.clientHeight - logContainer.scrollTop < 100) {
				this.loadOld();
			}
		},
		addFilter(filter) {
			if (this.search) {
				filter.where.or = [
					{ threadName: { regexp: this.search } },
					{ loggerName: { regexp: this.search } },
					{ message: { regexp: this.search } },
					{ level: { regexp: this.search } }
				];
			}
			return filter;
		},

		loadOld() {
			let filter = {
				where: {
					"contextMap.dataFlowId": {
						eq: this.dataFlow.id
					},
					id: {
						lt: this.firstLogsId
					}
				},
				order: "millis DESC",
				limit: 100
			};
			this.addFilter(filter);
			this.getLogsData(filter, false, false);
		},
		// 点击加载
		clickLoad() {
			this.loadNew();
		},

		loadNew() {
			let filter = {
				where: {
					"contextMap.dataFlowId": {
						eq: this.dataFlow.id
					}
				},
				order: "millis DESC"
			};

			let reset = self.lastKeyword !== this.search;
			self.lastKeyword = this.search;

			if (!reset && this.lastLogsId) {
				filter.where.id = {
					gt: this.lastLogsId
				};
			} else {
				filter.limit = 100;
			}
			this.addFilter(filter);

			this.getLogsData(filter, reset, true);
		},

		getLogsData(filter, reset = false, prepend = false) {
			// 获取日志

			let self = this;

			if (self.loading) return;

			self.loading = true;
			logsModel
				.get({ filter })
				.then(res => {
					self.loading = false;
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data && res.data.length > 0) {
							if (reset || prepend || !this.lastLogsId) {
								this.lastLogsId = res.data[0].id;
							}
							if (reset || !prepend || !this.firstLogsId) {
								this.firstLogsId = res.data[res.data.length - 1].id;
							}

							this.$refs.log.add({ logs: res.data, prepend, reset });
						}
					}
				})
				.catch(() => {
					self.loading = false;
				});
		}
	},

	destroyed() {
		clearInterval(this.timer);
		this.timer = null;
	}
};
</script>
<style lang="less" scoped>
.e-debug-log {
	width: 100%;
	height: 100%;
	padding: 10px 5px 5px 20px;
	box-sizing: border-box;
	overflow: hidden;

	.el-form {
		position: relative;

		.el-form-item {
			margin-bottom: 0;
		}

		.el-icon-loading {
			right: 10px;
			top: 10px;
			position: absolute;
		}
	}
}
.logBox {
	height: calc(100% - 44px);
	.el-loading-spinner .el-loading-text {
		font-size: 12px;
		color: #333;
	}
}
.inputStyle {
	width: 300px;
}
</style>

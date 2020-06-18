<template>
	<div class="debug" :style="{ width: width + 'px' }" v-show="visible">
		<transition
			name=""
			enter-active-class="animate__animated animate__slideInDown"
			leave-active-class="animate__animated animate__slideOutUp"
		>
			<div class="panel debug-list" v-show="opened">
				<div class="header">
					<h4>{{ $t('editor.cell.processor.script.debug.top_header') }}</h4>
					<i class="el-icon-arrow-up" @click="hide"></i>
				</div>
				<div class="table-panel">
					<el-table
						v-if="!errorMsg"
						border
						highlight-current-row
						ref="table"
						size="mini"
						style="width: 100%"
						height="100%"
						:header-cell-style="headerCellStyle"
						:cell-style="cellStyle"
						:data="logList"
						@current-change="rowHandler"
						v-loading="!logList"
					>
						<el-table-column
							type="index"
							align="center"
							:label="$t('editor.cell.processor.script.debug.order')"
							width="80"
						></el-table-column>
						<el-table-column
							align="center"
							:label="$t('editor.cell.processor.script.debug.status')"
							width="80"
						>
							<template slot-scope="scope">
								<span class="color-danger" v-if="scope.row.status === 'ERROR'">{{
									$t('editor.cell.processor.script.debug.status_error')
								}}</span>
								<span class="color-primary" v-else>{{
									$t('editor.cell.processor.script.debug.status_success')
								}}</span>
							</template>
						</el-table-column>
						<el-table-column
							align="center"
							prop="time"
							:label="$t('editor.cell.processor.script.debug.time') + '(ms)'"
							width="100"
						></el-table-column>
						<el-table-column align="left" :label="$t('editor.cell.processor.script.debug.log')">
							<template slot-scope="scope">
								<div v-html="getFirstLine(scope.row.out)"></div>
							</template>
						</el-table-column>
					</el-table>
					<div class="error-panel">[<span class="color-danger">ERROR</span>] {{ errorMsg }}</div>
				</div>
			</div>
		</transition>
		<transition
			name=""
			enter-active-class="animate__animated animate__slideInUp"
			leave-active-class="animate__animated animate__slideOutDown"
		>
			<div class="panel debug-details" v-show="opened">
				<div class="header">
					<h4>{{ $t('editor.cell.processor.script.debug.bottom_header') }}</h4>
					<ul class="bar">
						<template v-if="selectedLog.index >= 0">
							<li>{{ $t('editor.cell.processor.script.debug.order') }}: {{ selectedLog.index + 1 }}</li>
							<li>
								{{ $t('editor.cell.processor.script.debug.status') }}:
								<span class="color-primary" v-show="!selectedLog.status === 'ERROR'">
									{{ $t('editor.cell.processor.script.debug.status_success') }}
								</span>
								<span class="color-danger" v-show="selectedLog.status === 'ERROR'">
									{{ $t('editor.cell.processor.script.debug.status_error') }}
								</span>
							</li>
							<li>{{ $t('editor.cell.processor.script.debug.time') }}: {{ selectedLog.time }}ms</li>
						</template>
						<li>
							<i class="el-icon-arrow-down" @click="hide"></i>
						</li>
					</ul>
				</div>
				<ul class="details">
					<li>
						<label>{{ $t('editor.cell.processor.script.debug.detail.parameter') }}</label>
						<div class="value">
							<div class="params" v-for="(p, index) in selectedLog.params" :key="index">
								<span>{{ index + 1 }}: </span>
								<pre>{{ stringify(p) }}</pre>
							</div>
						</div>
					</li>
					<li>
						<label>{{ $t('editor.cell.processor.script.debug.detail.return') }}</label>
						<div class="value">
							<pre>{{ stringify(selectedLog.result) }}</pre>
						</div>
					</li>
					<li>
						<label>{{ $t('editor.cell.processor.script.debug.log') }}</label>
						<div class="value">
							<LogBox ref="log"></LogBox>
						</div>
					</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<script>
import log from '../../../log';
import LogBox from '../../../components/LogBox';
// import { EditorEventType } from "../../lib/events";
export default {
	name: 'Debug',
	components: {
		LogBox
	},
	data() {
		let style = {
			padding: 0,
			'line-height': '26px',
			color: 'rgba(102,102,102,1)'
		};
		return {
			logList: null,
			selectedLog: {},

			visible: false,
			opened: false,
			clientWidth: 0,
			sliderWidth: 0,

			headerCellStyle: Object.assign({}, style, {
				background: '#fafafa'
			}),
			cellStyle: style,

			errorMsg: ''
		};
	},
	computed: {
		width() {
			return this.clientWidth - this.sliderWidth - 6;
		}
	},
	mounted() {
		log('Debug Component Mounted');
		let eBodyEl = document.body.getElementsByClassName('e-body')[0];
		let eSideBarRight = document.body.getElementsByClassName('e-sidebar-right')[0];
		this.clientWidth = eBodyEl.clientWidth;
		eBodyEl.appendChild(this.$el);
		this.$nextTick(() => {
			this.sliderWidth = eSideBarRight.clientWidth;
		});
	},
	destroyed() {
		if (this.$el && this.$el.parentNode) {
			this.$el.parentNode.removeChild(this.$el);
		}
	},
	methods: {
		resize(width) {
			this.sliderWidth = width;
		},
		show(receiveMessage) {
			this.visible = true;
			this.$nextTick(() => {
				this.opened = true;
			});
			this.logList = null;
			this.selectedLog = {};
			this.$refs.log.clear();
			this.errorMsg = '';

			receiveMessage(msg => {
				let result = [];

				if (!msg || msg.status === 'ERROR') {
					this.errorMsg = msg.error;
					return;
				}
				result = msg.result;
				this.logList = result.map((item, index) => {
					item.index = index;
					return item;
				});
				if (this.logList.length) {
					this.$nextTick(() => {
						this.$refs.table.setCurrentRow(this.logList[0]);
					});
				}
			});
		},
		hide() {
			this.opened = false;
			setTimeout(() => {
				this.visible = false;
			}, 500);
		},
		getFirstLine(logs) {
			if (logs && logs.length) {
				let _log =
					logs.find(item => {
						return item.level === 'ERROR';
					}) || logs[0];

				return this.$refs.log.formatLog(_log);
			}
			return '';
		},
		rowHandler(row) {
			if (row) {
				this.selectedLog = row;
				this.$nextTick(() => {
					this.$refs.log.add({ logs: row.out, reset: true });
				});
			}
		},
		stringify(value) {
			return JSON.stringify(value, null, 2);
		}
	}
};
</script>

<style lang="less" scoped>
.debug {
	position: absolute;
	left: 0;
	top: 0;
	z-index: 100;
	overflow: hidden;
	height: 100%;

	color: rgba(51, 51, 51, 1);
	font-size: 12px;
	.panel {
		padding: 0 7px;
		height: 50%;
		border-bottom: 1px solid #d3d3d3;
		background: #fafafa;
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			line-height: 35px;
			.bar {
				display: flex;
				color: rgba(153, 153, 153, 1);
				li {
					margin-right: 10px;
				}
			}
			i {
				margin-right: -7px;
				padding: 7px;
				font-size: 14px;
				font-weight: bold;
				color: rgba(51, 51, 51, 1);
			}
		}
	}
	.error-panel {
		height: 100%;
		background: #fff;
		line-height: 30px;
	}
	.debug-list {
		display: flex;
		flex-direction: column;
		.table-panel {
			flex: 1;
			overflow: hidden;
		}
	}
	.debug-details {
		display: flex;
		flex-direction: column;
		border-top: 1px solid #d3d3d3;
		padding-bottom: 16px;
		box-sizing: border-box;
		.details {
			flex: 1;
			display: flex;
			border-top: 1px solid #ebeef5;
			color: rgba(102, 102, 102, 1);
			overflow: hidden;
			li {
				flex: 1;
				display: flex;
				flex-direction: column;
				border-right: 1px solid #ebeef5;
				min-width: 80px;
				&:first-child {
					border-left: 1px solid #ebeef5;
				}
				label {
					padding: 0 10px;
					line-height: 26px;
					height: 26px;
					border-bottom: 1px solid #ebeef5;
				}
				.value {
					flex: 1;
					padding: 5px 10px;
					background: #fff;
					border-bottom: 1px solid #ebeef5;
					white-space: nowrap;
					line-height: 24px;
					.params {
						display: flex;
						span {
							width: 50px;
						}
					}
					pre {
						margin-top: 0;
					}
				}
			}
		}
	}
}
</style>

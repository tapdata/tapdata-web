<template>
	<div class="debug" :style="{ width: width + 'px' }" v-show="visible">
		<transition
			name=""
			enter-active-class="animate__animated animate__slideInDown"
			leave-active-class="animate__animated animate__slideOutUp"
		>
			<div class="panel debug-list" v-show="opened">
				<div class="header">
					<h4>js连接测试</h4>
					<i class="el-icon-arrow-up" @click="hide"></i>
				</div>
				<el-table
					border
					highlight-current-row
					size="mini"
					style="width: 100%"
					:header-cell-style="headerCellStyle"
					:cell-style="cellStyle"
					:data="logList"
					@row-click="rowHandler"
				>
					<el-table-column type="index" align="center" label="连接顺序" width="80"></el-table-column>
					<el-table-column align="center" label="返回状态" width="80">
						<template slot-scope="scope">
							<span class="color-danger" v-if="scope.row.err_out">错误</span>
							<span class="color-primary" v-else>成功</span>
						</template>
					</el-table-column>
					<el-table-column align="center" prop="time" label="耗时(ms)" width="100"></el-table-column>
					<el-table-column align="left" label="日志">
						<template slot-scope="scope">
							<div v-if="scope.row.err_out">{{ getFirstLine(scope.row.err_out) }}</div>
							<div v-else>{{ getFirstLine(scope.row.out) }}</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</transition>
		<transition
			name=""
			enter-active-class="animate__animated animate__slideInUp"
			leave-active-class="animate__animated animate__slideOutDown"
		>
			<div class="panel debug-details" v-show="opened">
				<div class="header">
					<h4>测试详情</h4>
					<ul class="bar">
						<li>连接顺序: 2</li>
						<li>结果: 成功</li>
						<li>耗时: 200ms</li>
						<li>
							<i class="el-icon-arrow-down" @click="hide"></i>
						</li>
					</ul>
				</div>
				<ul class="details">
					<li>
						<label>入参</label>
						<div class="value">
							<div class="params" v-for="(p, index) in selectedLog.params" :key="index">
								<span>参数{{ index + 1 }}: </span>
								<pre>{{ stringify(p) }}</pre>
							</div>
						</div>
					</li>
					<li>
						<label>返回值</label>
						<div class="value">
							<pre>{{ stringify(selectedLog.result) }}</pre>
						</div>
					</li>
					<li>
						<label>日志</label>
						<div class="value" v-html="logs"></div>
					</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<script>
import log from "../../../log";
// import { EditorEventType } from "../../lib/events";
export default {
	name: "Debug",
	data() {
		let style = {
			padding: 0,
			"line-height": "26px",
			color: "rgba(102,102,102,1)"
		};
		return {
			logList: [{}, {}, {}, {}],
			selectedLog: {
				params: [],
				out: "",
				err_out: ""
			},

			visible: false,
			opened: false,
			clientWidth: 0,
			sliderWidth: 0,

			headerCellStyle: Object.assign({}, style, {
				background: "#fafafa"
			}),
			cellStyle: style
		};
	},
	computed: {
		width() {
			return this.clientWidth - this.sliderWidth - 6;
		},
		logs() {
			let str = this.selectedLog.out + "\n" + this.selectedLog.err_out;

			return str.replace(new RegExp("\n", "g"), "<br>");
		}
	},
	mounted() {
		log("Debug Component Mounted");
		let eBodyEl = document.body.getElementsByClassName("e-body")[0];
		let eSideBarRight = document.body.getElementsByClassName("e-sidebar-right")[0];
		this.clientWidth = eBodyEl.clientWidth;
		eBodyEl.appendChild(this.$el);
		this.$nextTick(() => {
			this.sliderWidth = eSideBarRight.clientWidth;
		});
		setTimeout(() => {
			this.logList = [
				{
					params: [
						{
							les: 122,
							arr: [1, 2]
						},
						"ddee",
						[1, 2, { name: "kk" }]
					],
					result: {},
					time: 100,
					out:
						"[INFO]   2020-05-30 12:13:22  [taskScheduler-38]  io.tapdata.Schedule.ConnectorManager -  Found scheduled job test-js-debug_1",
					err_out:
						"[ERROR]   2020-05-30 12:13:58  [taskScheduler-4]  com.tapdata.entity.dataflow.DataFlow -  Schedule data flow test-js-debug failed Failed to call rest api.\n[ERROR]   2020-05-30 12:13:41  [taskScheduler-9]  com.tapdata.entity.dataflow.DataFlow -  Schedule data flow test-js-debug failed Failed to call rest api.\n[ERROR]   2020-05-30 12:13:22  [taskScheduler-38]  io.tapdata.Schedule.ConnectorManager -  Failed to load connection information for the job[job name: test-js-debug_1]."
				}
			];
		}, 1000);
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
		show() {
			this.visible = true;
			this.$nextTick(() => {
				this.opened = true;
			});
		},
		hide() {
			this.opened = false;
			setTimeout(() => {
				this.visible = false;
			}, 500);
		},
		getFirstLine(str) {
			return str ? str.split("\n")[0] : "";
		},
		rowHandler(row, column, event) {
			this.selectedLog = row;
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
	.debug-details {
		display: flex;
		flex-direction: column;
		border-top: 1px solid #d3d3d3;
		.details {
			flex: 1;
			display: flex;
			border-top: 1px solid #ebeef5;
			color: rgba(102, 102, 102, 1);
			padding-bottom: 16px;
			li {
				flex: 1;
				display: flex;
				flex-direction: column;
				border-right: 1px solid #ebeef5;
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
					.params {
						display: flex;
						span {
							width: 50px;
						}
						pre {
							margin-top: 0;
						}
					}
				}
			}
		}
	}
}
</style>

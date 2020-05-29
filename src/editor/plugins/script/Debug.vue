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
					:header-cell-style="headerCellStyle"
					:cell-style="cellStyle"
					size="mini"
					:data="debugList"
					style="width: 100%"
					border
				>
					<el-table-column type="index" align="center" label="连接序号" width="80"></el-table-column>
					<el-table-column align="center" prop="date" label="返回状态" width="80">
						<template slot-scope="scope">
							<span class="color-primary" v-if="scope.status == 1">成功</span>
							<span class="color-danger" v-else>错误</span>
						</template>
					</el-table-column>
					<el-table-column align="center" prop="date" label="耗时(ms)" width="100"></el-table-column>
					<el-table-column align="left" prop="date" label="日志"></el-table-column>
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
						<div class="value"></div>
					</li>
					<li>
						<label>返回值</label>
						<div class="value"></div>
					</li>
					<li>
						<label>日志</label>
						<div class="value"></div>
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
			debugList: [{}, {}, {}, {}],
			debugDetails: null,

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
				}
			}
		}
	}
}
</style>

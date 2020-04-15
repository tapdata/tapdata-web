<template>
	<div class="echartHead">
		<h2>{{title}}</h2>
		<el-popover
				v-if="isIput"
				placement="top-start"
				width="300"
				popper-class="echartsTitle_popover"
				trigger="hover"
				:content="tip">
			<span class="icon iconfont icon-tishi1" slot="reference"></span>
		</el-popover>
		<i class="el-icon-loading" v-if="data.loading"></i>
		<div class="rightOpt fr">
			<el-radio-group v-model="num" size="mini" :class="selectColor" @change="changeRadio" v-if="isScreeing">
				<el-radio-button label="flow">{{$t("dataFlow.rowCount")}}</el-radio-button>
				<el-radio-button label="stage">KB</el-radio-button>
			</el-radio-group>
			<el-radio-group v-model="speed" size="mini" :class="selectColor" @change="changeSpeed" v-if="isSpeed">
				<el-radio-button label="qps">QPS</el-radio-button>
				<el-radio-button label="kbs">KB/S</el-radio-button>
			</el-radio-group>
			<el-radio-group v-model="time" size="mini" :class="selectColor" @change="changeTime" v-if="isIput">
				<el-radio-button label="second" v-if="this.data.type !== 'replicate'">{{$t("dataFlow.second")}}</el-radio-button>
				<el-radio-button label="minute">{{$t("dataFlow.min")}}</el-radio-button>
				<el-radio-button label="hour">{{$t("dataFlow.hour")}}</el-radio-button>
				<el-radio-button label="day">{{$t("dataFlow.day")}}</el-radio-button>
			</el-radio-group>
		</div>
	</div>
</template>
<script>
	export default {
		name: "echartHead",
		props: {
			data: Object,
		},
		data() {
			return {
				title: '',
				tip: '',
				num: 'flow',
				speed: 'qps',
				time: 'minute',
				rowCount: null,
				kbs: null,
				isScreeing: false,
				isIput: false,
				isSpeed: false,
				selectColor: ''
			};
		},
		mounted() {
			this.$nextTick(() => {
				this.title = this.data.title;
				this.tip = this.data.tip;
				this.isScreeing = this.data.isScreeing;
				this.isIput = this.data.isIput;
				this.isSpeed = this.data.isSpeed;

				if(this.data.type === "replicate") {
				  this.time = 'minute';
        }

				this.$emit("twoRadio", this.num, this.data.type);
				this.$emit("getSpeed", this.speed, this.time);
				this.$emit("getTime", this.time, this.data.type);
				if (this.data.type === "screening") {
					this.selectColor = 'screeningColor';
				} else if (this.data.type === "throughput") {
					this.selectColor = 'putColor';
				} else if (this.data.type === "transf") {
					this.selectColor = 'transfColor';
				} else if (this.data.type === "replicate") {
					this.selectColor = 'replicateColor';
				}
			});
		},
		methods: {
			changeRadio(val) {
				this.$emit("twoRadio", val, this.data.type);
			},
			changeSpeed(val) {
				this.$emit("getSpeed", val, this.time);
			},
			changeTime(val) {
				this.$emit("getTime", val, this.data.type);
				this.$emit("getSpeed", this.speed, val);
			}
		}
	};
</script>
<style lang="less" scoped>
	.echartHead {
		height: 38px;
		line-height: 38px;
		padding: 0 10px;
		border-bottom: 1px solid #dcdfe6;
		background-color: #fafafa;

		h2 {
			display: inline-block;
			font-size: 14px;
			color: #333;
		}

		span {
			padding: 0 5px;
			color: #999;
			cursor: pointer;
		}

		span:hover {
			color: #48b6e2;
		}

		.arrow {
			display: inline-block;
			position: relative;
			width: 20px;
			height: 38px;
			overflow: hidden;

			.el-icon-caret-top {
				position: absolute;
				top: 8px;
			}

			.el-icon-caret-bottom {
				position: absolute;
				top: 16px;
			}
		}
	}
</style>
<style lang="less">
	.echartHead {
		.el-radio-button--mini .el-radio-button__inner {
			padding: 7px 10px;
		}

		.el-radio-group {
			padding-left: 10px;
		}

		.screeningColor, .putColor {
			.el-radio-button__orig-radio:checked + .el-radio-button__inner {
				background-color: #48b6e2;
				border-color: #48b6e2;
				box-shadow: -1px 0 0 0 #48B6E2;
			}
		}

		.transfColor {
			.el-radio-button__orig-radio:checked + .el-radio-button__inner {
				background-color: #fb8e00;
				border-color: #fb8e00;
				box-shadow: -1px 0 0 0 #fb8e00;
			}
		}

		.replicateColor {
			.el-radio-button__orig-radio:checked + .el-radio-button__inner {
				background-color: #f56c6c;
				border-color: #f56c6c;
				box-shadow: -1px 0 0 0 #f56c6c;
			}
		}
	}

</style>
